import { defineStore } from 'pinia';
import api from '@/services/api';
import { reactive } from 'vue';
import chatService from '@/services/chatService';

interface ChatMessage {
    id: number;
    conversationId: number;
    sender: 'USER' | 'BOT';
    content: string;
    timestamp: string;
}

interface Conversation {
    id: number;
    userId: number;
    messages: ChatMessage[];
    createdAt: string;
    updatedAt: string;
}

export const useChatStore = defineStore('chatStore', {
    state: () => ({
        conversations: [] as Conversation[],
        selectedConversationId: null as number | null,
        isLoading: false,
        error: null as string | null,
    }),
    getters: {
        currentConversation(state): Conversation | null {
            return (
                state.conversations.find(
                    (conv) => conv.id === state.selectedConversationId
                ) || null
            );
        },
    },
    actions: {

        async fetchConversations() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await chatService.getConversations();
                this.conversations = response.data;


                if (this.conversations.length === 0) {
                    const newConversation = await this.createConversation();
                    this.selectConversation(newConversation.id);
                } else {

                    if (this.selectedConversationId === null) {
                        this.selectConversation(this.conversations[0].id);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
                this.error = 'Failed to load conversations.';
            } finally {
                this.isLoading = false;
            }
        },


        async createConversation() {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await chatService.createConversation();
                const newConversation = response.data;
                this.conversations.push(newConversation);
                return newConversation;
            } catch (error) {
                console.error('Failed to create conversation:', error);
                this.error = 'Failed to create a new conversation.';
                throw error;
            } finally {
                this.isLoading = false;
            }
        },
        async selectConversation(id: number) {
            this.selectedConversationId = id;


            await this.loadMessages(id);
        },
        async loadMessages(conversationId: number) {
            this.isLoading = true;
            this.error = null;
            try {
                const response = await chatService.getMessages(conversationId)
                let conversation = this.conversations.find(
                    (conv) => conv.id === conversationId
                );
                if (conversation) {

                    conversation.messages = reactive(response.data);
                } else {

                    const convResponse = await chatService.getConversation(conversationId)
                    conversation = {
                        ...convResponse.data,
                        messages: reactive(response.data),
                    };
                    this.conversations.push(conversation);
                }
            } catch (error) {
                console.error('Failed to load messages:', error);
                this.error = 'Failed to load messages.';
            } finally {
                this.isLoading = false;
            }
        },

        addMessageToConversation(conversationId: number, message: ChatMessage) {
            const conversation = this.conversations.find(
                (conv) => conv.id === conversationId
            );
            if (conversation) {
                if (!conversation.messages) {

                    conversation.messages = reactive([]);
                }
                conversation.messages.push(message);
            }
        },

        async deleteConversation(id: number) {
            this.isLoading = true;
            this.error = null;
            try {
                await chatService.deleteConversation(id)

                this.conversations = this.conversations.filter((conv) => conv.id !== id);


                if (this.selectedConversationId === id) {
                    if (this.conversations.length > 0) {
                        this.selectedConversationId = this.conversations[0].id;

                        await this.loadMessages(this.selectedConversationId);
                    } else {
                        this.selectedConversationId = null;
                    }
                }
            } catch (error) {
                console.error('Failed to delete conversation:', error);
                this.error = 'Failed to delete the conversation.';
            } finally {
                this.isLoading = false;
            }
        },
    },
});
