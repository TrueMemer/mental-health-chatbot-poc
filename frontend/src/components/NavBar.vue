<template>
    <nav class="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div class="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
            <!-- Logo -->
            <router-link to="/" class="text-xl font-bold text-gray-900 dark:text-white">
                Mental Health Chatbot
            </router-link>

            <!-- Navigation Links and Theme Toggle -->
            <div class="flex items-center space-x-4">
                <ThemeToggle />

                <!-- Show these links if the user is not authenticated -->
                <template v-if="!isAuthenticated">
                    <router-link to="/login"
                        class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        Login
                    </router-link>
                    <router-link to="/register"
                        class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        Sign Up
                    </router-link>
                </template>

                <!-- Show this link if the user is authenticated -->
                <template v-else>
                    <router-link to="/chat"
                        class="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        Chats
                    </router-link>
                </template>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { useUserStore } from '@/stores/userStore';

export default defineComponent({
    name: 'NavBar',
    components: {
        ThemeToggle,
    },
    setup() {
        const userStore = useUserStore();


        onMounted(() => {
            if (!userStore.user && localStorage.getItem('token')) {
                userStore.fetchCurrentUser();
            }
        });

        const isAuthenticated = computed(() => userStore.isAuthenticated);

        return {
            isAuthenticated,
        };
    },
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>