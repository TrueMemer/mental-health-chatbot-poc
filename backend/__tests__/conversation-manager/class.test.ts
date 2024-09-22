import ConversationManager from "../../src/services/conversation-manager";
import FlowManager from "../../src/services/flow-manager";

jest.mock('../../src/services/ai-responder');
jest.mock('../../src/services/redis', () => {
    const RedisMock = require('redis-mock');
    const redis = RedisMock.createClient();

    return {
        __esModule: true,
        default: redis,
    };
});

describe('ConversationManager', () => {
    let flowManager: FlowManager;
    let conversationManager: ConversationManager;

    beforeAll(() => {
        flowManager = new FlowManager();
        conversationManager = new ConversationManager(flowManager);
    });

    it('should start a new flow when a trigger message is received', async () => {
        const userId = '1';
        const message = `I'm feeling stressed about work`;

        const response = await conversationManager.handleMessage(userId, message);
        expect(response).toBeDefined();
        expect(response).toContain("I'm sorry to hear that you're feeling stressed. Would you like to talk about what's causing it?");
    });

    it('should continue the flow based on user responses', async () => {
        const userId = '1';
        await conversationManager.handleMessage(userId, `I'm feeling stressed about work`); // Start flow

        const response = await conversationManager.handleMessage(userId, 'Sure');
        expect(response).toBeDefined();
    });

    it('should handle unknown messages with AI response when not in flow', async () => {
        const userId = '2';
        const message = 'Hello, how are you?';

        const response = await conversationManager.handleMessage(userId, message);
        expect(response).toBe('');
    });
});
