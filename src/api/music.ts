import service from "@/utils/request"

export interface MusicItem {
  id: number
  title: string
  artist: string
  album: string
  year: string
  track: string
  genre: string
  composer: string
  bpm: string
  mood: string
  featuring: string
  copyright: string
  comment: string
  cover_url: string
  audio_url: string
  lyrics_url: string
  duration: number
  file_size: number
  created_at: string
}

export interface LyricLine {
  time: number
  content: string
}

export interface MusicMeta {
  title: string
  artist: string
  album: string
  year: string
  track: string
  genre: string
  composer: string
  bpm: string
  mood: string
  featuring: string
  copyright: string
  comment: string
  lyrics: string
}

export const MusicAPI = {
  // Download an audio file as raw bytes (used to build a same-origin blob URL).
  getMusic(url: string) {
    return service({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
      timeout: 120000,
    })
  },
  getLrc(url: string) {
    return service({
      url: url,
      method: "GET",
    })
  },
  getList() {
    return service({
      url: "/api/music",
      method: "GET",
    })
  },
  getDetail(id: number) {
    return service({
      url: `/api/music/${id}`,
      method: "GET",
    })
  },
  upload(file: File | Blob, lyric?: File | Blob) {
    const formData = new FormData()
    formData.append("file", file)
    if (lyric) formData.append("lyric", lyric)
    return service({
      url: "/api/music/upload",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    })
  },
  // Update metadata, and optionally replace the cover image and lyrics.
  update(id: number, meta: MusicMeta, cover?: File | Blob, lyric?: File | Blob) {
    const formData = new FormData()
    Object.entries(meta).forEach(([key, value]) => formData.append(key, value ?? ""))
    if (cover) formData.append("cover", cover)
    if (lyric) formData.append("lyric", lyric)
    return service({
      url: `/api/music/${id}`,
      method: "PUT",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000,
    })
  },
  remove(id: number) {
    return service({
      url: `/api/music/${id}`,
      method: "DELETE",
      data: {},
    })
  },
}