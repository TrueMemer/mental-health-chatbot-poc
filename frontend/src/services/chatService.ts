import api from './api';

export default {
  getConversations() {
    return api.get('/api/conversations');
  },
  getConversation(conversationId: number) {
    return api.get(`/api/conversations/${conversationId}`);
  },
  createConversation() {
    return api.post('/api/conversations');
  },
  deleteConversation(conversationId: number) {
    return api.delete(`/api/conversations/${conversationId}`);
  },
  getMessages(conversationId: number) {
    return api.get(`/api/conversations/${conversationId}/messages`);
  },
};