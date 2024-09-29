import { InMemoryCache } from "#/cache-adapters/in-memory";
import { FlowMachine } from "#/flow-machine";
import { FlowAdapter, UserState } from "#/interfaces/flow";
import path from "path";

jest.mock("openai", () => {
  return {
      __esModule: true,
      default: jest.fn().mockImplementation(() => {
          return {
          };
      }),
  };
});

export class TestAdapter implements FlowAdapter {
  name = "testAdapter";
  constructor() { }

  public async sendMessage(chatId: string, message: string) {
      console.log(`TestAdapter [${chatId}]: ${message}`);
  }
}

describe("FlowMachine Integration Tests", () => {
    let flowMachine: FlowMachine;
    let mockCache: InMemoryCache;

    beforeEach(() => {
        jest.resetAllMocks();

        mockCache = new InMemoryCache();
        flowMachine = new FlowMachine();
        flowMachine.stateAdapter = mockCache
        flowMachine.registerAdapter(new TestAdapter())

        const testFlowsDir = path.join(__dirname, 'flows');
        flowMachine.loadFlows(testFlowsDir);
    });

    test("Should load flows correctly from test flows directory", () => {
        expect(flowMachine.flows.length).toBe(1);
        expect(flowMachine.flows[0].slug).toBe("faq_flow");
    });

    test("Should initiate a flow and set user state", async () => {
        const chatId = "user123";
        const initialMessage = "I want to ask about payments.";

        await flowMachine.initiateFlow("testAdapter", chatId, initialMessage, "", false);

        const userState = await mockCache.get(`user-state:${chatId}`) as UserState;
        expect(userState).not.toBeNull();
        expect(userState?.flow.slug).toBe("faq_flow");
        expect(userState?.currentStepId).toBe("start");
        expect(userState?.currentStepActionIndex).toBe(0);
    });

    test("Should handle user input and progress through shipping flow", async () => {
        const chatId = "user123";
        const initialMessage = "I have a question about shipping.";

        await flowMachine.initiateFlow("testAdapter", chatId, initialMessage, "", false);

        let response = await flowMachine.handleInput("testAdapter", chatId, initialMessage);

        let userState = await mockCache.get(`user-state:${chatId}`) as UserState;
        expect(userState?.currentStepId).toBe("classify_faq");
        expect(userState?.waitingForInput).toBe(true);

        const userResponse = "Tell me about shipping.";

        response = await flowMachine.handleInput("testAdapter", chatId, userResponse);

        userState = await mockCache.get(`user-state:${chatId}`) as UserState;
        expect(response.outputMessages).toContain("Our shipping options include Standard (5-7 business days) and Expedited (2-3 business days). Shipping costs are calculated based on your location and order size at checkout.");
    });

    test("Should handle fallback when input does not match any flow", async () => {
        const chatId = "user456";
        const initialMessage = "I need help";

        await flowMachine.initiateFlow("testAdapter", chatId, initialMessage, "", false);

        let response = await flowMachine.handleInput("testAdapter", chatId, initialMessage);

        const userResponse = "I need some help with something else.";
        response = await flowMachine.handleInput("testAdapter", chatId, userResponse);

        expect(response?.outputMessages).toContain("I'm sorry, I didn't understand that. Could you please specify if you need help with Shipping, Returns, or Payments?");
    });

    test("Should handle error when initiating non-existent flow", async () => {
        const chatId = "user789";
        const initialMessage = "Start a non-existent flow.";

        await expect(flowMachine.initiateFlow("testAdapter", chatId, initialMessage, "invalid_flow", false))
            .rejects
            .toThrow("Override Flow failed, flow doesn't exist");
    });

    test("Should delete user state when flow ends", async () => {
        const chatId = "user102";
        const initialMessage = "I need help.";

        await flowMachine.initiateFlow("testAdapter", chatId, initialMessage, "", false);

        await flowMachine.handleInput("testAdapter", chatId, initialMessage);

        let userState = await mockCache.get(`user-state:${chatId}`) as UserState;
        expect(userState?.currentStepId).toBe("classify_faq");
        expect(userState?.waitingForInput).toBe(true);

        const userResponse = "I need to return a product.";

        const resp = await flowMachine.handleInput("testAdapter", chatId, userResponse);

        userState = await mockCache.get(`user-state:${chatId}`) as UserState;
        expect(resp?.outputMessages).toContain("You can return items within 30 days of receipt for a full refund or exchange. Please visit our Returns Center to initiate a return.");
        expect(resp.flowEnded).toBe(true);
        const deletedState = await mockCache.get(`user-state:${chatId}`);
        expect(deletedState).toBeNull();
    });
});
