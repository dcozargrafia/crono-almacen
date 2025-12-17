import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { PrismaService } from '../prisma.service';
import { CreateChipTypeDto } from './dto/create-chip-type.dto';
import { UpdateChipTypeDto } from './dto/update-chip-type.dto';

export interface SequenceItem {
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

  // PUT /chip-types/:id/sequence - Upload sequence data (internal)
  async uploadSequence(id: number, sequenceData: SequenceItem[]) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return this.prisma.chipType.update({
      where: { id },
      data: { sequenceData: sequenceData as unknown as object[] },
    });
  }

  // PUT /chip-types/:id/sequence - Upload sequence from CSV file
  async uploadSequenceFromCsv(id: number, csvBuffer: Buffer) {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    const sequenceData = this.parseCsvToSequence(csvBuffer);

    return this.prisma.chipType.update({
      where: { id },
      data: { sequenceData: sequenceData as unknown as object[] },
    });
  }

  // Parse CSV buffer to sequence array
  private parseCsvToSequence(csvBuffer: Buffer): SequenceItem[] {
    try {
      // Remove BOM if present and normalize content
      let content = csvBuffer.toString('utf-8');
      if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
      }

      // Detect delimiter (comma or semicolon)
      const firstLine = content.split('\n')[0];
      const delimiter = firstLine.includes(';') ? ';' : ',';

      const records = parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        delimiter,
      }) as Record<string, string>[];

      if (records.length === 0) {
        throw new BadRequestException('CSV_EMPTY');
      }

      // Validate columns exist (case-insensitive)
      const firstRecord = records[0];
      const columns = Object.keys(firstRecord).map((c) => c.toLowerCase());

      if (!columns.includes('chip') || !columns.includes('code')) {
        throw new BadRequestException('CSV_INVALID_COLUMNS');
      }

      // Find actual column names (may have different case)
      const chipColumn = Object.keys(firstRecord).find(
        (c) => c.toLowerCase() === 'chip',
      )!;
      const codeColumn = Object.keys(firstRecord).find(
        (c) => c.toLowerCase() === 'code',
      )!;

      return records.map((record, index) => {
        const chipValue = parseInt(record[chipColumn], 10);

        if (isNaN(chipValue)) {
          throw new BadRequestException(
            `CSV_INVALID_CHIP_VALUE_AT_ROW_${index + 2}`,
          );
        }

        return {
          chip: chipValue,
          code: record[codeColumn],
        };
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('CSV_PARSE_ERROR');
    }
  }

  // GET /chip-types/:id/sequence - Get full sequence data
  async getSequence(id: number): Promise<SequenceItem[]> {
    const chipType = await this.prisma.chipType.findUnique({
      where: { id },
    });

    if (!chipType) {
      throw new NotFoundException('CHIP_TYPE_NOT_FOUND');
    }

    return (chipType.sequenceData as unknown as SequenceItem[]) || [];
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

    const sequenceData =
      (chipType.sequenceData as unknown as SequenceItem[]) || [];

    return sequenceData.filter(
      (item) => item.chip >= start && item.chip <= end,
    );
  }
}
