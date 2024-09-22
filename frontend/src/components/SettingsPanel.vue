<template>
    <div class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
        <div class="bg-white rounded-lg w-1/2 p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-semibold">Settings</h2>
                <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
                    <!-- Close icon -->
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                        stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <!-- Settings content -->
            <p>Settings content goes here.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'SettingsPanel',
});
</script>

<style scoped>
/* Add any component-specific styles here */
</style>