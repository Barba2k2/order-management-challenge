import { Injectable } from '@nestjs/common';
import { OrderDomainService } from '../../domain/services/order.service';

@Injectable()
export class OrderValidator {
  constructor(private readonly orderDomainService: OrderDomainService) {}

  validateOrderCreation(
    lab: string,
    patient: string,
    customer: string,
    services: Array<{
      name: string;
      value: number;
      status: 'PENDING' | 'DONE';
    }>,
  ): { isValid: boolean; errors: string[] } {
    return this.orderDomainService.validateOrderForCreation(
      lab,
      patient,
      customer,
      services,
    );
  }

  validateStateTransition(currentState: string, targetState: string): boolean {
    const validTransitions: Record<string, string[]> = {
      CREATED: ['ANALYSIS'],
      ANALYSIS: ['COMPLETED'],
      COMPLETED: [], // No further transitions allowed
    };

    const allowedTransitions = validTransitions[currentState];
    return allowedTransitions?.includes(targetState) ?? false;
  }
}
