import { OrderState, ServiceStatus } from '../../domain/entities/order.entity';

export class CreateOrderDto {
  lab: string;
  patient: string;
  customer: string;
  services: Array<{
    name: string;
    value: number;
    status: ServiceStatus;
  }>;
}

export class UpdateOrderStateDto {
  state: OrderState;
}

export class OrderResponseDto {
  id: string;
  lab: string;
  patient: string;
  customer: string;
  state: OrderState;
  status: string;
  services: Array<{
    name: string;
    value: number;
    status: ServiceStatus;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export class ListOrdersQueryDto {
  page?: number;
  limit?: number;
  state?: OrderState;
}