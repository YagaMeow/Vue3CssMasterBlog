<template>
    <div class="menu-area" ref="containerRef">
        <slot></slot>
        <Teleport to="body">
            <div class="context-menu"  v-if="showMenu" :style="{
                    left: x + 'px',
                    top: y + 'px',
                }">
                <div class="menu-list">
                    <div @click="handleClick(item)" class="menu-item" v-for="(item, i) in menu" :key="item.label">
                        {{ item.label }}
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>
<script lang="ts" setup>
import { ref, Teleport } from 'vue';
import useContextMenu from './usecontextmenu';


defineOptions({
    name: "ContextMenu"
})
const props = defineProps({
    menu: {
        type: Array<{ label: string, }>,
        default: () => []
    }
})
const containerRef = ref()
const { x, y, showMenu } = useContextMenu(containerRef)
function handleClick(item: { label: string }) { console.log(item.label) }
const emit = defineEmits(['select'])
</script>
<style lang="scss" scoped>
.menu-area {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
}
.context-menu {
    background-color: #fff;
    position: absolute;
    z-index: 1000;
    min-width: 15rem;
    box-shadow: 1rem 1rem 1rem rgba($color: #000000, $alpha: .5);
    overflow: hidden;
    border-radius: 1rem;

    .menu-list {
        display: flex;
        flex-direction: column;

        .menu-item {
            font-size: 1.5rem;
            padding: 1rem 2rem;
            cursor: pointer;
        }

        &::after {
            content: "";
            width: 100%;
            height: 3.5rem;
            position: absolute;
            background-color: rgba($color: #000000, $alpha: .4);
            display: block;
            border-radius: 1rem;
        }
    }
}
</style>