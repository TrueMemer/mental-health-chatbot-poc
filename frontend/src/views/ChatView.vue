<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <div class="flex flex-1">
    <Chat />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Chat from '@/components/Chat.vue';

export default defineComponent({
  name: 'ChatPage',
  components: {
    Chat,
  },
  setup() {
  },
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
