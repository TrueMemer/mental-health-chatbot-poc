import FlowManager from '../src/services/flow-manager';

describe('FlowManager', () => {
  let flowManager: FlowManager;

  beforeAll(() => {
    flowManager = new FlowManager();
  });

  it('should load flows correctly', () => {
    const flows = flowManager.getFlows();
    expect(flows.length).toBeGreaterThan(0);
  });

  it('should detect the correct flow based on trigger keywords', () => {
    const message = `I'm feeling stressed about work`;
    const flow = flowManager.detectFlow(message);
    expect(flow).toBeDefined();
    expect(flow?.id).toBe('stress_management_flow');
  });

  it('should return undefined when no flow matches', () => {
    const message = 'Random message without trigger';
    const flow = flowManager.detectFlow(message);
    expect(flow).toBeUndefined();
  });
});
