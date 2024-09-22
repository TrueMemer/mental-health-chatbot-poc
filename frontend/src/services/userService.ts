import api from './api';

export default {
    login(data: any) {
        return api.post('/api/auth/login', data);
    },
    getCurrentUser() {
        return api.get('/api/users/me');
    },
    updateUser(data: any) {
        return api.put('/api/users/me', data);
    },
};