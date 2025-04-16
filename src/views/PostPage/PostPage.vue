<!-- src/components/ArticleEditor.vue -->
<template>
  <div v-if="editor" class="container">
    <div class="control-group">
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
    <editor-content :editor="editor" />
  </div>
</template>

<script lang="ts" setup>
import { Color } from '@tiptap/extension-color'
import { Highlight } from '@tiptap/extension-highlight'
import ListItem from '@tiptap/extension-list-item'
import TextStyle from '@tiptap/extension-text-style'
import StarterKit from '@tiptap/starter-kit'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { ref, computed } from 'vue'

interface Paragraph {
  id: string
  content: string
}

interface EditorUpdate {
  editor: {
    getJSON: () => Record<string, unknown>
  }
}

const props = defineProps({
  content: String, // 原始文章内容（JSON 或 HTML）
  articleId: Number,
})

const s = `[{
  "id": 0,
  "content": "<h2>Hi there,</h2>"
}, {
  "id": 1,
  "content": "<p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you’d probably expect from a text editor. But wait until you see the lists:</p>"
}, {
  "id": 2,
  "content": "<ul><li>That’s a bullet list with one …</li><li>… or two list items.</li></ul>"
}, {
  "id": 3,
  "content": "<p>Isn’t that great? And all of that is editable. But wait, there’s more. Let’s try a code block:</p>"
}, {
  "id": 4,
  "content": "<pre><code class=\\"language-css\\">body {\n  display: none;\n}</code></pre>"
}, {
  "id": 5,
  "content": "<p>I know, I know, this is impressive. It’s only the tip of the iceberg though. Give it a try and click a little bit around. Don’t forget to check the other examples too.</p>"
}, {
  "id": 6,
  "content": "<blockquote>Wow, that\’s amazing. Good work, boy! 👏<br/>— Mom</blockquote>"
}]`

const localContent = ref(props.content || s.replace(/\r|\n/g, ''))
// 编辑状态控制
const isEditing = ref(false)

// 将内容解析为段落数组
const paragraphs = computed(() => {
  try {
    return JSON.parse(localContent.value || '[]')
  } catch {
    return []
  }
})

const contentString = computed(() => {
  return JSON.parse(localContent.value || '[]').reduce((acc: string, cur: Paragraph) => {
    return acc + cur.content
  }, '')
})

const editor = new Editor({
  extensions: [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit,
    Highlight,
  ],
  content: contentString.value,
  // onUpdate: ({ editor }) => {
  //   // 使用防抖函数触发保存
  //   // debouncedSave(editor.getJSON())
  // },
})

console.log(JSON.parse(localContent.value))
console.log(paragraphs.value)

// 防抖保存（500ms 延迟）
// const debouncedSave = _.debounce(async (content) => {
//   await axios.put(`/api/articles/${props.articleId}`, { content })
// }, 500)

// 双击段落进入编辑模式
const handleEnableEdit = (event) => {
  if (false) return
  isEditing.value = true
  // 聚焦到对应段落
  const targetParagraph = event.target.closest('.paragraph')
  if (targetParagraph) {
    const id = targetParagraph.dataset.id
    if (editor.value) {
      editor.value.commands.focus(id)
    }
  }
}
// 段落悬停显示方法
const showParagraphHover = (index: number) => {
  console.log(`Hovered over paragraph ${index}`)
}

// 段落悬停隐藏方法
const hideParagraphHover = () => {
  console.log('Mouse left paragraph')
}
</script>

<style lang="scss">
/* 段落悬停效果 */
.paragraph:hover {
  background: #f5f5f5;
  cursor: text;
}

/* 编辑器样式 */
.editor-content {
  border: 1px solid #ddd;
  padding: 20px;
  min-height: 300px;
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
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
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
      font-size: 0.8rem;
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
}
</style>
