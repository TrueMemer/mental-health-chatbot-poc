<template>
    <div class="min-h-screen flex items-center justify-center">
        <p>Signing you in...</p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/router';

export default defineComponent({
    name: 'GoogleAuthSuccess',
    setup() {
        const route = useRoute();

        const token = route.query.token as string;

        if (token) {
            localStorage.setItem('token', token);
            router.push('/chat');
        } else {
            router.push('/login');
        }

        return {};
    },
});
</script>