<script lang="ts" setup>
defineOptions({
    name: 'NavBar'
});
import { ref } from 'vue'
import NavItem from './NavItem.vue';
import router from '@/router';
const navList = ref([{
    name: "首页",
    href: "/"
}, {
    name: "关于",
    href: "/about"
}, {
    name: "归档",
    href: "/archive"
}]);

</script>
<template>
    <div class="nav-container">
        <ul class="pc">
            <li v-for="item of navList" :key="item.href">
                <NavItem :name="item.name" :href="item.href">
                </NavItem>
            </li>
            <li class="login">
                <RouterLink to="login">
                    <span>登录</span>
                </RouterLink>
            </li>
        </ul>
    </div>
</template>
<style scoped>
.nav-container {
    width: 100%;
    background-color: #fff;
    position: fixed;
    display: flexg;
    box-shadow: 1px 1px 20px rgba(0, 0, 0, .2);
}

.nav-container .pc {
    list-style: none;
    display: flex;
    margin-left: 200px;
    /* justify-content: center; */
    align-items: center;
}

.pc .login {
    margin-left: auto;
    margin-right: 50px;
    cursor: pointer;
}

@media screen and (max-width: 1280px) {}

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
