<template>
    <button @click="toggleTheme"
        class="focus:outline-none text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
        :aria-label="`Switch to ${oppositeTheme} mode`">
        <span v-if="theme === 'light'">
            <!-- Moon icon for dark mode -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 3v1m0 16v1m9-9h1M4 12H3m15.364-7.364l-.707.707M6.343 17.657l-.707.707m0-12.02l.707.707M17.657 17.657l.707.707" />
            </svg>
        </span>
        <span v-else>
            <!-- Sun icon for light mode -->
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2a9 9 0 000 18V2z" />
            </svg>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useThemeStore } from '@/stores/themeStore';

export default defineComponent({
    name: 'ThemeToggle',
    setup() {
        const themeStore = useThemeStore();

        const theme = computed(() => themeStore.theme);
        const oppositeTheme = computed(() => (theme.value === 'light' ? 'dark' : 'light'));

        const toggleTheme = () => {
            themeStore.setTheme(oppositeTheme.value);
        };

        return {
            theme,
            oppositeTheme,
            toggleTheme,
        };
    },
});
</script>