import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import type { OrderRepository } from '../../domain/repositories/order.repository';
import { OrderDomainService } from '../../domain/services/order.service';
import { Order, OrderState } from '../../domain/entities/order.entity';

@Injectable()
export class CreateOrderUseCase {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(
    lab: string,
    patient: string,
    customer: string,
    services: Array<{
      name: string;
      value: number;
      status: 'PENDING' | 'DONE';
    }>,
  ): Promise<Order> {
    // Validate order for creation
    const validation = this.orderDomainService.validateOrderForCreation(
      lab,
      patient,
      customer,
      services,
    );

    if (!validation.isValid) {
      throw new BadRequestException(validation.errors);
    }

    // Create the order
    return await this.orderRepository.create({
      lab,
      patient,
      customer,
      state: 'CREATED', // Default state
      status: 'ACTIVE', // Default status
      services,
    });
  }
}

@Injectable()
export class ListOrdersUseCase {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
  ) {}

  async execute(
    page: number = 1,
    limit: number = 10,
    state?: OrderState,
  ): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const { orders, total } = await this.orderRepository.findAll(
      page,
      limit,
      state,
    );

    const totalPages = Math.ceil(total / limit);

    return {
      orders,
      total,
      page,
      totalPages,
    };
  }
}

@Injectable()
export class AdvanceOrderUseCase {
  constructor(
    @Inject('OrderRepository')
    private readonly orderRepository: OrderRepository,
    private readonly orderDomainService: OrderDomainService,
  ) {}

  async execute(orderId: string): Promise<Order> {
    // Get the current order
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Check if the order is already completed
    if (order.state === 'COMPLETED') {
      throw new BadRequestException(
        'Order is already completed and cannot be advanced',
      );
    }

    // Determine the next state based on current state
    const nextState: OrderState =
      order.state === 'CREATED' ? 'ANALYSIS' : 'COMPLETED';

    // Validate if the transition is allowed
    if (!this.orderDomainService.canTransitionState(order.state, nextState)) {
      throw new ForbiddenException(
        `Invalid state transition: ${order.state} -> ${nextState}`,
      );
    }

    // Update the order state
    const updatedOrder = await this.orderRepository.update(orderId, {
      state: nextState,
    });

    if (!updatedOrder) {
      throw new BadRequestException('Failed to update order state');
    }

    return updatedOrder;
  }
}
