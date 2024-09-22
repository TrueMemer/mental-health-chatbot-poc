<template>
    <div class="flex items-center space-x-1">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
    </div>
</template>

<script setup>

</script>

<style scoped>
.typing-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    background-color: #3b82f6;
    /* Tailwind color for blue-500 */
    border-radius: 50%;
    animation: typing 1s infinite alternate;
}

.typing-dot:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    from {
        opacity: 0.3;
    }

    to {
        opacity: 1;
    }
}
</style>