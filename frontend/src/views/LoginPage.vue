<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div class="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 shadow-md rounded">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                    Sign in to your account
                </h2>
            </div>
            <form @submit.prevent="login" class="mt-8 space-y-6">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <label for="email" class="sr-only">Email address</label>
                        <input v-model="email" id="email" name="email" type="email" autocomplete="email" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Email address" />
                    </div>
                    <div>
                        <label for="password" class="sr-only">Password</label>
                        <input v-model="password" id="password" name="password" type="password"
                            autocomplete="current-password" required
                            class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                            placeholder="Password" />
                    </div>
                </div>

                <div v-if="error" class="text-red-500 dark:text-red-400 text-sm">
                    {{ error }}
                </div>

                <div>
                    <button type="submit"
                        class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none">
                        Sign In
                    </button>
                </div>

                <div class="flex items-center justify-center">
                    <span class="text-sm text-gray-600 dark:text-gray-300">Or</span>
                </div>

                <div>
                    <button type="button" @click="googleLogin"
                        class="group relative w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none">
                        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google"
                            class="w-5 h-5 mr-2" />
                        Sign in with Google
                    </button>
                </div>

                <div class="text-sm text-center text-gray-600 dark:text-gray-300">
                    Don't have an account?
                    <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                        Sign up
                    </router-link>
                </div>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
    name: 'LoginPage',
    setup() {
        const userStore = useUserStore();
        const email = ref('');
        const password = ref('');
        const error = computed(() => userStore.error);

        const login = async () => {
            await userStore.login({ email: email.value, password: password.value })
        };

        const googleLogin = () => {
            window.location.href = `${import.meta.env.VITE_APP_API_URL}/api/auth/google`;
        };

        return {
            email,
            password,
            error,
            login,
            googleLogin,
        };
    },
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>