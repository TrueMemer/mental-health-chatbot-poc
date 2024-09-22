<template>
    <div class="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4">
            <div class="px-6 py-4">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {{ title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 mt-2">
                    {{ message }}
                </p>
            </div>
            <div class="px-6 py-4 bg-gray-100 dark:bg-gray-700 flex justify-end space-x-2">
                <button @click="$emit('cancel')"
                    class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500 focus:outline-none">
                    Cancel
                </button>
                <button @click="$emit('confirm')"
                    class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none">
                    Confirm
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'ConfirmationModal',
    props: {
        title: {
            type: String,
            default: 'Confirm Action',
        },
        message: {
            type: String,
            default: 'Are you sure you want to proceed?',
        },
    },
});
</script>