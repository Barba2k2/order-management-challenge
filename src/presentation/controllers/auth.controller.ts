import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  RegisterDto,
  LoginDto,
  LoginResponseDto,
  RegisterResponseDto,
} from '../../application/dtos/auth.dtos';
import {
  RegisterUseCase,
  LoginUseCase,
} from '../../application/use-cases/auth.use-cases';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true }))
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    const { token, user } = await this.registerUseCase.execute(
      registerDto.email,
      registerDto.password,
    );
    return {
      token,
      user: {
        id: user.id!,
        email: user.email,
      },
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ transform: true }))
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    const { token, user } = await this.loginUseCase.execute(
      loginDto.email,
      loginDto.password,
    );
    return {
      token,
      user: {
        id: user.id!,
        email: user.email,
      },
    };
  }
}
