<template>
  <div class="mask-container _fullscreen" v-show="posttap.if_visible.value">
    <div class="mask _fullscreen" @click="handleClose"></div>
    <div class="tab-container">
      <div class="tools control-group">
        <div class="button-group" v-if="ed">
          <!-- <button @click="editor.setEditable(false)">ban</button> -->
          <button @click="ed.editor.chain().focus().toggleBold().run()"
            :disabled="!ed.editor.can().chain().focus().toggleBold().run()"
            :class="{ 'is-active': ed.editor.isActive('bold') }">
            <svg-icon iconClass="bold"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleItalic().run()"
            :disabled="!ed.editor.can().chain().focus().toggleItalic().run()"
            :class="{ 'is-active': ed.editor.isActive('italic') }">
            <svg-icon iconClass="italic"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleStrike().run()"
            :disabled="!ed.editor.can().chain().focus().toggleStrike().run()"
            :class="{ 'is-active': ed.editor.isActive('strike') }">
            <svg-icon iconClass="strikethrough"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleCode().run()"
            :disabled="!ed.editor.can().chain().focus().toggleCode().run()"
            :class="{ 'is-active': ed.editor.isActive('code') }">
            <svg-icon iconClass="code"></svg-icon>
          </button>
          <!-- <button @click="editor.chain().focus().unsetAllMarks().run()">Clear marks</button>
        <button @click="editor.chain().focus().clearNodes().run()">Clear nodes</button> -->
          <button @click="ed.editor.chain().focus().setParagraph().run()"
            :class="{ 'is-active': ed.editor.isActive('paragraph') }">
            <svg-icon iconClass="paragraph"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleBulletList().run()"
            :class="{ 'is-active': ed.editor.isActive('bulletList') }" id="bullet-list">
            <svg-icon iconClass="unordered-list"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleOrderedList().run()"
            :class="{ 'is-active': ed.editor.isActive('orderedList') }">
            <svg-icon iconClass="ordered-list"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleCodeBlock().run()"
            :class="{ 'is-active': ed.editor.isActive('codeBlock') }">
            <svg-icon iconClass="code"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().toggleBlockquote().run()"
            :class="{ 'is-active': ed.editor.isActive('blockquote') }">
            <svg-icon iconClass="quote"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().setHorizontalRule().run()">
            <svg-icon iconClass="separator"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().setHardBreak().run()">
            <svg-icon iconClass="text-wrap"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().undo().run()"
            :disabled="!ed.editor.can().chain().focus().undo().run()" id="undo">
            <svg-icon iconClass="undo"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().redo().run()"
            :disabled="!ed.editor.can().chain().focus().redo().run()" id="redo">
            <svg-icon iconClass="redo"></svg-icon>
          </button>
          <button @click="ed.editor.chain().focus().setColor('#958DF1').run()"
            :class="{ 'is-active': ed.editor.isActive('textStyle', { color: '#958DF1' }) }">
            <svg-icon iconClass="font-color"></svg-icon>
          </button>
          <button @click="onImageUploadClick">
            <svg-icon iconClass="image"></svg-icon>
          </button>
          <input id="imageInput" type="file" accept="image/*" style="display: none" @change="onImageSelected" />
        </div>
      </div>

      <div class="tag-content">
        <div class="tag" v-for="(tag,idx) in ed.value._data" :key="'tag' + idx" @click="posttap.handleRemoveTag">
          <span>{{ tag }}</span>
          <span class="delete-tag" style="margin-left: auto;margin-right: 1rem;">×</span>
        </div>
        <div v-show="posttap.addtag_visible.value" class="tag input" @keydown.enter="posttap.handleAddTag">
          <input type="text" v-model="posttap.newtag.value"/>
        </div>
        <div class="tag" @click="posttap.showAddTag">
          <span>...</span>
        </div>
      </div>

      <div class="tab-title">
        <div class="tab-title-info">
          <div class="title" v-if="!appStore.edit_mode">{{ appStore.post_data.title }}</div>
          <div v-else>
            <div class="tab-title-input">
              <input v-model="_title" type="text" placeholder="Please enter title..." />
            </div>
            <div class="tab-uri-input">
              <input v-model="_uri" type="text" placeholder="uri" />
            </div>
          </div>

          <div class="info" v-if="!appStore.edit_mode">
            {{ formatDate(appStore.post_data.created_at.toString()) }}
          </div>
        </div>
        <MyButton v-if="appStore.edit_mode" class="confirm_btn" @click="handleHide">√</MyButton>
        <MyButton v-else class="edit_btn" @click="posttap.handleEdit">
          <svg-icon :iconClass="posttap.editable.value ? 'no-edit' : 'edit'"> </svg-icon>
        </MyButton>
        <MyButton class="close_btn" @click="handleClose">×</MyButton>
      </div>
      <div class="tab-content">
        <ContextMenu :menu="[{ label: 'Large' }, { label: 'Middle' }, { label: 'Small' }]">
          <PostPage ref="ed" :uri="appStore.post_data.uri.toString()"></PostPage>
        </ContextMenu>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import ContextMenu from '@/components/ui/contextmenu.vue'
import MyButton from '@/components/ui/btn.vue'
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useAppStore } from '@/pinia'
import { formatDate } from '@/utils/utils'
import PostPage from '@/views/PostPage/PostPage.vue'
import CreatePage from '@/views/PostPage/CreatePost.vue'
import Lenis from 'lenis'
import { ArticleAPI } from '@/api/api'
import { Editor } from '@tiptap/vue-3'
import SvgIcon from './SvgIcon.vue'
const appStore = useAppStore()

const _title = ref('')
const _uri = ref('')
const ed = ref()

const posttap = {
  if_visible: ref(false),
  animator: null as null | gsap.core.Timeline,
  container: null as null | HTMLElement,
  content: null as null | HTMLElement,
  mask: null as null | HTMLElement,
  lenis: null as null | Lenis,
  editable: ref(false),
  buttons: null as null | NodeListOf<HTMLElement>,
  rafId: 0,
  addtag_visible: ref(false),
  newtag: ref(""),
  init() {
    this.container = document.querySelector('.tab-container')
    this.mask = document.querySelector('.mask-container .mask')
    this.content = document.querySelector('.tab-content')
    console.log(this.container, this.mask)
  },
  show() {
    this.buttons = document.querySelectorAll('.button-group button')
    console.log(this.lenis)
    appStore.show_detail = true
    if (appStore.edit_mode) {
      posttap.editable.value = true
      ed.value.editor.setEditable(true)
      if (posttap.editable.value) {
        posttap.animator = gsap.timeline().to(posttap.buttons, {
          scale: 1,
          duration: 0.1,
          stagger: 0.05,
          ease: 'power3.out',
        })
      } else {
        posttap.animator = gsap.timeline().to(posttap.buttons, {
          scale: 0,
          duration: 0.1,
          stagger: 0.05,
          ease: 'powe3.in',
        })
      }
    }
    this.if_visible.value = true
    this.animator = gsap
      .timeline()
      .to(this.container, {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: 'power3.out',
        onComplete: () => {
          appStore.show_post?.()
        },
      })
      .to(
        this.mask,
        {
          opacity: 1,
          'backdrop-filter': 'blur(1rem)',
          duration: 1,
          ease: 'power3.out',
        },
        '<',
      )
    appStore.audio_controller.showposttab.play()
  },
  hide() {
    if (this.animator?.isActive()) return

    this.animator = gsap
      .timeline()
      .to(this.container, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(
        this.mask,
        {
          opacity: 0,
          'backdrop-filter': 'blur(0rem)',
          duration: 1,
          ease: 'power3.out',
          onComplete: () => {
            this.if_visible.value = false
            console.log(appStore.hide_post)
            appStore.show_detail = false
            appStore.hide_post?.()
          },
        },
        '<',
      )
    appStore.audio_controller.hideposttab.play()
  },
  initLenis() {
    this.lenis = new Lenis({
      wrapper: this.content as HTMLElement,
    })
    function raf(time: number) {
      posttap.lenis?.raf(time)
      posttap.rafId = requestAnimationFrame(raf)
    }
    this.rafId = requestAnimationFrame(raf)
  },
  removeLenis() {
    cancelAnimationFrame(this.rafId)
    this.rafId = 0
    this.lenis?.destroy()
    this.lenis = null
  },
  async handleCreate() {
    await ArticleAPI.create({
      title: _title.value,
      content: JSON.stringify(ed.value.editor.getJSON()),
      uri: _uri.value,
    })
  },
  handleEdit() {
    posttap.editable.value = !posttap.editable.value
    ed.value.editor.setEditable(posttap.editable.value)
    if (posttap.animator?.isActive()) posttap.animator.kill()

    if (posttap.editable.value) {
      posttap.animator = gsap.timeline().to(posttap.buttons, {
        scale: 1,
        duration: 0.1,
        stagger: 0.05,
        ease: 'power3.out',
      })
    } else {
      posttap.animator = gsap.timeline().to(posttap.buttons, {
        scale: 0,
        duration: 0.1,
        stagger: 0.05,
        ease: 'powe3.in',
      })
    }
  },
  reset() {
    console.log('reset editor')
    appStore.post_data = {
      title: '',
      uri: '',
      id: 0,
      created_at: '',
    }
    _title.value = ''
    _uri.value = ''
    posttap.editable.value = false
    posttap.animator = gsap.timeline().to(posttap.buttons, {
      scale: 0,
      duration: 0,
      ease: 'powe3.in',
    })
    ed.value.editor.setEditable(false)
    ed.value.editor.commands.clearContent()
  },
  showAddTag() {
    posttap.addtag_visible.value = true
  },
  handleRemoveTag() {

  },
  handleAddTag() {
    ArticleAPI.addTag({id: appStore.post_data.id,tag: posttap.newtag.value})
    posttap.addtag_visible.value = false
  }
}

async function handleClose() {
  if (appStore.edit_mode || !posttap.editable.value) {
    posttap.reset()
    appStore.hide_tab?.()
  } else {
    await ArticleAPI.update({
      title: appStore.post_data.title as string,
      content: JSON.stringify(ed.value.editor.getJSON()),
      uri: appStore.post_data.uri as string,
    })
      .then(() => {
        posttap.reset()
        appStore.hide_tab?.()
      })
      .catch((e) => {
        if (appStore.notify) appStore.notify(e.message)
      })
  }
}

async function handleHide() {
  if (appStore.edit_mode) {
    posttap.handleCreate().then(() => {
      posttap.reset()
      appStore.hide_tab?.()
    })
  }
}

function onImageUploadClick() {
  const imageInput = document.querySelector<HTMLInputElement>('#imageInput')
  if (imageInput) {
    imageInput.click()
  }
}

async function onImageSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    const url = (await ArticleAPI.upload(file)).data.url
    const newurl = import.meta.env.VITE_BASE_API + '/api' + url
    ed.value.editor.chain().focus().setImage({ src: newurl }).run()
  }
}
appStore.show_tab = posttap.show.bind(posttap)
appStore.hide_tab = posttap.hide.bind(posttap)

onMounted(() => {
  posttap.init()
})
</script>
<style lang="scss" scoped>
.mask-container {
  z-index: 1000;
  --scale: 1;
  display: flex;
  align-items: center;
  justify-content: center;

  .mask {
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(0rem);
    opacity: 0;
  }

  .tab-container {
    scale: 0.8;
    opacity: 0;
    width: 60rem;
    height: 80rem;
    background-color: #61616161;
    border-radius: 1rem;
    box-shadow: inset 1px 1px var(--white);
    background: #191919;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .tag-content {
      position: absolute;
      // background-color: red;
      height: 100%;
      right: 0;
      transform: translateX(100%);
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
      filter: drop-shadow(.1rem .1rem #fff);

      .tag {
        cursor: pointer;
        margin-left: -1rem;
        min-height: 3rem;
        min-width: 5rem;
        width: fit-content;
        max-width: 15rem;
        background-color: #191919;
        color: #fff;
        clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 50%, calc(100% - 1rem) 100%, 0 100%);
        margin-top: 2rem;
        display: flex;
        align-items: center;
        padding-left: 1rem;

        input {
          background: transparent;
          display: block;
          width: 8rem;
          color: #fff;
          &:focus {
            outline: none;
          }
        }

        * {
          font-size: 2rem;
        }

        &:nth-child(1) {
          margin-top: 10rem;
        }

        .delete-tag {
          display: none;
        }

        &:hover {
          .delete-tag {
            display: block;
          }
        }
      }
    }

    .tab-title {
      width: 100%;
      display: flex;
      flex: 0;
      padding: 1rem;
      align-items: flex-start;

      .confirm_btn,
      .edit_btn {
        margin-left: auto;
        color: #fff;
      }

      .close_btn {
        margin-left: 1rem;
      }

      .close_btn,
      .confirm_btn,
      .edit_btn {
        width: 4rem;
        height: 4rem;
        font-size: 2rem;
        color: var(--white);
      }

      .tab-title-info {
        display: flex;
        flex-direction: column;

        .tab-title-input,
        .tab-uri-input {
          margin-left: 2rem;
          padding: 0.5rem 0;
          position: relative;

          &::after {
            content: '';
            width: 100%;
            height: 0.1rem;
            background-color: #fff;
            display: block;
            position: absolute;
            bottom: 0;
            transform: scaleX(0);
            transform-origin: left;
          }

          &:focus-within::after {
            transform: scaleX(1);
            transition: transform 0.2s ease-out;
          }

          input {
            font-size: 2rem;
            color: #fff;
            width: 100%;
            height: 3rem;
            background-color: transparent;
            outline: none;
            border: none;
            // &:focus{
            //   outline: 1px solid white;
            // }
          }
        }
      }

      .title,
      .info {
        margin-left: 2rem;
        padding: 0.5rem 0;
        color: #fff;
      }

      .title {
        font-size: 2rem;
      }

      .info {
        font-size: 1.8rem;
        color: #ccc;
      }
    }

    .tab-content {
      cursor: pointer;
      position: relative;
      width: 58rem;
      flex: 1 1 auto;
      background-color: transparent;
      margin-bottom: 1rem;
      border-radius: 0.8rem;
      margin-top: auto;
      overflow: auto;
    }

    .tools {
      position: absolute;
      left: -5rem;

      .button-group {
        display: flex;
        flex-direction: column;
        align-items: center;

        button {
          width: 4rem;
          height: 4rem;
          margin-top: 0.5rem;
          border-radius: 20%;
          cursor: pointer;
          scale: 0;
          background-color: #eee;

          // box-shadow: inset -.1rem -.1rem #000;
          &.is-active {
            background-color: #71066a;
            color: #ccc;
          }
        }
      }
    }
  }
}
</style>
