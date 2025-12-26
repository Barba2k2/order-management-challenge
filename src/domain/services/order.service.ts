import { Order, OrderState, Service } from '../entities/order.entity';

export class OrderDomainService {
  calculateTotalValue(services: Service[]): number {
    return services.reduce((total, service) => total + service.value, 0);
  }

  canTransitionState(currentState: OrderState, targetState: OrderState): boolean {
    const validTransitions: Record<OrderState, OrderState[]> = {
      CREATED: ['ANALYSIS'],
      ANALYSIS: ['COMPLETED'],
      COMPLETED: [] // No further transitions allowed
    };

    const allowedTransitions = validTransitions[currentState];
    return allowedTransitions.includes(targetState);
  }

  validateOrderForCreation(lab: string, patient: string, customer: string, services: Service[]): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!lab || lab.trim() === '') {
      errors.push('Lab is required');
    }

    if (!patient || patient.trim() === '') {
      errors.push('Patient is required');
    }

    if (!customer || customer.trim() === '') {
      errors.push('Customer is required');
    }

    if (!services || services.length === 0) {
      errors.push('Services array cannot be empty');
    } else {
      const totalValue = this.calculateTotalValue(services);
      if (totalValue <= 0) {
        errors.push('Total value must be greater than zero');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}