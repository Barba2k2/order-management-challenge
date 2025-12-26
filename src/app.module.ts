import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from './infrastructure/database/schemas/user.schema';
import { Order, OrderSchema } from './infrastructure/database/schemas/order.schema';
import { MongoUserRepository } from './infrastructure/database/repositories/user.repository';
import { MongoOrderRepository } from './infrastructure/database/repositories/order.repository';
import type { UserRepository } from './domain/repositories/user.repository';
import type { OrderRepository } from './domain/repositories/order.repository';
import { AuthService } from './infrastructure/auth/auth.service';
import { AuthMiddleware } from './infrastructure/middleware/auth.middleware';
import { RegisterUseCase, LoginUseCase } from './application/use-cases/auth.use-cases';
import { CreateOrderUseCase, ListOrdersUseCase, AdvanceOrderUseCase } from './application/use-cases/order.use-cases';
import { OrderDomainService } from './domain/services/order.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { OrdersController } from './presentation/controllers/orders.controller';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://mongo:27017/order_management'),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Order.name, schema: OrderSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'default_secret',
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [
    AuthController,
    OrdersController,
  ],
  providers: [
    // Repositories
    { provide: 'UserRepository', useClass: MongoUserRepository },
    { provide: 'OrderRepository', useClass: MongoOrderRepository },

    // Domain Services
    OrderDomainService,

    // Application Services/Use Cases
    AuthService,
    AuthMiddleware,
    RegisterUseCase,
    LoginUseCase,
    CreateOrderUseCase,
    ListOrdersUseCase,
    AdvanceOrderUseCase,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/register', method: RequestMethod.POST },
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'health', method: RequestMethod.GET },
      )
      .forRoutes(
        { path: 'orders', method: RequestMethod.ALL },
        { path: 'orders/*', method: RequestMethod.ALL },
        { path: 'orders/:id', method: RequestMethod.ALL },
        { path: 'orders/:id/advance', method: RequestMethod.PATCH }
      );
  }
}