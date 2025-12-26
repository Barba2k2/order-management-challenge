import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { CreateOrderDto, ListOrdersQueryDto } from '../../application/dtos/order.dtos';
import { CreateOrderUseCase, ListOrdersUseCase, AdvanceOrderUseCase } from '../../application/use-cases/order.use-cases';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly listOrdersUseCase: ListOrdersUseCase,
    private readonly advanceOrderUseCase: AdvanceOrderUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Req() req: Request,
  ) {
    const user = (req as any).user; // Access user from auth middleware

    const order = await this.createOrderUseCase.execute(
      createOrderDto.lab,
      createOrderDto.patient,
      createOrderDto.customer,
      createOrderDto.services,
    );

    return order;
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async listOrders(
    @Query() query: ListOrdersQueryDto,
  ) {
    const { page = 1, limit = 10, state } = query;

    const result = await this.listOrdersUseCase.execute(
      page,
      limit,
      state,
    );

    return result;
  }

  @Patch(':id/advance')
  @HttpCode(HttpStatus.OK)
  async advanceOrder(
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const user = (req as any).user; // Access user from auth middleware

    const order = await this.advanceOrderUseCase.execute(id, user.userId);

    return order;
  }
}