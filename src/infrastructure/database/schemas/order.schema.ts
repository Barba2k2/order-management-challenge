import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type {
  OrderState,
  OrderStatus,
  ServiceStatus,
} from '../../../domain/entities/order.entity';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: String, required: true })
  lab: string;

  @Prop({ type: String, required: true })
  patient: string;

  @Prop({ type: String, required: true })
  customer: string;

  @Prop({
    type: String,
    required: true,
    enum: ['CREATED', 'ANALYSIS', 'COMPLETED'],
    default: 'CREATED',
  })
  state: OrderState;

  @Prop({
    type: String,
    required: true,
    enum: ['ACTIVE', 'DELETED'],
    default: 'ACTIVE',
  })
  status: OrderStatus;

  @Prop([
    {
      name: { type: String, required: true },
      value: { type: Number, required: true },
      status: { type: String, enum: ['PENDING', 'DONE'], required: true },
    },
  ])
  services: Array<{
    name: string;
    value: number;
    status: ServiceStatus;
  }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
