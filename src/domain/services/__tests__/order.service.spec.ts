import { describe, it, expect, beforeEach } from 'vitest';
import { OrderDomainService } from '../order.service';

describe('OrderDomainService', () => {
  let orderDomainService: OrderDomainService;

  beforeEach(() => {
    orderDomainService = new OrderDomainService();
  });

  describe('calculateTotalValue', () => {
    it('should calculate the total value of services', () => {
      const services = [
        { name: 'Service 1', value: 100, status: 'PENDING' as const },
        { name: 'Service 2', value: 200, status: 'PENDING' as const },
        { name: 'Service 3', value: 50, status: 'DONE' as const },
      ];

      const total = orderDomainService.calculateTotalValue(services);

      expect(total).toBe(350);
    });

    it('should return 0 for empty services array', () => {
      const services = [];

      const total = orderDomainService.calculateTotalValue(services);

      expect(total).toBe(0);
    });
  });

  describe('canTransitionState', () => {
    it('should allow transition from CREATED to ANALYSIS', () => {
      const canTransition = orderDomainService.canTransitionState(
        'CREATED',
        'ANALYSIS',
      );

      expect(canTransition).toBe(true);
    });

    it('should allow transition from ANALYSIS to COMPLETED', () => {
      const canTransition = orderDomainService.canTransitionState(
        'ANALYSIS',
        'COMPLETED',
      );

      expect(canTransition).toBe(true);
    });

    it('should not allow transition from CREATED to COMPLETED directly', () => {
      const canTransition = orderDomainService.canTransitionState(
        'CREATED',
        'COMPLETED',
      );

      expect(canTransition).toBe(false);
    });

    it('should not allow transition from COMPLETED to ANALYSIS', () => {
      const canTransition = orderDomainService.canTransitionState(
        'COMPLETED',
        'ANALYSIS',
      );

      expect(canTransition).toBe(false);
    });

    it('should not allow transition from ANALYSIS to CREATED', () => {
      const canTransition = orderDomainService.canTransitionState(
        'ANALYSIS',
        'CREATED',
      );

      expect(canTransition).toBe(false);
    });
  });

  describe('validateOrderForCreation', () => {
    it('should return valid for a complete order', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        'Patient X',
        'Customer Y',
        [
          { name: 'Service 1', value: 100, status: 'PENDING' },
          { name: 'Service 2', value: 50, status: 'DONE' },
        ],
      );

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid if lab is empty', () => {
      const result = orderDomainService.validateOrderForCreation(
        '',
        'Patient X',
        'Customer Y',
        [{ name: 'Service 1', value: 100, status: 'PENDING' }],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Lab is required');
    });

    it('should return invalid if patient is empty', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        '',
        'Customer Y',
        [{ name: 'Service 1', value: 100, status: 'PENDING' }],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Patient is required');
    });

    it('should return invalid if customer is empty', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        'Patient X',
        '',
        [{ name: 'Service 1', value: 100, status: 'PENDING' }],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer is required');
    });

    it('should return invalid if services array is empty', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        'Patient X',
        'Customer Y',
        [],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Services array cannot be empty');
    });

    it('should return invalid if total value is zero', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        'Patient X',
        'Customer Y',
        [{ name: 'Service 1', value: 0, status: 'PENDING' }],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total value must be greater than zero');
    });

    it('should return invalid if total value is negative', () => {
      const result = orderDomainService.validateOrderForCreation(
        'Lab A',
        'Patient X',
        'Customer Y',
        [{ name: 'Service 1', value: -100, status: 'PENDING' }],
      );

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total value must be greater than zero');
    });
  });
});
