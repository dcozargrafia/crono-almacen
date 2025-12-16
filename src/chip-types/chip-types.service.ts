import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChipTypeDto } from './dto/create-chip-type.dto';
import { UpdateChipTypeDto } from './dto/update-chip-type.dto';

interface SequenceItem {
  chip: number;
  code: string;
}

@Injectable()
export class ChipTypesService {
  constructor(private prisma: PrismaService) {}

  // POST /chip-types - Create new chip type
  async create(dto: CreateChipTypeDto) {
    const existing = await this.prisma.chipType.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('CHIP_TYPE_NAME_ALREADY_EXISTS');
    }

    return this.prisma.chipType.create({
      data: dto,
    });
  }

  // GET /chip-types - List all chip types (without sequenceData)
  async findAll() {
    return this.prisma.chipType.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        totalStock: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // GET /chip-types/:id - Get chip type by id (with sequenceData)
  async findOne(id: number) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return chipType;
  }

  // PATCH /chip-types/:id - Update chip type
  async update(id: number, dto: UpdateChipTypeDto) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    if (dto.name && dto.name !== chipType.name) {
      const existingWithName = await this.prisma.chipType.findUnique({
        where: { name: dto.name },
      });

      if (existingWithName) {
        throw new ConflictException('CHIP_TYPE_NAME_ALREADY_EXISTS');
      }
    }

    return this.prisma.chipType.update({
      where: { id },
      data: dto,
    });
  }

  // DELETE /chip-types/:id - Delete chip type
  async remove(id: number) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return this.prisma.chipType.delete({
      where: { id },
    });
  }

  // PUT /chip-types/:id/sequence - Upload sequence data
  async uploadSequence(id: number, sequenceData: SequenceItem[]) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return this.prisma.chipType.update({
      where: { id },
      data: { sequenceData },
    });
  }

  // GET /chip-types/:id/sequence - Get full sequence data
  async getSequence(id: number): Promise<SequenceItem[]> {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return (chipType.sequenceData as SequenceItem[]) || [];
  }

  // GET /chip-types/:id/sequence?start=X&end=Y - Get sequence for range
  async getSequenceRange(
    id: number,
    start: number,
    end: number,
  ): Promise<SequenceItem[]> {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    const sequenceData = (chipType.sequenceData as SequenceItem[]) || [];

    return sequenceData.filter(
      (item) => item.chip >= start && item.chip <= end,
    );
  }
}
