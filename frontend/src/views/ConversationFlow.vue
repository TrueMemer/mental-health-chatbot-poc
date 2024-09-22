<template>
    <div class="p-6">
        <FlowVisualization :userId="userId" :flowId="flowId" />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FlowVisualization from '@/components/FlowVisualization.vue';
import { useRoute } from 'vue-router';

export default defineComponent({
    name: 'ConversationFlow',
    components: {
        FlowVisualization,
    },
    setup() {
        const route = useRoute();
        const userId = Number(route.params.userId);
        const flowId = String(route.params.flowId);

        return {
            userId,
            flowId,
        };
    },
});
</script>

<style scoped>
/* Add any custom styles here */
</style>