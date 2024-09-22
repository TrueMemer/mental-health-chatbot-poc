<template>
  <div id="app" class="h-full flex flex-col">
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useThemeStore } from './stores/themeStore';

export default defineComponent({
  name: 'App',
  setup() {
    const themeStore = useThemeStore();
    console.log(themeStore.theme)
  },
})
</script>

<style scoped>
</style>
