<template>
  <div class="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
    <div class="flex flex-1">
      <ChatsPanel />
      <div v-if="selectedConversationId" class="flex-1">
      <Chat :conversationId="selectedConversationId" />
    </div>
    <div v-else class="flex-1 flex items-center justify-center">
      <p class="text-gray-500">Create or select a conversation</p>
    </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, computed } from 'vue';
import ChatsPanel from '@/components/ChatsPanel.vue';
import Chat from '@/components/Chat.vue';
import { useChatStore } from '@/stores/chatStore';
import LandingFooter from '@/components/LandingFooter.vue';
import NavBar from '@/components/NavBar.vue';

export default defineComponent({
  name: 'ChatPage',
  components: {
    ChatsPanel,
    Chat,

    LandingFooter,
    NavBar
  },
  setup() {
    const chatStore = useChatStore();

    const selectedConversationId = computed(() => chatStore.selectedConversationId);
    const isLoading = computed(() => chatStore.isLoading);
    const error = computed(() => chatStore.error);

    onMounted(() => {
      chatStore.fetchConversations();
    });

    return {
      selectedConversationId,
      isLoading,
      error,
    };
  },
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
