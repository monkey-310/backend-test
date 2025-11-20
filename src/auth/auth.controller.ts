import { Controller, Post, Body, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @Post('login')
  @ApiOperation({ summary: 'Generate JWT token' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'admin@example.com' },
        password: { type: 'string', example: 'password' },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Token generated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async login(@Body() loginDto: { email: string; password: string }) {
    const validEmail = process.env.AUTH_EMAIL || 'admin@example.com';
    const validPassword = process.env.AUTH_PASSWORD || 'password';

    if (loginDto.email === validEmail && loginDto.password === validPassword) {
      const payload = {
        sub: '1',
        email: loginDto.email,
      };
      const token = this.jwtService.sign(payload);
      return { access_token: token };
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
