<!-- src/components/ArticleEditor.vue -->

<template>
  <div v-if="editor" class="container">
    <div class="control-group" display="flex">
      <div class="title">
        <h1>{{ _data.title || '' }}</h1>
      </div>
      <div class="button-group">
        <button @click="editor.setEditable(false)">ban</button>
        <button
          @click="editor.chain().focus().toggleBold().run()"
          :disabled="!editor.can().chain().focus().toggleBold().run()"
          :class="{ 'is-active': editor.isActive('bold') }"
        >
          Bold
        </button>
        <button
          @click="editor.chain().focus().toggleItalic().run()"
          :disabled="!editor.can().chain().focus().toggleItalic().run()"
          :class="{ 'is-active': editor.isActive('italic') }"
        >
          Italic
        </button>
        <button
          @click="editor.chain().focus().toggleStrike().run()"
          :disabled="!editor.can().chain().focus().toggleStrike().run()"
          :class="{ 'is-active': editor.isActive('strike') }"
        >
          Strike
        </button>
        <button
          @click="editor.chain().focus().toggleCode().run()"
          :disabled="!editor.can().chain().focus().toggleCode().run()"
          :class="{ 'is-active': editor.isActive('code') }"
        >
          Code
        </button>
        <button @click="editor.chain().focus().unsetAllMarks().run()">Clear marks</button>
        <button @click="editor.chain().focus().clearNodes().run()">Clear nodes</button>
        <button
          @click="editor.chain().focus().setParagraph().run()"
          :class="{ 'is-active': editor.isActive('paragraph') }"
        >
          Paragraph
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }"
        >
          H1
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }"
        >
          H2
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }"
        >
          H3
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 4 }) }"
        >
          H4
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 5 }) }"
        >
          H5
        </button>
        <button
          @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
          :class="{ 'is-active': editor.isActive('heading', { level: 6 }) }"
        >
          H6
        </button>
        <button
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="{ 'is-active': editor.isActive('bulletList') }"
        >
          Bullet list
        </button>
        <button
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="{ 'is-active': editor.isActive('orderedList') }"
        >
          Ordered list
        </button>
        <button
          @click="editor.chain().focus().toggleCodeBlock().run()"
          :class="{ 'is-active': editor.isActive('codeBlock') }"
        >
          Code block
        </button>
        <button
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="{ 'is-active': editor.isActive('blockquote') }"
        >
          Blockquote
        </button>
        <button @click="editor.chain().focus().setHorizontalRule().run()">Horizontal rule</button>
        <button @click="editor.chain().focus().setHardBreak().run()">Hard break</button>
        <button
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().chain().focus().undo().run()"
        >
          Undo
        </button>
        <button
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().chain().focus().redo().run()"
        >
          Redo
        </button>
        <button
          @click="editor.chain().focus().setColor('#958DF1').run()"
          :class="{ 'is-active': editor.isActive('textStyle', { color: '#958DF1' }) }"
        >
          Purple
        </button>
      </div>
    </div>
    <div class="back-button-container">
      <div class="back-button" @click="$router.back()">
        <img class="back-icon" src="@/assets/svg/back.svg" alt="" />返回
      </div>
    </div>
    <h1>{{}}</h1>

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

const _data: Article = {
  id: 0,
  title: '',
  content: '',
  uri: Array.isArray(route.params.uri) ? route.params.uri[0] : route.params.uri,
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

onMounted(async () => {
  const res = await ArticleAPI.getByUri(_data.uri)

  _data.id = res.data.id
  _data.title = res.data.title
  _data.content = res.data.content

  window.addEventListener('keydown', saveHandler)
  console.log(JSON.parse(_data.content))
  editor.commands.setContent(JSON.parse(_data.content))
})

onUnmounted(() => {
  window.removeEventListener('keydown', saveHandler)
  // editor.destroy()
})

const props = defineProps({
  content: String, // 原始文章内容（JSON 或 HTML）
  articleId: Number,
})

// const s = `[{
//   "id": 0,
//   "content": "<h2>Hi there,</h2>"
// }, {
//   "id": 1,
//   "content": "<p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:</p>"
// }, {
//   "id": 2,
//   "content": "<ul><li>That’s a bullet list with one …</li><li>… or two list items.</li></ul>"
// }, {
//   "id": 3,
//   "content": "<p>Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:</p>"
// }, {
//   "id": 4,
//   "content": "<pre><code class=\\"language-css\\">body {\n  display: none;\n}</code></pre>"
// }, {
//   "id": 5,
//   "content": "<p>I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.</p>"
// }, {
//   "id": 6,
//   "content": "<blockquote>Wow, that\’s amazing. Good work, boy! 👏<br/>— Mom</blockquote>"
// }]`

// const localContent = ref(props.content || s.replace(/\r|\n/g, ''))

// const contentString = computed(() => {
//   return JSON.parse(localContent.value || '[]').reduce((acc: string, cur: Paragraph) => {
//     return acc + cur.content
//   }, '')
// })

// 防抖保存（500ms 延迟）
// const debouncedSave = _.debounce(async (content) => {
//   await axios.put(`/api/articles/${props.articleId}`, { content })
// }, 500)
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
</style>
