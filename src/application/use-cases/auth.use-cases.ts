import { Injectable, UnauthorizedException, Inject } from '@nestjs/common';
import type { UserRepository } from '../../domain/repositories/user.repository';
import { AuthService } from '../../infrastructure/auth/auth.service';
import { User } from '../../domain/entities/user.entity';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await this.authService.hashPassword(password);

    // Create the user
    const user = await this.userRepository.create({
      email,
      password: hashedPassword,
    });

    // Generate JWT token
    const tokenPayload = this.authService.createTokenPayload(user);
    const token = this.authService.generateJwtToken(tokenPayload);

    return { token, user };
  }
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject('UserRepository') private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {}

  async execute(
    email: string,
    password: string,
  ): Promise<{ token: string; user: User }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await this.authService.verifyPassword(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const tokenPayload = this.authService.createTokenPayload(user);
    const token = this.authService.generateJwtToken(tokenPayload);

    return { token, user };
  }
}
