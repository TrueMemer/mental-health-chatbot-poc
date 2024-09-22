<template>
    <footer class="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div class="max-w-screen-xl mx-auto px-4 py-2">
            <div class="flex flex-col items-center">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                    &copy; {{ new Date().getFullYear() }} Mental Health Chatbot. All rights reserved.
                </p>
            </div>
        </div>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LandingFooter',
});
</script>

<style scoped>
/* Add any additional styles if necessary */
</style>