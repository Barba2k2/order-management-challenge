import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AdvanceOrderUseCase } from '../../use-cases/order.use-cases';
import { OrderDomainService } from '../../../domain/services/order.service';

// Mock repository
const mockOrderRepository = {
  create: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  update: vi.fn(),
};

describe('AdvanceOrderUseCase', () => {
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

  it('should advance order state from CREATED to ANALYSIS', async () => {
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

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'ANALYSIS',
    });
    expect(result.state).toBe('ANALYSIS');
  });

  it('should advance order state from ANALYSIS to COMPLETED', async () => {
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

    expect(mockOrderRepository.findById).toHaveBeenCalledWith(orderId);
    expect(mockOrderRepository.update).toHaveBeenCalledWith(orderId, {
      state: 'COMPLETED',
    });
    expect(result.state).toBe('COMPLETED');
  });

  it('should throw error if order is not found', async () => {
    const orderId = 'non-existent-id';

    mockOrderRepository.findById.mockResolvedValue(null);

    await expect(advanceOrderUseCase.execute(orderId)).rejects.toThrow(
      'Order not found',
    );
  });

  it('should throw error if order is already completed', async () => {
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

  it('should throw error for invalid state transition', async () => {
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

    // The completed check comes before the state transition check
    await expect(advanceOrderUseCase.execute(orderId)).rejects.toThrow(
      'Order is already completed and cannot be advanced',
    );
  });
});
