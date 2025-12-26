import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import type { OrderState, OrderStatus, ServiceStatus } from '../../../domain/entities/order.entity';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true })
export class Order {
  @Prop({ required: true })
  lab: string;

  @Prop({ required: true })
  patient: string;

  @Prop({ required: true })
  customer: string;

  @Prop({ required: true, enum: ['CREATED', 'ANALYSIS', 'COMPLETED'], default: 'CREATED' })
  state: OrderState;

  @Prop({ required: true, enum: ['ACTIVE', 'DELETED'], default: 'ACTIVE' })
  status: OrderStatus;

  @Prop([
    {
      name: { type: String, required: true },
      value: { type: Number, required: true },
      status: { type: String, enum: ['PENDING', 'DONE'], required: true }
    }
  ])
  services: Array<{
    name: string;
    value: number;
    status: ServiceStatus;
  }>;
}

export const OrderSchema = SchemaFactory.createForClass(Order);