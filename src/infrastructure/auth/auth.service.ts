import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../domain/entities/user.entity';

export type TokenPayload = {
  userId: string;
  email: string;
};

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateJwtToken(payload: TokenPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '1d' });
  }

  verifyJwtToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch (error) {
      return null;
    }
  }

  createTokenPayload(user: User): TokenPayload {
    return {
      userId: user.id!,
      email: user.email,
    };
  }
}