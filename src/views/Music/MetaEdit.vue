<template>
  <Teleport to="body">
    <div v-if="modelValue" class="meta-mask" @click.self="close">
      <div class="meta-dialog">
        <div class="meta-header">
          <span class="meta-title">编辑歌曲信息</span>
          <span class="meta-close" @click="close">&times;</span>
        </div>
        <div class="meta-body">
          <div class="cover-row">
            <img class="cover-preview" :src="coverPreview" alt="cover" />
            <div class="cover-actions">
              <button class="ghost-btn" type="button" @click="coverInput?.click()">更换封面</button>
              <div class="hint">支持 JPG / PNG / GIF，未选择则保留原封面</div>
              <input ref="coverInput" type="file" accept="image/*" hidden @change="onCoverChange" />
            </div>
          </div>

          <label class="field">
            <span>曲目标题</span>
            <input v-model="form.title" type="text" placeholder="输入曲目标题" />
          </label>
          <label class="field">
            <span>艺术家</span>
            <input v-model="form.artist" type="text" placeholder="输入艺术家名称" />
          </label>
          <label class="field">
            <span>专辑</span>
            <input v-model="form.album" type="text" placeholder="输入专辑名称" />
          </label>
          <div class="field-row">
            <label class="field">
              <span>年份</span>
              <input v-model="form.year" type="text" placeholder="例如 2024" />
            </label>
            <label class="field">
              <span>曲目号</span>
              <input v-model="form.track" type="text" placeholder="例如 1" />
            </label>
          </div>
          <div class="field-row">
            <label class="field">
              <span>流派</span>
              <input v-model="form.genre" type="text" placeholder="例如 摇滚" />
            </label>
            <label class="field">
              <span>BPM</span>
              <input v-model="form.bpm" type="text" placeholder="例如 120" />
            </label>
          </div>
          <label class="field">
            <span>作曲家</span>
            <input v-model="form.composer" type="text" placeholder="作曲家名称" />
          </label>
          <label class="field">
            <span>Mood</span>
            <input v-model="form.mood" type="text" placeholder="e.g. Energetic, Chill, Dark" />
          </label>
          <label class="field">
            <span>Featuring Artist</span>
            <input v-model="form.featuring" type="text" placeholder="e.g. ft. Artist Name" />
          </label>
          <label class="field">
            <span>Copyright</span>
            <input v-model="form.copyright" type="text" placeholder="© 2024 Label Name" />
          </label>
          <label class="field">
            <span>评论</span>
            <textarea v-model="form.comment" rows="2" placeholder="可选评论"></textarea>
          </label>
          <label class="field">
            <span>歌词</span>
            <textarea v-model="form.lyrics" rows="8" placeholder="支持 LRC 时间标签或纯文本歌词"></textarea>
          </label>
          <div class="lyric-actions">
            <button class="ghost-btn" type="button" @click="lrcInput?.click()">上传 .lrc 文件</button>
            <span class="hint">{{ lyricFile ? lyricFile.name : '上传后会覆盖上方歌词内容' }}</span>
            <input ref="lrcInput" type="file" accept=".lrc,.txt" hidden @change="onLrcChange" />
          </div>
        </div>
        <div class="meta-footer">
          <button class="ghost-btn" type="button" @click="close">取消</button>
          <button class="primary-btn" type="button" :disabled="saving" @click="handleSave">
            {{ saving ? '保存中…' : '保存' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { MusicAPI } from '@/api/music'
import { player, resolveUrl, type LyricLine, type Song } from './player'

const props = defineProps<{ modelValue: boolean; song: Song | null }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'saved'): void }>()

const DEFAULT_COVER = resolveUrl('/api/covers/jpg/cover.jpg')
const coverInput = ref<HTMLInputElement | null>(null)
const lrcInput = ref<HTMLInputElement | null>(null)
const saving = ref(false)
const coverFile = ref<File | null>(null)
const lyricFile = ref<File | null>(null)
const coverObjectUrl = ref('')

const emptyForm = () => ({
  title: '', artist: '', album: '', year: '', track: '', genre: '', composer: '',
  bpm: '', mood: '', featuring: '', copyright: '', comment: '', lyrics: '',
})
const form = ref(emptyForm())

const coverPreview = computed(() => coverObjectUrl.value || resolveUrl(props.song?.cover_url) || DEFAULT_COVER)

function lyricsToText(lines: LyricLine[]): string {
  return lines
    .map((line) => {
      const total = Math.max(line.time, 0)
      const min = Math.floor(total / 60)
      const sec = Math.floor(total % 60)
      const csec = Math.round((total - Math.floor(total)) * 100)
      const pad = (n: number) => String(n).padStart(2, '0')
      return `[${pad(min)}:${pad(sec)}.${pad(csec)}]${line.content}`
    })
    .join('\n')
}

function close() {
  emit('update:modelValue', false)
}

async function load() {
  coverFile.value = null
  lyricFile.value = null
  if (coverObjectUrl.value) {
    URL.revokeObjectURL(coverObjectUrl.value)
    coverObjectUrl.value = ''
  }
  const s = props.song
  form.value = {
    ...emptyForm(),
    title: s?.title || '',
    artist: s?.artist || '',
    album: s?.album || '',
    year: s?.year || '',
    track: s?.track || '',
    genre: s?.genre || '',
    composer: s?.composer || '',
    bpm: s?.bpm || '',
    mood: s?.mood || '',
    featuring: s?.featuring || '',
    copyright: s?.copyright || '',
    comment: s?.comment || '',
  }
  if (!s) return
  try {
    const resp = (await MusicAPI.getDetail(s.id)) as unknown as { data: { lyrics: LyricLine[] } }
    form.value.lyrics = lyricsToText(resp?.data?.lyrics || [])
  } catch {
    form.value.lyrics = ''
  }
}

watch(() => props.modelValue, (visible) => {
  if (visible) void load()
})

function onCoverChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  coverFile.value = file
  if (coverObjectUrl.value) URL.revokeObjectURL(coverObjectUrl.value)
  coverObjectUrl.value = URL.createObjectURL(file)
}

function onLrcChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  lyricFile.value = file
  const reader = new FileReader()
  reader.onload = () => {
    form.value.lyrics = String(reader.result || '')
  }
  reader.readAsText(file, 'utf-8')
}

async function handleSave() {
  if (!props.song) return
  if (!form.value.title.trim()) {
    ElMessage.warning('请输入曲目标题')
    return
  }
  saving.value = true
  try {
    await MusicAPI.update(props.song.id, form.value, coverFile.value || undefined, lyricFile.value || undefined)
    await player.loadList()
    ElMessage.success('已保存')
    emit('saved')
    close()
  } catch (err) {
    ElMessage.error('保存失败：' + ((err as Error).message || '未知错误'))
  } finally {
    saving.value = false
  }
}
</script>
<style lang="scss" scoped>
.meta-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, .65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.meta-dialog {
  width: min(680px, 94vw);
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #1d1d20, #101012);
  border: 1px solid rgba(255, 255, 255, .12);
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, .6);
  color: #eee;
  overflow: hidden;
}

.meta-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, .08);

  .meta-title {
    font-size: 1.15rem;
    letter-spacing: .1rem;
  }

  .meta-close {
    cursor: pointer;
    font-size: 1.6rem;
    line-height: 1;
    color: #aaa;
    transition: color .2s;

    &:hover {
      color: #fff;
    }
  }
}

.meta-body {
  padding: 20px 24px;
  overflow-y: auto;

  .cover-row {
    display: flex;
    gap: 18px;
    align-items: center;
    margin-bottom: 20px;

    .cover-preview {
      width: 120px;
      height: 120px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid rgba(255, 255, 255, .15);
      background-color: #000;
      flex-shrink: 0;
    }

    .cover-actions {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 14px;

    > span {
      font-size: .85rem;
      color: #9a9a9a;
      letter-spacing: .05rem;
    }

    input,
    textarea {
      width: 100%;
      box-sizing: border-box;
      background-color: rgba(255, 255, 255, .06);
      border: 1px solid rgba(255, 255, 255, .12);
      border-radius: 8px;
      padding: 9px 12px;
      color: #fff;
      font-size: .92rem;
      outline: none;
      transition: border-color .2s, background-color .2s;

      &::placeholder {
        color: #666;
      }

      &:focus {
        border-color: #71dcf7;
        background-color: rgba(113, 220, 247, .08);
      }
    }

    textarea {
      resize: vertical;
      font-family: inherit;
      line-height: 1.4;
    }
  }

  .field-row {
    display: flex;
    gap: 16px;

    .field {
      flex: 1;
    }
  }

  .lyric-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 6px;
  }

  .hint {
    font-size: .78rem;
    color: #777;
  }
}

.meta-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, .08);
}

.ghost-btn,
.primary-btn {
  cursor: pointer;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: .9rem;
  border: 1px solid rgba(255, 255, 255, .18);
  background-color: transparent;
  color: #ddd;
  transition: all .2s;

  &:hover {
    border-color: #71dcf7;
    color: #fff;
  }
}

.primary-btn {
  background-color: #71dcf7;
  border-color: #71dcf7;
  color: #04222b;
  font-weight: 600;

  &:hover {
    background-color: #8ee6fb;
    color: #04222b;
  }

  &:disabled {
    opacity: .6;
    cursor: not-allowed;
  }
}

// ---- 移动端适配 ----
@media (max-width: 1024px) {
  .meta-dialog {
    width: 94vw;
    max-height: 92vh;
  }

  .meta-header {
    padding: 14px 16px;

    .meta-title {
      font-size: 16px;
      letter-spacing: 1px;
    }

    .meta-close {
      font-size: 24px;
    }
  }

  .meta-body {
    padding: 16px;

    .cover-row {
      gap: 14px;
      margin-bottom: 16px;

      .cover-preview {
        width: 100px;
        height: 100px;
      }

      .cover-actions .hint {
        font-size: 12px;
      }
    }

    .field {
      gap: 5px;
      margin-bottom: 12px;

      > span {
        font-size: 13px;
      }

      input,
      textarea {
        font-size: 14px;
        padding: 9px 11px;
      }
    }

    .field-row {
      flex-direction: column;
      gap: 0;
    }

    .hint {
      font-size: 12px;
    }

    .lyric-actions {
      flex-wrap: wrap;
      gap: 8px;
    }
  }

  .meta-footer {
    padding: 12px 16px;
  }

  .ghost-btn,
  .primary-btn {
    font-size: 14px;
    padding: 8px 16px;
  }
}
</style>