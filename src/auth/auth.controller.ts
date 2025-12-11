import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  UseGuards,
} from '@nestjs/common';
import type { CurrentUser as CurrentUserType } from '../types/index.js';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Roles } from './decorators/roles.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * Demuestra el uso del decorador @CurrentUser().
   * Cualquier usuario autenticado puede acceder.
   */
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: CurrentUserType) {
    return user;
  }

  /**
   * Endpoint solo para administradores.
   * Demuestra el uso combinado de JwtAuthGuard + RolesGuard + @Roles().
   */
  @Get('admin-only')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  getAdminData(@CurrentUser() user: CurrentUserType) {
    return {
      message: '🎉 ¡Acceso concedido! Solo administradores pueden ver esto.',
      user,
    };
  }

  /**
   * Endpoint accesible por usuarios y administradores.
   * Demuestra @Roles() con múltiples roles.
   */
  @Get('user-or-admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('USER', 'ADMIN')
  getUserOrAdminData(@CurrentUser('nombre') nombre: string) {
    return {
      message: `Hola ${nombre}, tienes acceso como USER o ADMIN`,
    };
  }
}
