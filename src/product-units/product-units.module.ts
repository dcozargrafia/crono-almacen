import { Module } from '@nestjs/common';
import { ProductUnitsService } from './product-units.service';
import { ProductUnitsController } from './product-units.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ProductUnitsController],
  providers: [ProductUnitsService, PrismaService],
})
export class ProductUnitsModule {}
