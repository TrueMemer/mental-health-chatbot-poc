import { defineStore } from 'pinia';
import messageService from '@/services/messageService';

export interface ChatMessage {
    read: boolean;
    id: number;
    sender: 'USER' | 'BOT';
    content: string;
    timestamp: string;
}

export const useMessagesStore = defineStore('messagesStore', {
    state: () => ({
        messages: [] as ChatMessage[],
        isLoading: false,
        error: null as string | null,
    }),
    actions: {

        async fetchMessages() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await messageService.getMessages();
                this.messages = response.data;
            } catch (error) {
                console.error('Failed to fetch messages:', error);
                this.error = 'Failed to load messages.';
            } finally {
                this.isLoading = false;
            }
        },

        addMessage(message: ChatMessage) {
            this.messages.push(message);
        },
    },
});
