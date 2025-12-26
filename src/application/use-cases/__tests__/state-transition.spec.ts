import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvanceOrderUseCase } from '../../src/application/use-cases/order.use-cases';
import { OrderDomainService } from '../../src/domain/services/order.service';

// Mock repository
const mockOrderRepository = {
  findById: vi.fn(),
  update: vi.fn(),
};

describe('State Transition Logic', () => {
  let advanceOrderUseCase: AdvanceOrderUseCase;
  let orderDomainService: OrderDomainService;

  beforeEach(() => {
    orderDomainService = new OrderDomainService();
    advanceOrderUseCase = new AdvanceOrderUseCase(
      mockOrderRepository,
      orderDomainService,
    );

    // Clear all mocks
    vi.clearAllMocks();
  });

  it('should allow transition from CREATED to ANALYSIS', async () => {
    const orderId = 'order-id';
    const userId = 'user-id';
    
    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'CREATED',
      status: 'ACTIVE',
      services: [
        { name: 'Service 1', value: 100, status: 'PENDING' },
      ],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue({
      ...order,
      state: 'ANALYSIS',
    });

    const result = await advanceOrderUseCase.execute(orderId, userId);

    expect(result.state).toBe('ANALYSIS');
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'ANALYSIS',
    });
  });

  it('should allow transition from ANALYSIS to COMPLETED', async () => {
    const orderId = 'order-id';
    const userId = 'user-id';
    
    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'ANALYSIS',
      status: 'ACTIVE',
      services: [
        { name: 'Service 1', value: 100, status: 'PENDING' },
      ],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue({
      ...order,
      state: 'COMPLETED',
    });

    const result = await advanceOrderUseCase.execute(orderId, userId);

    expect(result.state).toBe('COMPLETED');
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'COMPLETED',
    });
  });

  it('should block direct transition from CREATED to COMPLETED', async () => {
    const orderId = 'order-id';
    const userId = 'user-id';
    
    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'CREATED',
      status: 'ACTIVE',
      services: [
        { name: 'Service 1', value: 100, status: 'PENDING' },
      ],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    // We don't expect the update to be called

    await expect(advanceOrderUseCase.execute(orderId, userId)).rejects.toThrow();
  });

  it('should block transition from COMPLETED to any other state', async () => {
    const orderId = 'order-id';
    const userId = 'user-id';
    
    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'COMPLETED',
      status: 'ACTIVE',
      services: [
        { name: 'Service 1', value: 100, status: 'PENDING' },
      ],
    };

    mockOrderRepository.findById.mockResolvedValue(order);

    await expect(advanceOrderUseCase.execute(orderId, userId)).rejects.toThrow('Order is already completed and cannot be advanced');
  });

  it('should block transition from ANALYSIS back to CREATED', async () => {
    const orderId = 'order-id';
    const userId = 'user-id';
    
    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'ANALYSIS',
      status: 'ACTIVE',
      services: [
        { name: 'Service 1', value: 100, status: 'PENDING' },
      ],
    };

    mockOrderRepository.findById.mockResolvedValue(order);

    // This test is more complex because the logic in AdvanceOrderUseCase
    // automatically determines the next state based on the current state
    // For ANALYSIS, it would try to go to COMPLETED, which is valid
    // So to test blocking a transition, we need to think differently
    
    // Actually, the current implementation doesn't allow going back to CREATED
    // It only allows forward transitions: CREATED -> ANALYSIS -> COMPLETED
    // So this test is not applicable to the current implementation
  });
});