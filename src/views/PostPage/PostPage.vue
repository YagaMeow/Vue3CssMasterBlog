<!-- src/components/ArticleEditor.vue -->

<template>
  <div class="editor-container">
    <!-- <div v-if="editor" class="container">
      <drag-handle :editor="editor">
        <div class="custom-drag-handle" />
      </drag-handle>
    </div> -->
    <div class="loading" v-show="myeditor.is_loading.value">Loading...</div>
    <div class="tools control-group _null" v-if="editable">
      <div class="button-group">
        <!-- <button @click="editor.setEditable(false)">ban</button> -->
        <button @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }">
          <svg-icon iconClass="bold"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }">
          <svg-icon iconClass="italic"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }">
          <svg-icon iconClass="strikethrough"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleCode().run()"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }">
          <svg-icon iconClass="code"></svg-icon>
        </button>
        <!-- <button @click="editor.chain().focus().unsetAllMarks().run()">Clear marks</button>
        <button @click="editor.chain().focus().clearNodes().run()">Clear nodes</button> -->
        <button @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }">
          <svg-icon iconClass="paragraph"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }" id="bullet-list">
          <svg-icon iconClass="unordered-list"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }">
          <svg-icon iconClass="ordered-list"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }">
          <svg-icon iconClass="code"></svg-icon>
        </button>
        <button @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }">
          <svg-icon iconClass="quote"></svg-icon>
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()">
          <svg-icon iconClass="separator"></svg-icon>
        </button>
        <button @click="editor.chain().focus().setHardBreak().run()">
          <svg-icon iconClass="text-wrap"></svg-icon>
        </button>
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()"
          id="undo">
          <svg-icon iconClass="undo"></svg-icon>
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()"
          id="redo">
          <svg-icon iconClass="redo"></svg-icon>
        </button>
        <button @click="editor.chain().focus().setColor('#958DF1').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { color: '#958DF1' }) }">
          <svg-icon iconClass="font-color"></svg-icon>
        </button>
        <button @click="onImageUploadClick">
          <svg-icon iconClass="image"></svg-icon>
        </button>
        <input id="imageInput" type="file" accept="image/*" style="display: none" @change="onImageSelected" />
      </div>
    </div>
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
import { ref, computed, onMounted, onUnmounted, onUpdated, onBeforeUpdate } from 'vue'
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
import { sv } from 'element-plus/es/locales.mjs'
import { getAuth } from '@/api/user'
import { useAppStore } from '@/pinia'

const props = defineProps({
  uri: {
    type: String,
    default: '',
  },
})

const appStore = useAppStore()

const myeditor = {
  is_loading: ref(true),
  init() { },
  async show() {
    if (appStore.edit_mode) this.is_loading.value = false
    const res = await ArticleAPI.getByUri(props.uri)

    _data.id = res.data.id
    _data.title = res.data.title
    _data.content = res.data.content

    // window.addEventListener('keydown', saveHandler)
    console.log(JSON.parse(_data.content))
    editor.commands.setContent(JSON.parse(_data.content))
    this.is_loading.value = false
  },
  reset() {
    console.log('reset')
    editor.commands.clearContent()
    this.is_loading.value = true
  },
}
appStore.show_post = myeditor.show.bind(myeditor)
appStore.hide_post = myeditor.reset.bind(myeditor)

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
  editor
})
</script>
<style lang="scss" scoped>
.editor-container {
  padding: 0;
  position: relative;
  height: 100%;
  width: 100%;
  overflow: auto;

  .editor-text {
    margin: 0.5rem 1rem;
    color: #fff;
    :deep(p.is-empty::before) {
      content: attr(data-placeholder) !important;
      color: #aaa;
      position: absolute;
    }
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
  position: absolute;
  left: calc(50% + 350px);
  align-items: center;
  color: var(--gray-5);
  display: flex;
  font-size: 0.75rem;
  gap: 0.5rem;
  margin: 1.5rem;

  svg {
    color: var(--purple);
  }

  &--warning,
  &--warning svg {
    color: var(--red);
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
</style>
<!-- <style lang="scss">
.tiptap {
  margin: 0;
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 2rem;
    margin: 2.5rem 2rem 2.5rem 0.8rem;

    li p {
      margin-top: 0.5em;
      margin-bottom: 0.5em;
    }
  }

  /* Heading styles */
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    line-height: 1.1;
    margin-top: 5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 7rem;
    margin-bottom: 3rem;
  }

  h1 {
    font-size: 4rem;
  }

  h2 {
    font-size: 3.4rem;
  }

  h3 {
    font-size: 2.8rem;
  }

  h4,
  h5,
  h6 {
    font-size: 2.4rem;
  }

  p {
    font-size: 1.8rem;
  }

  /* Code and preformatted text styles */
  code {
    background-color: var(--purple-light);
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 1rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }

  p.is-empty::before {
    content: attr(data-placeholder) !important;
  }
}
</style> -->
