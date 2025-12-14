import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  // POST /clients - Create new client
  async create(createClientDto: CreateClientDto) {
    // Validate unique codeSportmaniacs if is provided
    if (createClientDto.codeSportmaniacs) {
      const existing = await this.prisma.client.findUnique({
        where: {
          codeSportmaniacs: createClientDto.codeSportmaniacs,
        },
      });

      if (existing) {
        throw new ConflictException('CODE_SPORTMANIACS_ALREADY_EXISTS');
      }
    }

    return this.prisma.client.create({
      data: createClientDto,
    });
  }

  // GET /clients - List clients with pagination and optional active filter
  async findAll(
    options: { page?: number; limit?: number; active?: string } = {},
  ) {
    const { page = 1, limit = 10, active = 'true' } = options;

    // Build where clause
    let where = {};
    if (active === 'true') {
      where = { active: true };
    } else if (active === 'false') {
      where = { active: false };
    }
    // active === 'all' → where stays {}

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries in parallel
    const [data, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: limit,
      }),
      this.prisma.client.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // GET /clients/:id Get client by id
  async findOne(id: number) {
    const client = await this.prisma.client.findUnique({
      where: { id },
    });

    if (!client) {
      throw new NotFoundException('CLIENT_NOT_FOUND');
    }

    return client;
  }

  // PATCH /clients/:id - Update client
  async update(id: number, updateClientDto: UpdateClientDto) {
    await this.findOne(id);

    // Validate codeSportmaniacs unique if provided
    if (updateClientDto.codeSportmaniacs) {
      const existing = await this.prisma.client.findUnique({
        where: {
          codeSportmaniacs: updateClientDto.codeSportmaniacs,
        },
      });

      if (existing && existing.id != id) {
        throw new ConflictException('CODE_SPORTMANIACS_ALREADY_EXISTS');
      }
    }

    return this.prisma.client.update({
      where: { id },
      data: updateClientDto,
    });
  }

  // DELETE /clients/:id - Soft delete client
  async remove(id: number) {
    await this.findOne(id); // Throws if not found

    await this.prisma.client.update({
      where: { id },
      data: { active: false },
    });
  }

  // GET /clients/sportmaniacs/:code - Find client by Sportmaniacs code
  async findByCodeSportmaniacs(code: number) {
    const client = await this.prisma.client.findUnique({
      where: { codeSportmaniacs: code },
    });

    if (!client) {
      throw new NotFoundException('CLIENT_NOT_FOUND');
    }

    return client;
  }

  // PATCH /clients/:id/reactivate - Reactivate soft-deleted client
  async reactivate(id: number) {
    await this.findOne(id); // Throws if not found

    return this.prisma.client.update({
      where: { id },
      data: { active: true },
    });
  }
}
