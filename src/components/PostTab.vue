<template>
  <div class="mask-container _fullscreen" v-show="visible">
    <div ref="maskEl" class="mask _fullscreen" @click="handleClose"></div>

    <div ref="containerEl" class="tab-container" :class="{ 'is-fullscreen': hasScaled }">
      <header class="tab-header">
        <div class="tab-title-info">
          <template v-if="!appStore.edit_mode">
            <h2 class="title">{{ appStore.post_data.title || '未命名文章' }}</h2>
            <p class="info">{{ formatDate(String(appStore.post_data.created_at)) }}</p>
          </template>
          <div v-else class="edit-fields">
            <label class="field">
              <span class="field-label">标题</span>
              <input v-model="draftTitle" type="text" placeholder="请输入标题…" />
            </label>
            <label class="field">
              <span class="field-label">URI</span>
              <input v-model="draftUri" type="text" placeholder="请输入 uri…" />
            </label>
          </div>
        </div>

        <div class="tab-actions">
          <MyButton v-if="appStore.edit_mode" v-show="isAuth" class="action-btn confirm" title="保存并关闭"
            @click="handleConfirm">
            <span class="glyph">✓</span>
          </MyButton>
          <MyButton v-else-if="isAuth" class="action-btn" :title="editable ? '完成编辑' : '编辑文章'" @click="handleEdit">
            <svg-icon :icon-class="editable ? 'no-edit' : 'edit'" />
          </MyButton>
          <MyButton class="action-btn" :title="hasScaled ? '退出全屏' : '进入全屏'" @click="toggleFullscreen">
            <svg-icon icon-class="fullscreen" />
          </MyButton>
          <MyButton class="action-btn close" title="关闭" @click="handleClose">
            <span class="glyph">×</span>
          </MyButton>
        </div>
      </header>

      <div v-if="tags.length || canEditTags" class="tag-bar">
        <TransitionGroup name="tag" tag="ul" class="tag-list">
          <li v-for="(tag, i) in tags" :key="tag.name" class="tag-chip" :class="{ removable: canEditTags }"
            :style="{ '--i': i }" :role="canEditTags ? 'button' : undefined" :tabindex="canEditTags ? 0 : undefined"
            :title="canEditTags ? `删除标签：${tag.name}` : tag.name" @click="canEditTags && removeTag(tag.name)"
            @keydown.enter.prevent="canEditTags && removeTag(tag.name)">
            <span>{{ tag.name }}</span>
            <svg-icon v-if="canEditTags" icon-class="bin" class="tag-bin" />
          </li>
        </TransitionGroup>

        <form v-if="canEditTags" class="tag-add" @submit.prevent="addTag">
          <input v-show="showTagInput" ref="tagInputEl" v-model="newTag" type="text" placeholder="新标签…"
            @keydown.esc.prevent="cancelTagInput" @blur="cancelTagInput" />
          <button v-show="!showTagInput" type="button" class="tag-add-btn" title="添加标签" @click="showTagInput = true">
            +
          </button>
        </form>
      </div>

      <div class="tab-content">
        <ContextMenu :menu="[{ label: 'Large' }, { label: 'Middle' }, { label: 'Small' }]">
          <PostPage ref="editorRef" :uri="String(appStore.post_data.uri)" />
        </ContextMenu>
      </div>

      <div v-if="editable && editorReady" class="tools">
        <div class="button-group">
          <template v-for="(item, i) in TOOLBAR" :key="item.key">
            <span v-if="i && item.group !== TOOLBAR[i - 1].group" class="divider"></span>
            <button type="button" :title="item.label" :aria-label="item.label"
              :disabled="toolbarState[item.key]?.disabled" :class="{ 'is-active': toolbarState[item.key]?.active }"
              :style="{ '--i': i }" @click="runTool(item)">
              <svg-icon :icon-class="item.icon" />
            </button>
          </template>
        </div>
      </div>

      <input ref="imageInputEl" class="hidden-input" type="file" accept="image/*" @change="onImageSelected" />
      <input ref="coverInputEl" class="hidden-input" type="file" accept="image/*" @change="onCoverSelected" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import gsap from 'gsap'
import type { Editor } from '@tiptap/vue-3'
import ContextMenu from '@/components/ui/contextmenu.vue'
import MyButton from '@/components/ui/btn.vue'
import PostPage from '@/views/PostPage/PostPage.vue'
import SvgIcon from './SvgIcon.vue'
import { useAppStore } from '@/pinia'
import { ArticleAPI } from '@/api/api'
import { getAuth } from '@/api/user'
import { elasticEase2, formatDate } from '@/utils/utils'

gsap.registerEase('myEase2', elasticEase2)

const appStore = useAppStore()

const visible = ref(false)
const isAuth = ref(false)
const editable = ref(false)
const hasScaled = ref(false)
const showTagInput = ref(false)
const newTag = ref('')
const draftTitle = ref('')
const draftUri = ref('')

const containerEl = useTemplateRef<HTMLElement>('containerEl')
const maskEl = useTemplateRef<HTMLElement>('maskEl')
const editorRef = useTemplateRef<{ editor: Editor }>('editorRef')
const tagInputEl = useTemplateRef<HTMLInputElement>('tagInputEl')
const imageInputEl = useTemplateRef<HTMLInputElement>('imageInputEl')
const coverInputEl = useTemplateRef<HTMLInputElement>('coverInputEl')

const editor = computed(() => editorRef.value?.editor)
const editorReady = computed(() => !!editor.value)
const tags = computed(() => {
  console.log(appStore.post_data.tags ?? [])
  return appStore.post_data.tags ?? []
})
/** 仅作者在编辑已存在的文章时才允许增删标签 */
const canEditTags = computed(
  () => isAuth.value && editable.value && !appStore.edit_mode && !!appStore.post_data.id,
)

interface ToolDef {
  key: string
  icon: string
  label: string
  /** 同一组的按钮之间不显示分隔线 */
  group: number
  run: (ed: Editor) => void
  isActive?: (ed: Editor) => boolean
  canRun?: (ed: Editor) => boolean
}

const TOOLBAR: ToolDef[] = [
  {
    key: 'bold',
    icon: 'bold',
    label: '加粗',
    group: 1,
    run: (ed) => {
      ed.chain().focus().toggleBold().run()
    },
    isActive: (ed) => ed.isActive('bold'),
    canRun: (ed) => ed.can().chain().focus().toggleBold().run(),
  },
  {
    key: 'italic',
    icon: 'italic',
    label: '斜体',
    group: 1,
    run: (ed) => {
      ed.chain().focus().toggleItalic().run()
    },
    isActive: (ed) => ed.isActive('italic'),
    canRun: (ed) => ed.can().chain().focus().toggleItalic().run(),
  },
  {
    key: 'strike',
    icon: 'strikethrough',
    label: '删除线',
    group: 1,
    run: (ed) => {
      ed.chain().focus().toggleStrike().run()
    },
    isActive: (ed) => ed.isActive('strike'),
    canRun: (ed) => ed.can().chain().focus().toggleStrike().run(),
  },
  {
    key: 'code',
    icon: 'code',
    label: '行内代码',
    group: 1,
    run: (ed) => {
      ed.chain().focus().toggleCode().run()
    },
    isActive: (ed) => ed.isActive('code'),
    canRun: (ed) => ed.can().chain().focus().toggleCode().run(),
  },
  {
    key: 'color',
    icon: 'font-color',
    label: '文字颜色',
    group: 1,
    run: (ed) => {
      ed.chain().focus().setColor('#958DF1').run()
    },
    isActive: (ed) => ed.isActive('textStyle', { color: '#958DF1' }),
  },
  {
    key: 'paragraph',
    icon: 'paragraph',
    label: '正文',
    group: 2,
    run: (ed) => {
      ed.chain().focus().setParagraph().run()
    },
    isActive: (ed) => ed.isActive('paragraph'),
  },
  {
    key: 'bulletList',
    icon: 'unordered-list',
    label: '无序列表',
    group: 2,
    run: (ed) => {
      ed.chain().focus().toggleBulletList().run()
    },
    isActive: (ed) => ed.isActive('bulletList'),
  },
  {
    key: 'orderedList',
    icon: 'ordered-list',
    label: '有序列表',
    group: 2,
    run: (ed) => {
      ed.chain().focus().toggleOrderedList().run()
    },
    isActive: (ed) => ed.isActive('orderedList'),
  },
  {
    key: 'codeBlock',
    icon: 'code',
    label: '代码块',
    group: 2,
    run: (ed) => {
      ed.chain().focus().toggleCodeBlock().run()
    },
    isActive: (ed) => ed.isActive('codeBlock'),
  },
  {
    key: 'quote',
    icon: 'quote',
    label: '引用',
    group: 2,
    run: (ed) => {
      ed.chain().focus().toggleBlockquote().run()
    },
    isActive: (ed) => ed.isActive('blockquote'),
  },
  {
    key: 'separator',
    icon: 'separator',
    label: '分割线',
    group: 2,
    run: (ed) => {
      ed.chain().focus().setHorizontalRule().run()
    },
  },
  {
    key: 'break',
    icon: 'text-wrap',
    label: '换行',
    group: 2,
    run: (ed) => {
      ed.chain().focus().setHardBreak().run()
    },
  },
  {
    key: 'undo',
    icon: 'undo',
    label: '撤销',
    group: 3,
    run: (ed) => {
      ed.chain().focus().undo().run()
    },
    canRun: (ed) => ed.can().chain().focus().undo().run(),
  },
  {
    key: 'redo',
    icon: 'redo',
    label: '重做',
    group: 3,
    run: (ed) => {
      ed.chain().focus().redo().run()
    },
    canRun: (ed) => ed.can().chain().focus().redo().run(),
  },
  {
    key: 'image',
    icon: 'image',
    label: '插入图片',
    group: 4,
    run: () => {
      pickImage()
    },
  },
  {
    key: 'cover',
    icon: 'image',
    label: '上传封面',
    group: 4,
    run: () => {
      pickCover()
    },
  },
]

/** 编辑器状态快照：让工具栏的激活/禁用态随选区实时刷新 */
const toolbarState = ref<Record<string, { active: boolean; disabled: boolean }>>({})

function syncToolbarState() {
  const ed = editor.value
  if (!ed) return
  const next: Record<string, { active: boolean; disabled: boolean }> = {}
  for (const def of TOOLBAR) {
    next[def.key] = {
      active: def.isActive?.(ed) ?? false,
      disabled: def.canRun ? !def.canRun(ed) : false,
    }
  }
  toolbarState.value = next
}

function runTool(def: ToolDef) {
  const ed = editor.value
  if (ed) def.run(ed)
}

let detachEditorState: (() => void) | null = null

watch(
  editor,
  (ed) => {
    detachEditorState?.()
    detachEditorState = null
    if (!ed) return
    const sync = () => syncToolbarState()
    ed.on('transaction', sync)
    ed.on('selectionUpdate', sync)
    detachEditorState = () => {
      ed.off('transaction', sync)
      ed.off('selectionUpdate', sync)
    }
    sync()
  },
  { immediate: true },
)

watch(editable, syncToolbarState)

watch(showTagInput, async (open) => {
  if (!open) return
  await nextTick()
  tagInputEl.value?.focus()
})

function notifyError(e: unknown) {
  appStore.notify?.(e instanceof Error ? e.message : String(e))
}

let animator: gsap.core.Timeline | null = null

async function show() {
  if (animator?.isActive()) animator.kill()

  isAuth.value = await getAuth()
    .then(() => true)
    .catch(() => false)
  appStore.show_detail = true

  if (appStore.edit_mode) {
    draftTitle.value = ''
    draftUri.value = ''
    editable.value = true
    editor.value?.setEditable(true)
  }

  visible.value = true
  await nextTick()

  animator = gsap
    .timeline()
    .fromTo(
      containerEl.value,
      { scale: 0.85, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'myEase2',
        onComplete: () => appStore.show_post?.(),
      },
    )
    .fromTo(
      maskEl.value,
      { opacity: 0, backdropFilter: 'blur(0rem)' },
      { opacity: 1, backdropFilter: 'blur(1.2rem)', duration: 0.7, ease: 'power3.out' },
      '<',
    )

  appStore.audio_controller.showposttab.play()
}

function hide(immediate?: () => void, next?: () => void) {
  if (animator?.isActive()) animator.kill()
  immediate?.()
  animator = gsap
    .timeline()
    .to(containerEl.value, { scale: 0.85, opacity: 0, duration: 0.35, ease: 'power3.in' })
    .to(
      maskEl.value,
      {
        opacity: 0,
        backdropFilter: 'blur(0rem)',
        duration: 0.3,
        ease: 'power3.out',
        onComplete: () => {
          visible.value = false
          appStore.show_detail = false
          appStore.hide_post?.()
          next?.()
        },
      },
      '<',
    )
  appStore.audio_controller.hideposttab.play()
}

function reset() {
  appStore.post_data = { title: '', uri: '', id: 0, created_at: '', tags: [] }
  draftTitle.value = ''
  draftUri.value = ''
  editable.value = false
  showTagInput.value = false
  newTag.value = ''
  hasScaled.value = false
  toolbarState.value = {}
  const ed = editor.value
  if (ed) {
    ed.setEditable(false)
    ed.commands.clearContent()
  }
}

function closeWithReset() {
  appStore.hide_tab?.(
    () => { },
    () => {
      reset()
      appStore.edit_mode = false
    },
  )
}

async function savePost() {
  await ArticleAPI.update({
    title: appStore.post_data.title as string,
    content: JSON.stringify(editor.value?.getJSON() ?? {}),
    uri: appStore.post_data.uri as string,
  })
}

async function createPost() {
  const { data } = await ArticleAPI.create({
    title: draftTitle.value,
    content: JSON.stringify(editor.value?.getJSON() ?? {}),
    uri: draftUri.value,
  })
  const article = {
    title: data.title,
    uri: data.uri,
    created_at: data.created_at,
    id: data.id,
    tags: [],
    cover: { cover_url: '', width: 0, height: 0 },
  }
  if (appStore.current_mode === 'diagram') appStore.update_diagram?.(article)
  else if (appStore.current_mode === 'list') appStore.update_list?.(article)
}

async function handleClose() {
  if (!appStore.edit_mode && editable.value) {
    try {
      await savePost()
    } catch (e) {
      return notifyError(e)
    }
  }
  closeWithReset()
}

async function handleConfirm() {
  if (!appStore.edit_mode) return
  try {
    await createPost()
  } catch (e) {
    return notifyError(e)
  }
  closeWithReset()
}

async function handleEdit() {
  try {
    await getAuth()
  } catch (e) {
    return notifyError(e)
  }
  if (animator?.isActive()) return

  editable.value = !editable.value
  editor.value?.setEditable(editable.value)

  if (!editable.value) {
    try {
      await savePost()
    } catch (e) {
      notifyError(e)
    }
  }
}

async function removeTag(name: string) {
  try {
    await ArticleAPI.removeTag({ id: appStore.post_data.id, tag: name })
    appStore.post_data.tags = tags.value.filter((tag) => tag.name !== name)
  } catch (e) {
    notifyError(e)
  }
}

async function addTag() {
  const name = newTag.value.trim()
  if (!name) return
  try {
    await ArticleAPI.addTag({ id: appStore.post_data.id, tag: name })
    newTag.value = ''
    showTagInput.value = false
  } catch (e) {
    notifyError(e)
  }
}

function cancelTagInput() {
  showTagInput.value = false
  newTag.value = ''
}

function toggleFullscreen() {
  hasScaled.value = !hasScaled.value
}

function pickImage() {
  imageInputEl.value?.click()
}

function pickCover() {
  coverInputEl.value?.click()
}

async function onImageSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const { data } = await ArticleAPI.upload(file)
    const src = `${import.meta.env.VITE_BASE_API}/api${data.url.middle}`
    editor.value?.chain().focus().setImage({ src }).run()
  } catch (e) {
    notifyError(e)
  } finally {
    input.value = ''
  }
}

async function onCoverSelected(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  try {
    const { data } = await ArticleAPI.uploadCover({
      uri: String(appStore.post_data.uri),
      file,
    })
    let cover = String(data.cover.cover_url).replace('covers', 'covers/webp')
    cover = cover.slice(0, cover.lastIndexOf('.')) + '-400w.webp'
    const img = document.querySelector<HTMLImageElement>(
      `div[uri="${appStore.post_data.uri}"] .post-content img`,
    )
    img?.setAttribute('src', `${import.meta.env.VITE_BASE_API}/api${cover}`)
    appStore.notify?.('上传成功')
  } catch (e) {
    notifyError(e)
  } finally {
    input.value = ''
  }
}

function onKeydown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') {
    e.preventDefault()
    handleClose()
    return
  }
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
    e.preventDefault()
    if (!editable.value) return
    savePost()
      .then(() => appStore.notify?.('保存成功'))
      .catch(notifyError)
  }
}

appStore.show_tab = show
appStore.hide_tab = hide

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  detachEditorState?.()
  animator?.kill()
})
</script>

<style lang="scss" scoped>
.mask-container {
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  .mask {
    opacity: 0;
    backdrop-filter: blur(0rem);
    background: radial-gradient(circle at 50% 38%, rgba(28, 28, 36, 0.72), rgba(0, 0, 0, 0.92));
  }



  .tab-container {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    width: min(88rem, 94vw);
    height: min(88rem, 92dvh);
    padding: 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 2rem;
    background: linear-gradient(155deg, rgba(52, 52, 62, 0.92), rgba(16, 16, 20, 0.96));
    box-shadow:
      0 3rem 8rem rgba(0, 0, 0, 0.6),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(2rem) saturate(1.4);
    transform: scale(0.85);
    opacity: 0;
    transition:
      width 0.1s cubic-bezier(0.22, 1, 0.36, 1),
      height 0.1s cubic-bezier(0.22, 1, 0.36, 1),
      border-radius 0.1s ease;


    &.is-fullscreen {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;

      .tools {
        left: 1.2rem;
      }
    }

    button {
      font-family: inherit;
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }
  }

  @media screen and (max-aspect-ratio:1/1) {
    .tab-container {
      transition:
        width 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        height 0.5s cubic-bezier(0.22, 1, 0.36, 1),
        border-radius 0.5s ease;
    }
  }

  .tab-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.2rem 1.4rem 0.4rem;
  }

  .tab-title-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5rem;
    min-width: 0;

    .title {
      overflow: hidden;
      font-size: 2.2rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      color: #fff;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .info {
      font-size: 1.4rem;
      color: rgba(255, 255, 255, 0.55);
    }

    .edit-fields {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .field {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.8rem;

      .field-label {
        font-size: 1.3rem;
        color: rgba(255, 255, 255, 0.45);
        white-space: nowrap;
      }

      input {
        flex: 1;
        min-width: 0;
        padding: 0.4rem 0;
        font-size: 1.8rem;
        color: #fff;
        background: transparent;
        border: none;
        outline: none;
      }

      &::after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;
        height: 0.1rem;
        background: linear-gradient(90deg, #8b5cf6, #22d3ee);
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 0.25s ease-out;
      }

      &:focus-within::after {
        transform: scaleX(1);
      }
    }
  }

  .tab-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;

    .action-btn {
      width: 3.6rem;
      height: 3.6rem;
      border-radius: 0.9rem;
      font-size: 1.8rem;
      color: #fff;
      transition:
        transform 0.2s ease,
        background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.16);
        transform: translateY(-0.2rem);
      }

      &:active {
        transform: scale(0.94);
      }

      :deep(.svg-icon) {
        width: 1.8rem;
        height: 1.8rem;
      }
    }

    .confirm:hover {
      background-color: #2f9e63;
    }

    .close:hover {
      background-color: #d6455d;
    }

    .glyph {
      line-height: 1;
    }
  }

  .tag-bar {
    display: flex;
    flex: none;
    align-items: center;
    gap: 0.8rem;
    min-width: 0;
    min-height: 3.2rem;
    padding: 0 1.4rem;
    user-select: none;
  }

  .tag-list {
    display: flex;
    flex: 1;
    align-items: center;
    gap: 0.6rem;
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    overflow-x: auto;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .tag-chip {
    --i: 0;
    display: inline-flex;
    flex: none;
    align-items: center;
    gap: 0.6rem;
    min-height: 2.8rem;
    padding: 0 1.8rem 0 1.2rem;
    font-size: 1.4rem;
    color: #fff;
    background: linear-gradient(150deg, #2b2b34, #16161b);
    clip-path: polygon(0 0, calc(100% - 0.9rem) 0, 100% 50%, calc(100% - 0.9rem) 100%, 0 100%);

    &.removable {
      cursor: pointer;
      transition:
        background 0.2s ease,
        transform 0.2s ease;

      .tag-bin {
        opacity: 0.45;
      }

      &:hover {
        background: linear-gradient(150deg, #b3455a, #7a1f30);
        transform: translateX(0.2rem);

        .tag-bin {
          opacity: 1;
        }
      }
    }

    .tag-bin {
      width: 1.2rem;
      height: 1.2rem;
      transition: opacity 0.2s ease;
    }
  }

  .tag-add {
    display: flex;
    flex: none;
    align-items: center;

    input {
      width: 10rem;
      padding: 0.5rem 1rem;
      font-size: 1.4rem;
      color: #fff;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.16);
      border-radius: 999px;
      outline: none;

      &:focus {
        border-color: rgba(139, 92, 246, 0.8);
      }
    }

    .tag-add-btn {
      width: 2.8rem;
      height: 2.8rem;
      font-size: 2rem;
      line-height: 1;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      background: rgba(255, 255, 255, 0.08);
      border: 1px dashed rgba(255, 255, 255, 0.3);
      border-radius: 999px;
      transition:
        background 0.2s ease,
        color 0.2s ease,
        transform 0.25s ease;

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.18);
        transform: rotate(90deg);
      }
    }
  }

  .tab-content {
    position: relative;
    flex: 1;
    min-height: 0;
    margin: 0.6rem;
    overflow: auto;
    background: #121216;
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1.2rem;
  }

  .tools {
    position: absolute;
    top: 50%;
    left: -5rem;
    max-height: 100%;
    transform: translateY(-50%);

    .button-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      max-height: 100%;
      padding: 0.2rem;
      overflow-y: auto;
      scrollbar-width: none;

      &::-webkit-scrollbar {
        display: none;
      }
    }

    button {
      --i: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4rem;
      height: 4rem;
      color: #e8e8ef;
      cursor: pointer;
      background: rgba(28, 28, 34, 0.78);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 1.1rem;
      backdrop-filter: blur(1rem);
      animation: post-tool-in 0.32s cubic-bezier(0.22, 1, 0.36, 1) backwards;
      animation-delay: calc(var(--i) * 28ms);
      transition:
        transform 0.18s ease,
        background-color 0.18s ease,
        color 0.18s ease;

      :deep(.svg-icon) {
        width: 1.9rem;
        height: 1.9rem;
      }

      &:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.16);
        transform: translateY(-0.2rem) scale(1.05);
      }

      &:active:not(:disabled) {
        transform: scale(0.94);
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.35;
      }

      &.is-active {
        color: #fff;
        background: linear-gradient(150deg, #7c3aed, #4c1d95);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    .divider {
      width: 60%;
      height: 1px;
      margin: 0.1rem 0;
      background: rgba(255, 255, 255, 0.16);
    }
  }

  .hidden-input {
    display: none;
  }
}

.tag-enter-from,
.tag-leave-to {
  opacity: 0;
  transform: translateX(-0.8rem) scale(0.9);
}

.tag-enter-active,
.tag-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

.tag-leave-active {
  position: absolute;
}

.tag-move {
  transition: transform 0.3s ease;
}

@keyframes post-tool-in {
  from {
    opacity: 0;
    transform: translateX(-0.8rem) scale(0.85);
  }
}

@media (hover: none) {
  .tag-chip.removable .tag-bin {
    opacity: 0.7;
  }
}

@media (max-width: 820px),
(max-height: 540px),
(max-aspect-ratio: 1/1) and (max-width: 1100px) {
  .mask-container .tab-container {
    width: 94vw;
    height: 88dvh;
    padding: 8px;
    gap: 6px;
    border-radius: 20px;

    &.is-fullscreen {
      width: 100vw;
      height: 100dvh;
      border-radius: 0;
    }

    .tab-header {
      gap: 8px;
      padding: 10px 12px 4px;
    }

    .tab-title-info {
      gap: 4px;

      .title {
        font-size: 18px;
      }

      .info {
        font-size: 12px;
      }

      .edit-fields {
        gap: 6px;
      }

      .field .field-label {
        font-size: 12px;
      }

      .field input {
        font-size: 16px;
      }
    }

    .tab-actions {
      gap: 6px;

      .action-btn {
        width: 42px;
        height: 42px;
        border-radius: 12px;
        font-size: 16px;

        :deep(.svg-icon) {
          width: 20px;
          height: 20px;
        }
      }

      .glyph {
        font-size: 20px;
      }
    }

    .tag-bar {
      gap: 6px;
      min-height: 36px;
      padding: 0 12px;
    }

    .tag-list {
      gap: 6px;
    }

    .tag-chip {
      gap: 4px;
      min-height: 32px;
      padding: 0 20px 0 14px;
      font-size: 14px;

      .tag-bin {
        width: 14px;
        height: 14px;
      }
    }

    .tag-add {
      input {
        width: 120px;
        font-size: 14px;
      }

      .tag-add-btn {
        width: 32px;
        height: 32px;
        font-size: 18px;
      }
    }

    .tab-content {
      margin: 0 4px;
      border-radius: 14px;
    }

    .tools {
      position: static;
      max-height: none;
      margin: 0 4px 4px;
      transform: none;

      .button-group {
        flex-direction: row;
        justify-content: flex-start;
        gap: 6px;
        padding: 6px;
        overflow-x: auto;
        overflow-y: hidden;
        background: rgba(0, 0, 0, 0.35);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 14px;
      }

      button {
        flex: none;
        width: 44px;
        height: 44px;
        border-radius: 12px;
        animation: none;

        :deep(.svg-icon) {
          width: 22px;
          height: 22px;
        }
      }

      .divider {
        width: 1px;
        height: 24px;
        margin: 0 2px;
      }
    }
  }
}
</style>
