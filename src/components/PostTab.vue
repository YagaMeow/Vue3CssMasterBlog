<template>
  <div class="mask-container _fullscreen" v-show="posttap.if_visible.value">
    <div class="mask _fullscreen" @click="handleClose"></div>
    <div class="tag-content">
      <div class="tag" v-for="(tag, idx) in appStore.post_data.tags || []" :key="'tag' + idx"
        @click="posttap.handleRemoveTag(tag.name)">
        <span>{{ tag.name }}</span>
        <span class="delete-tag" style="margin-left: auto; margin-right: 1rem">×</span>
      </div>
      <div v-show="posttap.addtag_visible.value" class="tag input" @keydown.enter="posttap.handleAddTag">
        <input type="text" v-model="posttap.newtag.value" />
      </div>
      <div class="tag" @click="posttap.showAddTag">
        <span>...</span>
      </div>
    </div>
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
          <button @click="onCoverUploadClick">
            <svg-icon iconClass="image"></svg-icon>
          </button>
          <input id="coverInput" type="file" accept="image/*" style="display: none;" @change="onCoverSelected" />
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
        <MyButton v-if="appStore.edit_mode" class="confirm_btn" @click="handleHide"
          :style="{ display: posttap.auth.value ? '' : 'none' }">√</MyButton>
        <MyButton v-else class="edit_btn" @click="posttap.handleEdit"
          :style="{ display: posttap.auth.value ? '' : 'none' }">
          <svg-icon :iconClass="posttap.editable.value ? 'no-edit' : 'edit'"></svg-icon>
        </MyButton>
        <MyButton class="close_btn" @click="handleScale" :style="{ marginLeft: posttap.auth.value ? '' : 'auto' }">
          口
        </MyButton>
        <MyButton class="close_btn" @click="handleClose">
          <span>×</span>
        </MyButton>
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
import ImgScaler from './ImgScaler.vue'
import ContextMenu from '@/components/ui/contextmenu.vue'
import MyButton from '@/components/ui/btn.vue'
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { useAppStore } from '@/pinia'
import { formatDate } from '@/utils/utils'
import PostPage from '@/views/PostPage/PostPage.vue'
import Lenis from 'lenis'
import { ArticleAPI } from '@/api/api'
import SvgIcon from './SvgIcon.vue'
import { getAuth } from '@/api/user'
import type Background from './background.vue'
const appStore = useAppStore()

const _title = ref('')
const _uri = ref('')
const ed = ref()

const posttap = {
  has_scaled: false,
  if_visible: ref(false),
  auth: ref(false),
  animator: null as null | gsap.core.Timeline,
  container: null as null | HTMLElement,
  content: null as null | HTMLElement,
  mask: null as null | HTMLElement,
  lenis: null as null | Lenis,
  editable: ref(false),
  buttons: null as null | NodeListOf<HTMLElement>,
  rafId: 0,
  addtag_visible: ref(false),
  newtag: ref(''),
  tags: null as null | NodeListOf<HTMLElement>,
  init() {
    this.container = document.querySelector('.tab-container')
    this.mask = document.querySelector('.mask-container .mask')
    this.content = document.querySelector('.tab-content')
    console.log(this.container, this.mask)
  },
  async show() {
    if (this.animator?.isActive()) return
    await getAuth().then(() => {
      this.auth.value = true
    }).catch(() => {
      this.auth.value = false
    })
    this.buttons = document.querySelectorAll('.button-group button')
    console.log(this.tags)
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
          onComplete: () => {
            gsap.timeline().to(document.querySelectorAll('.tag'), {
              x: 0,
              opacity: 1,
              duration: 0.2,
              stagger: 0.05,
              ease: 'power1.out',
            })
          },
        },
        '<',
      )

    appStore.audio_controller.showposttab.play()
  },
  hide(immediate: () => void, next: () => void) {
    if (this.animator?.isActive()) return
    if (immediate) immediate()
    this.animator = gsap
      .timeline()
      .to(document.querySelectorAll('.tag'), {
        x: '-100%',
        opacity: 0,
        duration: 0.2,
        stagger: 0.05,
        ease: 'power1.out',
      })
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
            if (next) next()
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
    }).then((resp) => {
      console.log(appStore.update_diagram)
      appStore.update_diagram?.({
        title: resp.data.title,
        uri: resp.data.uri,
        created_at: resp.data.created_at,
        tags: [],
        id: resp.data.id
      })
    })

  },
  handleEdit() {
    getAuth().then(() => {
      if (posttap.animator?.isActive()) {
        return
      }

      posttap.editable.value = !posttap.editable.value
      ed.value.editor.setEditable(posttap.editable.value)

      if (posttap.editable.value) {
        posttap.animator = gsap.timeline().to(posttap.buttons, {
          scale: 1,
          duration: 0.1,
          stagger: 0.05,
          ease: 'power3.out',
        })
      } else {
        ArticleAPI.update({
          title: appStore.post_data.title as string,
          content: JSON.stringify(ed.value.editor.getJSON()),
          uri: appStore.post_data.uri as string,
        })
          .then(() => {
          })
          .catch((e) => {
            if (appStore.notify) appStore.notify(e.message)
          })
        posttap.animator = gsap.timeline().to(posttap.buttons, {
          scale: 0,
          duration: 0.1,
          stagger: 0.05,
          ease: 'powe3.in',
        })
      }
    }).catch((e) => {
      appStore.notify?.(e.message)
    })

  },
  reset() {
    console.log('reset editor')
    appStore.post_data = {
      title: '',
      uri: '',
      id: 0,
      created_at: '',
      tags: [],
    }
    _title.value = ''
    _uri.value = ''
    posttap.editable.value = false
    posttap.addtag_visible.value = false
    posttap.newtag.value = ''
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
  async handleRemoveTag(tagname: string) {
    await ArticleAPI.removeTag({ id: appStore.post_data.id, tag: tagname })
    appStore.post_data.tags = appStore.post_data.tags.filter((tag) => tag.name != tagname)
    console.log(appStore.post_data.tags)
  },
  async handleAddTag() {
    await ArticleAPI.addTag({ id: appStore.post_data.id, tag: posttap.newtag.value })
    posttap.addtag_visible.value = false
    posttap.newtag.value = ''
  },
}

async function handleClose() {
  if (appStore.edit_mode || !posttap.editable.value) {
    appStore.hide_tab?.(
      () => { },
      () => {
        posttap.reset()
      },
    )
  } else {
    await ArticleAPI.update({
      title: appStore.post_data.title as string,
      content: JSON.stringify(ed.value.editor.getJSON()),
      uri: appStore.post_data.uri as string,
    })
      .then(() => {
        appStore.hide_tab?.(
          () => { },
          () => {
            posttap.reset()
          },
        )
      })
      .catch((e) => {
        if (appStore.notify) appStore.notify(e.message)
      })
  }
}

async function handleHide() {
  if (appStore.edit_mode) {
    await posttap.handleCreate().then(() => {
      appStore.hide_tab?.(
        () => { },
        () => {
          posttap.reset()
        },
      )
    }).catch((e) => {
      if (appStore.notify) appStore.notify(e.message)
    })
  }
}

function handleScale() {
  const container = document.querySelector(".tab-container")
  if (posttap.has_scaled) {
    posttap.has_scaled = false
    gsap.to(container, {
      width: '60rem',
      height: '80rem',
      ease: "power3.out"
    })

  } else {
    posttap.has_scaled = true
    gsap.to(container, {
      width: '100vw',
      height: '100dvh',
      ease: "power3.out"
    })
  }
}

function onImageUploadClick() {
  const imageInput = document.querySelector<HTMLInputElement>('#imageInput')
  if (imageInput) {
    imageInput.click()
  }
}

function onCoverUploadClick() {
  const imageInput = document.querySelector<HTMLInputElement>('#coverInput')
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

async function onCoverSelected(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    const file = target.files[0]
    await ArticleAPI.uploadCover({
      uri: appStore.post_data.uri.toString(),
      file: file
    }).then((resp) => {
      appStore.notify?.("上传成功")
    }).catch(e => {
      appStore.notify?.(e.message)
    })
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

  .tag-content {
    user-select: none;
    position: absolute;
    // background-color: red;
    // background-color: red;
    height: 80rem;
    left: calc(50% + 30rem);
    top: calc(50% - 40rem);
    display: flex;
    flex-direction: column;
    flex-wrap: wrap;
    filter: drop-shadow(0.1rem 0.1rem #fff);
    padding-top: 8rem;

    .tag {
      transform: translateX(-100%);
      opacity: 0;
      cursor: pointer;
      margin-left: -1rem;
      min-height: 3rem;
      min-width: 5rem;
      max-width: 10rem;
      width: fit-content;
      background-color: #191919;
      color: #fff;
      clip-path: polygon(0 0, calc(100% - 1rem) 0, 100% 50%, calc(100% - 1rem) 100%, 0 100%);
      margin-top: 2rem;
      display: flex;
      align-items: center;
      padding-left: 1rem;
      padding-right: 2rem;

      input {
        background: transparent;
        display: block;
        width: 8rem;
        color: #fff;
        outline: none;
        border: none;

        &:focus {
          border: none;
          outline: none;
        }
      }

      * {
        font-size: 2rem;
      }

      .delete-tag {
        display: none;
      }

      &:hover {
        padding-right: 0;

        .delete-tag {
          display: block;
        }
      }
    }
  }

  .tab-container {
    user-select: none;
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

        * {
          font-size: 2rem;
        }
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
      width: 100%;
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

@media screen and (max-aspect-ratio: 0.8/1) {
  .tab-container {
    width: 90rem !important;
    height: 120rem !important;

    .mybutton {
      width: 8rem !important;
      height: 8rem !important;

      span {
        font-size: 5rem !important;
      }

      .svg-icon {
        width: 5rem;
        height: 5rem;
      }
    }

    .tab-title .tab-title-info {
      .title {
        font-size: 4rem;
      }

      .info {
        font-size: 3rem;
      }
    }

    .tools {
      top: -10rem;
      width: 100%;
      flex-wrap: wrap;
      left: 0 !important;

      .button-group {
        flex-direction: row !important;

        button {
          width: 8rem !important;
          height: 8rem !important;

          .svg-icon {
            width: 4rem;
            height: 4rem;
          }
        }
      }
    }
  }
}
</style>
