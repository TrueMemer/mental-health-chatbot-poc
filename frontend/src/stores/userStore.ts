import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import userService from '@/services/userService';
import router from '@/router';
import { updateSocketToken } from '@/services/socket';

interface User {
    id: number;
    email: string;
    name: string;
    avatarUrl?: string;
}

export const useUserStore = defineStore('userStore', () => {
    const user = ref<User | null>(null);
    const error = ref<string | null>(null);


    const fetchCurrentUser = async () => {
        try {
            const response = await userService.getCurrentUser();
            user.value = response.data;
        } catch (err) {
            console.error('Failed to fetch user information:', err);
            error.value = 'Failed to fetch user information.';
        }
    };

    const isAuthenticated = computed(() => {
        return !!user.value;
    });

    const login = async (credentials: { email: string; password: string }) => {
        try {
            const response = await userService.login(credentials);
            localStorage.setItem('token', response.data.token);
            user.value = response.data.user;

            updateSocketToken(response.data.token);

            router.push('/chat');
        } catch (err: any) {
            console.error('Login failed:', err);
            error.value = err.response?.data?.message || 'Login failed.';
        }
    };

    const register = async (credentials: { email: string; password: string }) => {
        try {
            const response = await userService.register(credentials);
            localStorage.setItem('token', response.data.token);
            user.value = response.data.user;

            updateSocketToken(response.data.token);

            router.push('/chat');
        } catch (err: any) {
            console.error('Register failed:', err);
            error.value = err.response?.data?.message || 'Register failed.';
        }
    };


    const updateUserProfile = async (updatedData: Partial<User>) => {
        try {
            const response = await userService.updateUser(updatedData);
            user.value = response.data;
        } catch (err) {
            console.error('Failed to update user profile:', err);
            error.value = 'Failed to update user profile.';
        }
    };


    const logout = () => {
        localStorage.removeItem('token');
        user.value = null;
        router.push('/login');
    };

    return {
        user,
        error,
        fetchCurrentUser,
        updateUserProfile,
        logout,
        isAuthenticated,
        login,
        register
    };
});
