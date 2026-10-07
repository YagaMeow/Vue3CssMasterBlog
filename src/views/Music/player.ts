import { computed, ref } from "vue"
import { MusicAPI, type MusicItem, type LyricLine } from "@/api/music"

export type Song = MusicItem
export type { LyricLine }

const API_BASE = (import.meta.env.VITE_BASE_API as string) || ""

// resolveUrl turns a server relative path such as /api/covers/x.jpg into an
// absolute URL the browser can load from the API host.
export function resolveUrl(url?: string): string {
  if (!url) return ""
  if (/^(https?:)?\/\//i.test(url) || url.startsWith("data:") || url.startsWith("blob:")) return url
  return API_BASE.replace(/\/$/, "") + (url.startsWith("/") ? url : "/" + url)
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const min = Math.floor(seconds / 60)
  const sec = Math.floor(seconds % 60)
  return `${min}:${sec.toString().padStart(2, "0")}`
}

function createPlayer() {
  const songs = ref<Song[]>([])
  const currentIndex = ref(-1)
  const playing = ref(false)
  const loading = ref(false)
  const uploading = ref(false)
  const current = ref(0)
  const duration = ref(0)
  const lyrics = ref<LyricLine[]>([])
  const currentLrcIdx = ref(0)
  // -1 = 上一首, 1 = 下一首，用于切换动画方向
  const direction = ref(1)

  const audio = new Audio()
  audio.preload = "auto"

  let audioContext: AudioContext | null = null
  let analyser: AnalyserNode | null = null
  let freqData: Uint8Array | null = null
  let objectUrl: string | null = null
  let session = 0

  const currentSong = computed(() => (currentIndex.value >= 0 ? songs.value[currentIndex.value] ?? null : null))
  const progress = computed(() => (duration.value > 0 ? Math.min(current.value / duration.value, 1) : 0))

  function initAnalyser() {
    if (audioContext) return
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContext = new Ctor()
      const source = audioContext.createMediaElementSource(audio)
      analyser = audioContext.createAnalyser()
      analyser.fftSize = 4096
      source.connect(analyser)
      analyser.connect(audioContext.destination)
      freqData = new Uint8Array(analyser.frequencyBinCount)
    } catch (e) {
      console.warn("[Music] visualiser unavailable:", e)
      audioContext = null
      analyser = null
      freqData = null
    }
  }

  function getFrequencyData(): Uint8Array | null {
    if (!analyser || !freqData) return null
    analyser.getByteFrequencyData(freqData)
    return freqData
  }

  function updateLrcIndex() {
    if (!lyrics.value.length) {
      currentLrcIdx.value = 0
      return
    }
    let idx = 0
    for (let i = 0; i < lyrics.value.length; i++) {
      if (lyrics.value[i].time <= current.value + 0.05) idx = i
      else break
    }
    currentLrcIdx.value = idx
  }

  function syncDuration() {
    if (Number.isFinite(audio.duration) && audio.duration > 0) duration.value = audio.duration
  }

  audio.addEventListener("timeupdate", () => {
    current.value = audio.currentTime
    updateLrcIndex()
  })
  audio.addEventListener("loadedmetadata", syncDuration)
  audio.addEventListener("durationchange", syncDuration)
  audio.addEventListener("play", () => (playing.value = true))
  audio.addEventListener("pause", () => (playing.value = false))
  audio.addEventListener("ended", () => void next())
  audio.addEventListener("error", () => {
    playing.value = false
    console.error("[Music] audio error", audio.error)
  })

  async function loadList(): Promise<Song[]> {
    const resp = (await MusicAPI.getList()) as unknown as { data: Song[] }
    songs.value = resp?.data ?? []
    return songs.value
  }

  async function loadAudio(song: Song) {
    loading.value = true
    try {
      const resp = (await MusicAPI.getMusic(song.audio_url)) as unknown
      const buffer =
        resp instanceof ArrayBuffer ? resp : (resp as { data: ArrayBuffer })?.data
      const blob = new Blob([buffer], { type: "audio/mpeg" })
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      objectUrl = URL.createObjectURL(blob)
      audio.src = objectUrl
      audio.load()
    } finally {
      loading.value = false
    }
  }

  async function playIndex(index: number, autoplay = true, dir?: number) {
    if (index < 0 || index >= songs.value.length) return
    if (index === currentIndex.value && audio.src) {
      if (autoplay) await toggle()
      return
    }

    if (typeof dir === "number" && dir !== 0) direction.value = dir > 0 ? 1 : -1
    else if (currentIndex.value >= 0) direction.value = index > currentIndex.value ? 1 : -1
    else direction.value = 1

    initAnalyser()
    void audioContext?.resume().catch(() => {})

    const mySession = ++session
    currentIndex.value = index
    const song = songs.value[index]
    current.value = 0
    duration.value = song.duration || 0
    currentLrcIdx.value = 0
    lyrics.value = []

    MusicAPI.getDetail(song.id)
      .then((resp: unknown) => {
        if (mySession !== session) return
        lyrics.value = (resp as { data: { lyrics: LyricLine[] } })?.data?.lyrics ?? []
        updateLrcIndex()
      })
      .catch(() => {})

    await loadAudio(song)
    if (mySession !== session) return
    if (autoplay) {
      try {
        await audio.play()
      } catch (e) {
        console.error("[Music] play failed", e)
      }
    }
  }

  async function toggle() {
    if (currentIndex.value === -1) {
      if (songs.value.length) await playIndex(0)
      return
    }
    const song = currentSong.value
    if (!audio.src && song) await loadAudio(song)
    initAnalyser()
    void audioContext?.resume().catch(() => {})
    if (audio.paused) {
      try {
        await audio.play()
      } catch (e) {
        console.error("[Music] play failed", e)
      }
    } else {
      audio.pause()
    }
  }

  async function next() {
    if (!songs.value.length) return
    const index = currentIndex.value < 0 ? 0 : (currentIndex.value + 1) % songs.value.length
    await playIndex(index, true, 1)
  }

  async function prev() {
    if (!songs.value.length) return
    const index = currentIndex.value < 0 ? songs.value.length - 1 : (currentIndex.value - 1 + songs.value.length) % songs.value.length
    await playIndex(index, true, -1)
  }

  function seekRatio(ratio: number) {
    const total = duration.value || (Number.isFinite(audio.duration) ? audio.duration : 0)
    if (!total || !Number.isFinite(total)) return
    const time = Math.min(Math.max(ratio, 0), 1) * total
    audio.currentTime = time
    current.value = time
    updateLrcIndex()
  }

  async function upload(file: File, lyric?: File) {
    uploading.value = true
    try {
      const resp = (await MusicAPI.upload(file, lyric)) as unknown
      await loadList()
      return resp
    } finally {
      uploading.value = false
    }
  }

  async function remove(id: number) {
    await MusicAPI.remove(id)
    const wasCurrent = currentSong.value?.id === id
    await loadList()
    if (wasCurrent) {
      audio.pause()
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      audio.removeAttribute("src")
      audio.load()
      currentIndex.value = -1
      current.value = 0
      duration.value = 0
      lyrics.value = []
      currentLrcIdx.value = 0
    }
  }

  function dispose() {
    session++
    audio.pause()
    // The AudioContext and its MediaElementSource are intentionally kept alive:
    // a media element may only ever have one source node, so rebuilding it after
    // the page is remounted would throw. Pausing is enough to stop playback.
  }

  return {
    songs,
    currentIndex,
    playing,
    loading,
    uploading,
    current,
    duration,
    lyrics,
    currentLrcIdx,
    currentSong,
    direction,
    progress,
    loadList,
    playIndex,
    toggle,
    next,
    prev,
    seekRatio,
    upload,
    remove,
    getFrequencyData,
    updateLrcIndex,
    initAnalyser,
    dispose,
  }
}

export type Player = ReturnType<typeof createPlayer>

export const player = createPlayer()