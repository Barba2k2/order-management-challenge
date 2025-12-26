export class RegisterDto {
  email: string;
  password: string;
}

export class LoginDto {
  email: string;
  password: string;
}

export class LoginResponseDto {
  token: string;
  user: {
    id: string;
    email: string;
  };
}