<script lang="ts" setup>
const props = defineProps({
    name: {
        type: String,
        default: ''
    },
    href: {
        type: String,
        default: ''
    }
})

</script>
<template>
    <div class="nav-item-container">
        <RouterLink :to="href">
            <p>{{name}}</p>
        </RouterLink>
    </div>
</template>
<style lang="css" scoped>
.nav-item-container {
    display: flex;
    height: 50px;
    align-items: center;
    padding: 0 20px;
}
</style>
