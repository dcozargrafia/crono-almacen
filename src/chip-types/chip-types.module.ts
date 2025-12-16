import { Module } from '@nestjs/common';
import { ChipTypesService } from './chip-types.service';
import { ChipTypesController } from './chip-types.controller';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [ChipTypesService, PrismaService],
  controllers: [ChipTypesController],
  exports: [ChipTypesService],
})
export class ChipTypesModule {}
