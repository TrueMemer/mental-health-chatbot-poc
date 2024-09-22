<template>
    <div>
        <h2 class="text-xl font-semibold mb-4">Conversation Flow Visualization</h2>
        <div v-if="chartDefinition">
            <vue-mermaid-string :value="chartDefinition" />
        </div>
        <div v-else>
            <p>No conversation data available for this user and flow.</p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import interactionsService from '@/services/interactionsService';
import VueMermaidString from 'vue-mermaid-string'

export default defineComponent({
    name: 'FlowVisualization',
    components: {
        VueMermaidString
    },
    props: {
        userId: {
            type: Number,
            required: true,
        },
        flowId: {
            type: String,
            required: true,
        },
    },
    setup(props) {
        const chartDefinition = ref('');

        onMounted(async () => {
            try {
                const response = await interactionsService.getConversationPath(props.userId, props.flowId);
                const interactions = response.data;
                console.log('Interactions:', interactions);


                chartDefinition.value = generateMermaidDefinition(interactions);
                console.log('Chart Definition:', chartDefinition.value);
            } catch (error) {
                console.error('Error fetching conversation path:', error);
            }
        });


        const generateMermaidDefinition = (interactions: any[]) => {
            if (interactions.length === 0) {
                return 'graph TD;\nEmpty["No interactions available"];';
            }

            let definition = 'graph TD;\n';

            for (let i = 0; i < interactions.length; i++) {
                const interaction = interactions[i];
                const nextInteraction = interactions[i + 1];


                const userNodeId = `User${i}`;
                const userNodeLabel = interaction.message.replace(/"/g, '\\"');
                definition += `${userNodeId}["${userNodeLabel}"]:::userNode;\n`;
                const botNodeId = `Bot${i}`;


                if (interaction.response) {
                    const botNodeLabel = interaction.response.replace(/"/g, '\\"');
                    definition += `${botNodeId}("${botNodeLabel}"):::botNode;\n`;

                    definition += `${userNodeId} --> ${botNodeId};\n`;
                }


                if (nextInteraction) {
                    const nextUserNodeId = `User${i + 1}`;
                    if (interaction.response) {

                        definition += `${botNodeId} --> ${nextUserNodeId};\n`;
                    } else {

                        definition += `${userNodeId} --> ${nextUserNodeId};\n`;
                    }
                }
            }


            definition += `
    classDef userNode fill:#D5F5E3,stroke:#1E8449,stroke-width:2px;
    classDef botNode fill:#AED6F1,stroke:#2471A3,stroke-width:2px;
  `;

            return definition;
        };

        return {
            chartDefinition,
        };
    },
});
</script>

<style scoped>
/* Add any custom styles here */
</style>