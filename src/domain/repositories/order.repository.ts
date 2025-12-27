import { Order, OrderState } from '../entities/order.entity';

export interface OrderRepository {
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  findById(id: string): Promise<Order | null>;
  findAll(
    page: number,
    limit: number,
    state?: OrderState,
  ): Promise<{ orders: Order[]; total: number }>;
  update(id: string, order: Partial<Order>): Promise<Order | null>;
}
