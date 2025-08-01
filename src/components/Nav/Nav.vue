<script lang="ts" setup>
defineOptions({
  name: 'NavBar',
})
import { computed, onMounted, ref } from 'vue'
import NavItem from './NavItem.vue'
import { useUserStore } from '@/pinia'
import router from '@/router'
const navList = ref([
  {
    name: '首页',
    href: '/',
  },
  {
    name: '关于',
    href: '/about',
  },
  // {
  //   name: '归档',
  //   href: '/archive',
  // },
])

const userStore = useUserStore()
let CheckLogin = userStore.isLoggedIn

async function handleLogout() {
  userStore.Logout()

  CheckLogin = false

  router.push({
    path: '/',
    query: {
      date: new Date().getTime(),
    },
  })
}
</script>
<template>
  <div class="nav-container">
    <ul class="pc">
      <li v-for="item of navList" :key="item.href">
        <NavItem :name="item.name" :href="item.href"> </NavItem>
      </li>
      <li class="login" :key="String($route.query.date || '')">
        <RouterLink to="login" v-show="CheckLogin === false">
          <img class="nav-icon" src="@/assets/svg/login.svg" alt="" />
          <span> 登录</span>
        </RouterLink>
        <div v-show="CheckLogin === true" @click="handleLogout">
          <img class="nav-icon" src="@/assets/svg/logout.svg" alt="" />
          <span> 注销</span>
        </div>
      </li>
    </ul>
  </div>
</template>
<style scoped>
.nav-container {
  width: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  position: fixed;
  box-shadow: 1px 1px 20px rgba(0, 0, 0, 0.2);
}

.nav-container .pc {
  list-style: none;
  display: flex;
  margin-left: 100px;
  /* justify-content: center; */
  align-items: center;
}

.pc .login {
  margin-left: auto;
  margin-right: 50px;
  cursor: pointer;
}

.nav-icon {
  height: 1em;
  vertical-align: middle;
  transform: translateY(-0.1em);
}

@media screen and (max-width: 1280px) {
}

@media screen and (max-width: 1024px) {
  .nav-container .pc {
    margin-left: 50px;
  }
}

@media screen and (max-width: 768px) {
  .nav-container .pc {
    margin-left: 0;
  }
}
</style>
