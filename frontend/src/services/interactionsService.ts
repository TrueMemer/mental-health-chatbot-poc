import api from "./api";

export default {
    getInteractions() {
        return api.get('/api/interactions');
    },
    getInteractionsByUser(userId: number) {
        return api.get(`/api/interactions/user/${userId}`);
    },
    getInteractionsByFlow(flowId: string) {
        return api.get(`/api/interactions/flow/${flowId}`);
    },
    getConversationPath(userId: number, flowId: string) {
        return api.get(`/api/interactions/conversation-path/${userId}/${flowId}`);
    },
};
