import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Order as OrderEntity,
  OrderState,
} from '../../../domain/entities/order.entity';
import { OrderRepository } from '../../../domain/repositories/order.repository';
import { Order, OrderDocument } from '../schemas/order.schema';

@Injectable()
export class MongoOrderRepository implements OrderRepository {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
  ) {}

  async create(
    order: Omit<OrderEntity, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<OrderEntity> {
    const createdOrder = new this.orderModel(order);
    const savedOrder = await createdOrder.save();

    const { _id, ...orderData } = savedOrder.toObject();
    return { id: _id.toString(), ...orderData };
  }

  async findById(id: string): Promise<OrderEntity | null> {
    const order = await this.orderModel.findById(id).exec();
    if (!order) return null;

    const { _id, ...orderData } = order.toObject();
    return { id: _id.toString(), ...orderData };
  }

  async findAll(
    page: number,
    limit: number,
    state?: OrderState,
  ): Promise<{ orders: OrderEntity[]; total: number }> {
    const query: { status: string; state?: OrderState } = { status: 'ACTIVE' };
    if (state) {
      query.state = state;
    }

    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.orderModel.countDocuments(query),
    ]);

    const mappedOrders = orders.map((order) => {
      const { _id, ...orderData } = order.toObject();
      return { id: _id.toString(), ...orderData };
    });

    return { orders: mappedOrders, total };
  }

  async update(
    id: string,
    order: Partial<OrderEntity>,
  ): Promise<OrderEntity | null> {
    const updatedOrder = await this.orderModel
      .findByIdAndUpdate(id, order, { new: true })
      .exec();

    if (!updatedOrder) return null;

    const { _id, ...orderData } = updatedOrder.toObject();
    return { id: _id.toString(), ...orderData };
  }
}
