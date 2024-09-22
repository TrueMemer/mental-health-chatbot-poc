<template>
    <div class="w-1/4 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <!-- Chats Header -->
        <div class="p-4 flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Conversations</h2>
            <button @click="createNewChat" class="text-blue-500 hover:text-blue-700 focus:outline-none">
                <!-- Plus icon -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
            </button>
        </div>

        <!-- Conversations List -->
        <div class="flex-1 overflow-y-auto">
            <ul>
                <li v-for="conversation in conversations" :key="conversation.id"
                    @click="selectConversation(conversation.id)" :class="{
                        'bg-gray-200 dark:bg-gray-700': selectedConversationId === conversation.id,
                    }" class="p-4 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-gray-800 dark:text-gray-100">
                            {{ conversation.title || 'Untitled Conversation' }}
                        </span>
                        <button @click.stop="confirmDeleteConversation(conversation.id)"
                            class="text-red-500 hover:text-red-700 focus:outline-none">
                            <!-- Delete icon -->
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 truncate">
                        {{ getLastMessage(conversation) }}
                    </p>
                </li>
            </ul>
        </div>

        <!-- User Toolbar at the Bottom -->
        <UserToolbar />
    </div>
    <ConfirmationModal
      v-if="showDeleteConfirmation"
      :message="'Are you sure you want to delete this conversation?'"
      @confirm="deleteConversation"
      @cancel="cancelDeleteConversation"
    />
</template>

<script lang="ts">
import { defineComponent, onMounted, computed, ref } from 'vue';
import { useChatStore } from '@/stores/chatStore';
import ConfirmationModal from '@/components/ConfirmationModal.vue';
import UserToolbar from '@/components/UserToolbar.vue';
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
    name: 'ChatsPanel',
    components: {
        ConfirmationModal,
        UserToolbar
    },
    setup() {
        const chatStore = useChatStore();
        const userStore = useUserStore();

        const conversations = computed(() => chatStore.conversations);
        const selectedConversationId = computed(() => chatStore.selectedConversationId);

        const showDeleteConfirmation = ref(false);
        const conversationToDelete = ref<number | null>(null);

        onMounted(async () => {
            if (!userStore.user) {
                await userStore.fetchCurrentUser();
            }

            if (chatStore.conversations.length === 0) {
                await chatStore.fetchConversations();
            }
        });

        const selectConversation = async (id: number) => {
            await chatStore.selectConversation(id);
        };

        const createNewChat = async () => {
            const newConversation = await chatStore.createConversation();
            await chatStore.selectConversation(newConversation.id);
        };

        const confirmDeleteConversation = (id: number) => {
            conversationToDelete.value = id;
            showDeleteConfirmation.value = true;
        };

        const deleteConversation = async () => {
            if (conversationToDelete.value !== null) {
                await chatStore.deleteConversation(conversationToDelete.value);
                conversationToDelete.value = null;
                showDeleteConfirmation.value = false;
            }
        };

        const cancelDeleteConversation = () => {
            showDeleteConfirmation.value = false;
            conversationToDelete.value = null;
        };

        const getLastMessage = (conversation: any) => {
            if (!conversation.messages || conversation.messages.length === 0) return 'No messages yet';
            return conversation.messages[conversation.messages.length - 1].content;
        };

        return {
            conversations,
            selectedConversationId,
            selectConversation,
            createNewChat,
            deleteConversation,
            getLastMessage,
            cancelDeleteConversation,
            showDeleteConfirmation,
            confirmDeleteConversation
        };
    },
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>