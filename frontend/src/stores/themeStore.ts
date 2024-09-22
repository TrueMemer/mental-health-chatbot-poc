import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useThemeStore = defineStore('themeStore', () => {
  const theme = ref(localStorage.getItem('theme') || 'light');

  const setTheme = (newTheme: string) => {
    theme.value = newTheme;
  };

  watch(
    () => theme.value,
    (newTheme) => {
      if (newTheme === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    },
    { immediate: true }
  );

  return {
    theme,
    setTheme,
  };
});