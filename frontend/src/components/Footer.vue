<template>
    <footer class="bg-gray-100 border-t border-gray-200 p-4 text-center text-sm text-gray-600">
        <p>
            &copy; {{ new Date().getFullYear() }} Mental Health Chatbot. All rights reserved.
            | <a href="/terms" class="text-blue-500 hover:underline">Terms of Service</a>
            | <a href="/privacy" class="text-blue-500 hover:underline">Privacy Policy</a>
        </p>
    </footer>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'Footer',
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>