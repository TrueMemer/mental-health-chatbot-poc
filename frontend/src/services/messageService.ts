import api from './api';

export default {
  getMessages() {
    return api.get('/api/messages');
  },
};