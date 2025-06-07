<!-- src/components/ArticleEditor.vue -->

<template>
  <div v-if="editor" class="container">
    <div class="control-group" display="flex">
      <div
        class="title"
        style="display: flex; align-items: center; justify-content: center; gap: 5px"
      >
        <el-input v-model="_data.title" placeholder="文章标题"></el-input><span> / </span>
        <el-input v-model="_data.uri" placeholder="uri"></el-input>
      </div>
    </div>
    <div class="back-button-container">
      <div class="back-button" @click="$router.back()">
        <img class="back-icon" src="@/assets/svg/back.svg" alt="" />返回
      </div>
    </div>
    <drag-handle :editor="editor">
      <div class="custom-drag-handle" />
    </drag-handle>
  </div>
  <div
    :class="{
      'character-count': true,
      'character-count--warning': editor.storage.characterCount.characters() === limit,
    }"
  >
    <svg height="20" width="20" viewBox="0 0 20 20">
      <circle r="10" cx="10" cy="10" fill="#c1e3f7" />
      <circle
        r="5"
        cx="10"
        cy="10"
        fill="transparent"
        stroke="#68c3f7"
        stroke-width="10"
        :stroke-dasharray="`calc(${percentage} * 31.4 / 100) 31.4`"
        transform="rotate(-90) translate(-20)"
      />
      <circle r="6" cx="10" cy="10" fill="rgb(232, 231, 231)" />
    </svg>

    {{ editor.storage.characterCount.characters() }} / {{ limit }} characters
    <br />
    {{ editor.storage.characterCount.words() }} words
  </div>
  <editor-content :editor="editor" />
  <div class="home" @click="$router.push('/')"></div>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
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
import router from '@/router'

const percentage = computed(() =>
  Math.round((100 / limit) * editor.storage.characterCount.characters()),
)

const lowlight = createLowlight(all)

lowlight.register('html', html)
lowlight.register('css', css)
lowlight.register('js', js)
lowlight.register('ts', ts)

const limit = 1000 // 字数限制

const editor = new Editor({
  extensions: [
    Mathematics,
    Text,
    Dropcursor,
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
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

interface Paragraph {
  id: string
  content: string
}

interface Article {
  id: number
  title: string
  content: string
  uri: string
}

const route = useRoute()

const _data = ref<Article>({
  id: 0,
  title: '',
  content: '',
  uri: '',
})

const saveHandler = (e: KeyboardEvent) => {
  if (
    (e.key === 's' || e.key === 'S') &&
    (navigator.platform.match('Mac') ? e.metaKey : e.ctrlKey)
  ) {
    e.preventDefault()
    ArticleAPI.create({
      title: _data.value.title,
      content: JSON.stringify(editor.getJSON()),
      uri: _data.value.uri,
    })
      .then(() => {
        ElNotification({
          title: '创建成功',
          message: '文章已保存',
          type: 'success',
          duration: 2000,
        })
        router.push({
          name: 'Post',
          params: { uri: _data.value.uri },
        })
      })
      .catch((error) => {
        ElNotification({
          title: '创建失败',
          message: error.message || '无法创建文章',
          type: 'error',
          duration: 2000,
        })
      })
  }
}

onMounted(async () => {
  window.addEventListener('keydown', saveHandler)
})

onUnmounted(() => {
  window.removeEventListener('keydown', saveHandler)
  // editor.destroy()
})

const props = defineProps({
  content: String, // 原始文章内容（JSON 或 HTML）
  articleId: Number,
})
</script>
<style lang="scss" scoped>
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
.control-group {
  padding: 5px 10px;
  background-color: #fff;

  .button-group {
    display: none;
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
<style lang="scss">
.tiptap {
  max-width: 700px;
  margin: 0 auto;
}

.tiptap {
  :first-child {
    margin-top: 0;
  }

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
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
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 2rem;
  }

  h2 {
    font-size: 1.7rem;
  }

  h3 {
    font-size: 1.4rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1.2rem;
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

.home {
  width: 50px;
  height: 50px;
  bottom: 20px;
  left: 20px;
  background-color: #fafafa;
  position: fixed;
  border-radius: 20%;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  background-image: url('@/assets/svg/home.svg');
  background-size: 50%;
  background-repeat: no-repeat;
  background-position: center;

  &:hover {
    animation: shake 0.5s ease-in-out;
  }
}

@keyframes shake {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-10deg);
  }
  50% {
    transform: rotate(10deg);
  }
  75% {
    transform: rotate(-5deg);
  }
  100% {
    transform: rotate(0deg);
  }
}
</style>
