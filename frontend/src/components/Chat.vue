<template>
    <div class="flex-1 flex flex-col bg-white h-screen dark:bg-gray-800">
        <!-- Chat Header -->
        <div class="flex items-center justify-between p-4 border-b dark:border-gray-700 border-gray-200">
            <div class="flex items-center space-x-3">
                <img src="https://via.placeholder.com/40" alt="Bot Avatar" class="h-10 w-10 rounded-full" />
                <div>
                    <h2 class="text-lg font-semibold dark:text-gray-100">Chat with Mental Health Bot</h2>
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button @click="refreshChat" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v6h6M20 20v-6h-6M4 10l6 6M20 14l-6-6" />
                    </svg>
                </button>
                <button @click="openSettings" class="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                    </svg>
                </button>
            </div>
        </div>

        <!-- Chat Messages -->
        <div class="flex-1 overflow-y-auto p-6 space-y-4" ref="chatContainer">
            <!-- Placeholder when no messages -->
            <div v-if="messages.length === 0 && !isLoading"
                class="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                <!-- Placeholder content -->
                <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mb-4 text-gray-400 dark:text-gray-500"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <!-- ... SVG path -->
                </svg>
                <p class="text-lg text-gray-600 dark:text-gray-300">No messages yet</p>
                <p class="text-sm text-gray-500 dark:text-gray-400">Start the conversation by typing a message below.
                </p>
            </div>

            <!-- Messages -->
            <div v-else>
                <div v-for="message in messages" :key="message.id" :class="[
                    message.sender === 'USER' ? 'flex justify-end' : 'flex justify-start',
                ]">
                    <!-- Message bubble -->
                    <div :class="message.sender === 'USER'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100'"
                        class="rounded-lg px-4 py-2 my-1 max-w-xs">
                        <p class="text-sm">{{ message.content }}</p>
                        <span class="text-xs text-gray-500 dark:text-gray-400 mt-1 block text-right">
                            {{ formatTimestamp(message.timestamp) }}
                        </span>
                    </div>
                </div>
                <TypingIndicator v-if="isBotTyping" class="flex justify-start pt-4" />
            </div>
        </div>

        <!-- Input Area -->
        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center space-x-2">
            <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Type your message..."
                class="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
            <button @click="sendMessage"
                class="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none">
                Send
            </button>
        </div>
    </div>
    <SettingsPanel v-if="showSettings" @close="showSettings = false" />
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, watch, computed } from 'vue';
import socket from '@/services/socket';
import SettingsPanel from '@/components/SettingsPanel.vue';
import { useToast } from 'vue-toastification';
import TypingIndicator from './TypingIndicator.vue';
import { useMessagesStore } from '@/stores/messagesStore';

const userAvatar = 'https://via.placeholder.com/40?text=U';
const botAvatar = 'https://via.placeholder.com/40?text=B';

export default defineComponent({
    name: 'ChatComponent',
    components: {
        SettingsPanel,
        TypingIndicator
    },
    setup() {
        const showSettings = ref(false);
        const showEmojiPicker = ref(false);
        const messagesStore = useMessagesStore();
        const newMessage = ref('');
        const chatContainer = ref<HTMLElement | null>(null);
        const isLoading = computed(() => messagesStore.isLoading);
        const isBotTyping = ref(false);

        const messages = computed(() => messagesStore?.messages || []);

        const toast = useToast();

        const openEmojiPicker = () => {
            showEmojiPicker.value = !showEmojiPicker.value;
        };

        const addEmoji = (emoji: any) => {
            newMessage.value += emoji.emoji;
        };

        const refreshChat = () => {
            messagesStore.fetchMessages();
        };

        const openSettings = () => {
            showSettings.value = true;
        };

        onMounted(async () => {
            await refreshChat();

            socket.emit('joinConversation');
        });

        socket.on('newMessage', (message) => {
                setTimeout(() => {
                    messagesStore.addMessage(message);
                    isBotTyping.value = false;
                    scrollToBottom();
                }, 2000);
        });

        socket.on('disconnect', () => {
            toast.error('Connection lost. Trying to reconnect...');
        });


        socket.io.on('reconnect_attempt', (attempt) => {
            console.log(`Reconnection attempt #${attempt}`);
        });

        socket.io.on('reconnect', () => {
            toast.success('Reconnected to the server.');

            socket.emit('joinConversation');
        });


        socket.on('connect_error', (err) => {
            console.error('Connection error:', err);
        });

        const sendMessage = () => {
            if (newMessage.value.trim() === '') return;
            isBotTyping.value = true;
            const userMessage = newMessage.value
            newMessage.value = '';
            setTimeout(async () => {
                socket.emit('sendMessage', {
                    content: userMessage,
                });
            }, 500);
        };


        const formatTimestamp = (timestamp: string) => {
            const date = new Date(timestamp);
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const scrollToBottom = () => {
            if (chatContainer.value) {
                chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
            }
        };

        return {
            messages,
            newMessage,
            sendMessage,
            formatTimestamp,
            chatContainer,
            refreshChat,
            openSettings,
            userAvatar,
            botAvatar,
            showEmojiPicker,
            openEmojiPicker,
            addEmoji,
            showSettings,
            isLoading,
            isBotTyping
        };
    }
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>