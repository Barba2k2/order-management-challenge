import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsIn,
  IsOptional,
  Min,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {
  OrderState,
  ServiceStatus,
} from '../../domain/entities/order.entity';

export class ServiceDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @Min(0)
  value: number;

  @IsIn(['PENDING', 'DONE'])
  status: ServiceStatus;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  lab: string;

  @IsString()
  @IsNotEmpty()
  patient: string;

  @IsString()
  @IsNotEmpty()
  customer: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ServiceDto)
  services: ServiceDto[];
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

export class ListOrdersResponseDto {
  orders: OrderResponseDto[];
  total: number;
  page: number;
  totalPages: number;
}

export class ListOrdersQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number;

  @IsOptional()
  @IsIn(['CREATED', 'ANALYSIS', 'COMPLETED'])
  state?: OrderState;
}
