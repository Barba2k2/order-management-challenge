import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvanceOrderUseCase } from '../order.use-cases';
import { OrderDomainService } from '../../../domain/services/order.service';

// Mock repository
const mockOrderRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
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

    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'CREATED',
      status: 'ACTIVE',
      services: [{ name: 'Service 1', value: 100, status: 'PENDING' }],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue({
      ...order,
      state: 'ANALYSIS',
    });

    const result = await advanceOrderUseCase.execute(orderId);

    expect(result.state).toBe('ANALYSIS');
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'ANALYSIS',
    });
  });

  it('should allow transition from ANALYSIS to COMPLETED', async () => {
    const orderId = 'order-id';

    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'ANALYSIS',
      status: 'ACTIVE',
      services: [{ name: 'Service 1', value: 100, status: 'PENDING' }],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue({
      ...order,
      state: 'COMPLETED',
    });

    const result = await advanceOrderUseCase.execute(orderId);

    expect(result.state).toBe('COMPLETED');
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'COMPLETED',
    });
  });

  it('should block direct transition from CREATED to COMPLETED', async () => {
    const orderId = 'order-id';

    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'CREATED',
      status: 'ACTIVE',
      services: [{ name: 'Service 1', value: 100, status: 'PENDING' }],
    };

    mockOrderRepository.findById.mockResolvedValue(order);
    mockOrderRepository.update.mockResolvedValue({
      ...order,
      state: 'ANALYSIS',
    });

    // The advance use case goes to ANALYSIS first, not directly to COMPLETED
    const result = await advanceOrderUseCase.execute(orderId);
    expect(result.state).toBe('ANALYSIS');
  });

  it('should block transition from COMPLETED to any other state', async () => {
    const orderId = 'order-id';

    const order = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'COMPLETED',
      status: 'ACTIVE',
      services: [{ name: 'Service 1', value: 100, status: 'PENDING' }],
    };

    mockOrderRepository.findById.mockResolvedValue(order);

    await expect(advanceOrderUseCase.execute(orderId)).rejects.toThrow(
      'Order is already completed and cannot be advanced',
    );
  });

  it('should follow state machine: CREATED -> ANALYSIS -> COMPLETED', async () => {
    const orderId = 'order-id';

    // Start with CREATED state
    const createdOrder = {
      id: orderId,
      lab: 'Lab A',
      patient: 'Patient X',
      customer: 'Customer Y',
      state: 'CREATED',
      status: 'ACTIVE',
      services: [{ name: 'Service 1', value: 100, status: 'PENDING' }],
    };

    // First transition: CREATED -> ANALYSIS
    mockOrderRepository.findById.mockResolvedValue(createdOrder);
    mockOrderRepository.update.mockResolvedValue({
      ...createdOrder,
      state: 'ANALYSIS',
    });

    const analysisResult = await advanceOrderUseCase.execute(orderId);
    expect(analysisResult.state).toBe('ANALYSIS');

    // Second transition: ANALYSIS -> COMPLETED
    mockOrderRepository.findById.mockResolvedValue({
      ...createdOrder,
      state: 'ANALYSIS',
    });
    mockOrderRepository.update.mockResolvedValue({
      ...createdOrder,
      state: 'COMPLETED',
    });

    const completedResult = await advanceOrderUseCase.execute(orderId);
    expect(completedResult.state).toBe('COMPLETED');
  });
});
