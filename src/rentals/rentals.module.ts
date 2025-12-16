import { Module } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { RentalsController } from './rentals.controller';
import { PrismaService } from '../prisma.service';
import { ProductsService } from '../products/products.service';

@Module({
  providers: [RentalsService, PrismaService, ProductsService],
  controllers: [RentalsController],
})
export class RentalsModule {}
