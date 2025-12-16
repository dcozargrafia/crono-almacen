import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ClientsModule } from './clients/clients.module';
import { DevicesModule } from './devices/devices.module';
import { ProductsModule } from './products/products.module';
import { ProductUnitsModule } from './product-units/product-units.module';
import { RentalsModule } from './rentals/rentals.module';
import { ChipTypesModule } from './chip-types/chip-types.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    ClientsModule,
    DevicesModule,
    ProductsModule,
    ProductUnitsModule,
    RentalsModule,
    ChipTypesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
