<template>
    <div class="relative">
        <!-- User Toolbar -->
        <div @click="toggleMenu" class="p-4 flex items-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
            <img :src="userAvatar" alt="User Avatar" class="h-10 w-10 rounded-full object-cover" />
            <div class="ml-3">
                <p class="text-gray-800 dark:text-gray-100 font-medium">
                    {{ userName }}
                </p>
            </div>
            <svg :class="{
                'transform rotate-180': isMenuOpen,
            }" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-auto text-gray-600 dark:text-gray-300" fill="none"
                viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
        </div>

        <!-- Collapsible Menu -->
        <transition name="fade">
            <div v-if="isMenuOpen" class="absolute bottom-full left-0 w-full bg-white dark:bg-gray-800 shadow-md">
                <ul>
                    <li>
                        <router-link to="/profile"
                            class="block px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                            @click="toggleMenu">
                            Profile Settings
                        </router-link>
                    </li>
                    <li>
                        <button @click="logout"
                            class="w-full text-left px-4 py-2 text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none">
                            Logout
                        </button>
                    </li>
                </ul>
            </div>
        </transition>
    </div>
</template>

<script lang="ts">
import { useUserStore } from '@/stores/userStore';
import { defineComponent, ref, computed } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
    name: 'UserToolbar',
    setup() {
        const userStore = useUserStore();
        const router = useRouter();
        const isMenuOpen = ref(false);

        const toggleMenu = () => {
            isMenuOpen.value = !isMenuOpen.value;
        };

        const userAvatar = computed(() => {
            return userStore.user?.avatarUrl || 'https://via.placeholder.com/40';
        });

        const userName = computed(() => {
            return userStore.user?.name || 'Anonymous';
        });

        const logout = () => {

            localStorage.removeItem('token');
            userStore.user = null;
            router.push('/login');
        };

        return {
            isMenuOpen,
            toggleMenu,
            userAvatar,
            userName,
            logout,
        };
    },
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>