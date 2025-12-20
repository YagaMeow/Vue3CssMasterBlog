<!-- src/components/ArticleEditor.vue -->

<template>
  <div class="editor-container">
    <!-- <div v-if="editor" class="container">
      <drag-handle :editor="editor">
        <div class="custom-drag-handle" />
      </drag-handle>
    </div> -->
    <div class="loading" v-show="myeditor.is_loading.value">Loading...</div>
    <div :class="{
      'character-count': true,
      'character-count--warning': editor.storage.characterCount.characters() === limit,
    }">
      <svg height="20" width="20" viewBox="0 0 20 20">
        <circle r="10" cx="10" cy="10" fill="#c1e3f7" />
        <circle r="5" cx="10" cy="10" fill="transparent" stroke="#68c3f7" stroke-width="10"
          :stroke-dasharray="`calc(${percentage} * 31.4 / 100) 31.4`" transform="rotate(-90) translate(-20)" />
        <circle r="6" cx="10" cy="10" fill="rgb(232, 231, 231)" />
      </svg>

      {{ editor.storage.characterCount.characters() }} / {{ limit }} characters
      <br />
      {{ editor.storage.characterCount.words() }} words
    </div>

    <editor-content :editor="editor" class="editor-text" />
  </div>
</template>

<script lang="ts" setup>
import { Color } from '@tiptap/extension-color'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import Highlight from '@tiptap/extension-highlight'
import Typography from '@tiptap/extension-typography'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { ref, computed, onMounted, onUnmounted, onUpdated, onBeforeUpdate, nextTick, type ImgHTMLAttributes } from 'vue'
import { DragHandle } from '@tiptap-pro/extension-drag-handle-vue-3'
import NodeRange from '@tiptap-pro/extension-node-range'
import '@/assets/editor.scss'
import { useRoute } from 'vue-router'
import { ArticleAPI } from '@/api/api'
import { ElNotification } from 'element-plus'
import 'element-plus/theme-chalk/el-notification.css'
import css from 'highlight.js/lib/languages/css'
import js from 'highlight.js/lib/languages/javascript'
import ts from 'highlight.js/lib/languages/typescript'
import html from 'highlight.js/lib/languages/xml'
import { all, createLowlight } from 'lowlight'
import Table from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import Image from '@tiptap/extension-image'
import Text from '@tiptap/extension-text'
import Dropcursor from '@tiptap/extension-dropcursor'
import { Mathematics } from '@tiptap-pro/extension-mathematics'
import CharacterCount from '@tiptap/extension-character-count'
import 'katex/dist/katex.min.css'
import { useAppStore } from '@/pinia'

const props = defineProps({
  uri: {
    type: String,
    default: '',
  },
})

const appStore = useAppStore()

onMounted(() => {
  myeditor.init()
})

const myeditor = {
  container: null as null | HTMLElement,
  is_loading: ref(true),
  if_scaler_visible: false,
  image: null as null | HTMLElement,
  init() {
    this.container = document.querySelector(".editor-container")
  },
  async show() {
    if (appStore.edit_mode) this.is_loading.value = false
    const res = await ArticleAPI.getByUri(props.uri)

    _data.id = res.data.id
    _data.title = res.data.title
    _data.content = res.data.content

    // window.addEventListener('keydown', saveHandler)
    editor.commands.setContent(JSON.parse(_data.content))
    this.is_loading.value = false
    this.addImgHook()
  },
  addImgHook() {
    this.container?.addEventListener('click', this.handleProxy)
  },
  resizeIMG(p: number) {
    if (myeditor.image) {
      const width = myeditor.image.offsetWidth
      const heigt = myeditor.image.offsetHeight
      const old_p = myeditor.image.getAttribute("s")
      myeditor.image.style.width = (width / parseInt(old_p as string) * p).toString() + 'px'
      myeditor.image.style.height = (heigt / parseInt(old_p as string) * p).toString() + 'px'
      myeditor.image.setAttribute("s", p.toString())
    }
  },
  handleProxy(e: PointerEvent) {
    if ((e.target as HTMLElement).nodeName == 'IMG' && !myeditor.if_scaler_visible) {
      myeditor.if_scaler_visible = true
      myeditor.image = e.target as HTMLElement
      myeditor.image.style.transformOrigin = "top left"
      // const reg = /(?<=\()(.+?)(?=\))/g
      // console.log(myeditor.image.style.transform.match(reg))
      const sp = myeditor.image.getAttribute("s")
      if (!myeditor.image.hasAttribute("s"))
        myeditor.image.setAttribute("s", "1")
      appStore.show_scaler?.({ x: e.x, y: e.y }, parseInt(sp as string))
      // appStore.show_scaler?.({ x: dom.offsetWidth + dom.offsetLeft, y: dom.offsetHeight + dom.offsetTop})
    } else if (myeditor.if_scaler_visible) {
      console.log(e.target)
      appStore.hide_scaler?.()
      myeditor.if_scaler_visible = false
    }
  },
  reset() {
    console.log('reset')
    editor.commands.clearContent()
    this.is_loading.value = true
  },
}
appStore.show_post = myeditor.show.bind(myeditor)
appStore.hide_post = myeditor.reset.bind(myeditor)
appStore.resize_image = myeditor.resizeIMG.bind(myeditor)

const percentage = computed(() =>
  Math.round((100 / limit) * editor.storage.characterCount.characters()),
)

const lowlight = createLowlight(all)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

const limit = 200000 // 字数限制

const editor = new Editor({
  extensions: [
    Mathematics,
    Text,
    Dropcursor,
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle,
    Highlight,
    Typography,
    Placeholder.configure({
      placeholder: 'Type something ...',
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Table.configure({
      resizable: true,
    }),
    Image,
    TableRow,
    TableHeader,
    TableCell,
    NodeRange.configure({
      // allow to select only on depth 0
      // depth: 0,
      key: null,
    }),
    StarterKit,
    CharacterCount.configure({
      limit: limit,
    }),
  ],
})

interface Article {
  id: number
  title: string
  content: string
  uri: string
}

const route = useRoute()

const _data: Article = {
  id: 0,
  title: '',
  content: '',
  uri: props.uri ? props.uri : '',
}

const saveHandler = (e: KeyboardEvent) => {
  if (
    (e.key === 's' || e.key === 'S') &&
    (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)
  ) {
    e.preventDefault()
    ArticleAPI.update({
      title: _data.title,
      content: JSON.stringify(editor.getJSON()),
      uri: _data.uri,
    }).then(() => {
      ElNotification({
        title: '保存成功',
        message: '文章已保存',
        type: 'success',
        duration: 2000,
      })
    })
  }
}

const editable = ref(true)
editor.setEditable(false)

function onImageUploadClick() {
  const imageInput = document.querySelector<HTMLInputElement>('#imageInput')
  if (imageInput) {
    imageInput.click()
  }
}

function onImageSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      editor.chain().focus().setImage({ src: imageUrl }).run()
    }
    reader.readAsDataURL(file)
  }
}

defineExpose({
  editor,
})
</script>
<style lang="scss" scoped>
.editor-container {
  padding: 0;
  position: relative;
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;

  .editor-text {
    margin: 0.5rem 1rem;
    color: #fff;

    :deep(p.is-empty::before) {
      content: attr(data-placeholder) !important;
      color: #aaa;
      position: absolute;
    }

    overflow-x: hidden;
  }

  .character-count {
    color: #fff;
    font-size: 2rem;
  }

  .loading {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    font-size: 3rem;
    color: #fff;
  }
}

.character-count {
  background-color: rgba($color: #fff, $alpha: .4);
  padding: 1rem;
  border-radius: 1rem;
  backdrop-filter: blur(.1rem);
  z-index: 10;
  position: fixed;
  bottom: 1rem;
  right: 0;
  // left: calc(50% + 350px);
  align-items: center;
  color: var(--gray-5);
  display: flex;
  font-size: 0.75rem;
  gap: 0.5rem;
  margin: 1.5rem;

  box-shadow: 0px 0px 5px #fff;

  svg {
    color: var(--purple);
  }

  &--warning,
  &--warning svg {
    color: var(--red);
  }

  &:hover {
    svg {
      opacity: 0;
      transition: all ease .2s;
    }

    background-color: rgba($color: #fff, $alpha: .05);
    backdrop-filter: blur(0);
    color: transparent;
    transition: all ease .2s;
  }
}

.tools {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #444 !important;
  position: sticky !important;
  top: 0;
  z-index: 999;
}

.control-group {
  background-color: #fff;

  .button-group {
    width: 700px;
    padding: 10px;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;

    button {
      width: 20px;
      height: 20px;
      border-radius: 0.4rem;
      border: none;
      background-color: lightpurple;
      color: #555;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;

      &.is-active {
        background-color: purple;
        color: white;
      }

      &:hover {
        filter: brightness(1.1);
      }

      &:disabled {
        background-color: #ccc;
        color: #aaa;
        cursor: not-allowed;
      }
    }
  }

  .title {
    max-width: 700px;
    margin: 0 auto;
    padding-left: 10px;
  }
}

.empty-node {
  background-color: black;
  border-radius: 0.4rem;
  font-size: 0.85rem;
  padding: 0.25em 0.3em;
}

.back-icon {
  vertical-align: middle;
  height: 1em;
}

.back-button-container {
  background-color: #eee;
}

.back-button {
  margin: 0 auto;
  max-width: 700px;
  padding: 10px;
  border: 1px solid #eee;

  border-top: none;
  border-left: none;
  border-bottom-right-radius: 10%;
  cursor: pointer;
}

@media screen and (max-aspect-ratio: 0.8/1) {
  .loading {
    font-size: 7rem !important;
  }
}
</style>

<style lang="scss">
/* Basic editor styles */
.tiptap {
  :first-child {
    margin-top: 0;
  }

  img {
    display: block;
  }

  [data-resize-handle] {
    position: absolute;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 2px;
    z-index: 10;

    &:hover {
      background: rgba(0, 0, 0, 0.8);
    }

    /* Corner handles */
    &[data-resize-handle='top-left'],
    &[data-resize-handle='top-right'],
    &[data-resize-handle='bottom-left'],
    &[data-resize-handle='bottom-right'] {
      width: 8px;
      height: 8px;
    }

    &[data-resize-handle='top-left'] {
      top: -4px;
      left: -4px;
      cursor: nwse-resize;
    }

    &[data-resize-handle='top-right'] {
      top: -4px;
      right: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-left'] {
      bottom: -4px;
      left: -4px;
      cursor: nesw-resize;
    }

    &[data-resize-handle='bottom-right'] {
      bottom: -4px;
      right: -4px;
      cursor: nwse-resize;
    }

    /* Edge handles */
    &[data-resize-handle='top'],
    &[data-resize-handle='bottom'] {
      height: 6px;
      left: 8px;
      right: 8px;
    }

    &[data-resize-handle='top'] {
      top: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='bottom'] {
      bottom: -3px;
      cursor: ns-resize;
    }

    &[data-resize-handle='left'],
    &[data-resize-handle='right'] {
      width: 6px;
      top: 8px;
      bottom: 8px;
    }

    &[data-resize-handle='left'] {
      left: -3px;
      cursor: ew-resize;
    }

    &[data-resize-handle='right'] {
      right: -3px;
      cursor: ew-resize;
    }
  }

  [data-resize-state='true'] [data-resize-wrapper] {
    outline: 1px solid rgba(0, 0, 0, 0.25);
    border-radius: 0.125rem;
  }
}
</style>
