import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { PrismaService } from '../prisma.service';
import {
  Prisma,
  ManufactoringStatus,
  OperationalStatus,
  DeviceModel,
} from '@prisma/client';

@Injectable()
export class DevicesService {
  constructor(private prisma: PrismaService) {}

  // POST /devices - Create new device
  async create(createDeviceDto: CreateDeviceDto) {
    // Validate unique manufactoringCode
    const existing = await this.prisma.device.findUnique({
      where: {
        manufactoringCode: createDeviceDto.manufactoringCode,
      },
    });

    if (existing) {
      throw new Error('MANUFACTORING_CODE_ALREADY_EXISTS');
    }

    return this.prisma.device.create({
      data: createDeviceDto,
    });
  }

  // GET /devices - List devices with pagination and filters
  async findAll(
    options: {
      page?: number;
      pageSize?: number;
      model?: DeviceModel;
      manufactoringStatus?: ManufactoringStatus;
      operationalStatus?: OperationalStatus;
      availableForRental?: boolean;
      ownerId?: number;
    } = {},
  ) {
    const { page = 1, pageSize = 10, ...filters } = options;

    // Build where clause from filters
    const where: Prisma.DeviceWhereInput = {};
    if (filters.model) where.model = filters.model;
    if (filters.manufactoringStatus)
      where.manufactoringStatus = filters.manufactoringStatus;
    if (filters.operationalStatus)
      where.operationalStatus = filters.operationalStatus;
    if (filters.availableForRental !== undefined)
      where.availableForRental = filters.availableForRental;
    if (filters.ownerId !== undefined) where.ownerId = filters.ownerId;

    const skip = (page - 1) * pageSize;

    const [data, total] = await Promise.all([
      this.prisma.device.findMany({
        where,
        skip,
        take: pageSize,
      }),
      this.prisma.device.count({ where }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // GET /devices/:id - Get device by ID
  async findOne(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return device;
  }

  // PATCH /devices/:id - Update device
  async update(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    // Check for duplicate manufactoringCode on another device
    if (updateDeviceDto.manufactoringCode) {
      const existing = await this.prisma.device.findUnique({
        where: { manufactoringCode: updateDeviceDto.manufactoringCode },
      });

      if (existing && existing.id !== id) {
        throw new Error('MANUFACTORING_CODE_ALREADY_EXISTS');
      }
    }

    return this.prisma.device.update({
      where: { id },
      data: updateDeviceDto,
    });
  }

  // DELETE /devices/:id - Retire device (soft delete)
  async remove(id: number) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return this.prisma.device.update({
      where: { id },
      data: { operationalStatus: OperationalStatus.RETIRED },
    });
  }

  // PATCH /devices/:id/manufactoring-status - Update manufactoring status
  async updateManufactoringStatus(id: number, status: ManufactoringStatus) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return this.prisma.device.update({
      where: { id },
      data: { manufactoringStatus: status },
    });
  }

  // PATCH /devices/:id/operational-status - Update operational status
  async updateOperationalStatus(id: number, status: OperationalStatus) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return this.prisma.device.update({
      where: { id },
      data: { operationalStatus: status },
    });
  }

  // PATCH /devices/:id/owner - Assign owner to device
  async assignOwner(id: number, ownerId: number | null) {
    const device = await this.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    // Validate owner exists if ownerId is provided
    if (ownerId !== null) {
      const client = await this.prisma.client.findUnique({
        where: { id: ownerId },
      });

      if (!client) {
        throw new NotFoundException('CLIENT_NOT_FOUND');
      }
    }

    return this.prisma.device.update({
      where: { id },
      data: { ownerId },
    });
  }

  // GET /devices/reader/:serial - Find device by reader serial number
  async findByReaderSerial(serial: string) {
    const device = await this.prisma.device.findFirst({
      where: {
        OR: [{ reader1SerialNumber: serial }, { reader2SerialNumber: serial }],
      },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return device;
  }

  // GET /devices/cpu/:serial - Find device by CPU serial number
  async findByCpuSerial(serial: string) {
    const device = await this.prisma.device.findFirst({
      where: { cpuSerialNumber: serial },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return device;
  }

  // GET /devices/battery/:serial - Find device by battery serial number
  async findByBatterySerial(serial: string) {
    const device = await this.prisma.device.findFirst({
      where: { batterySerialNumber: serial },
    });

    if (!device) {
      throw new NotFoundException('DEVICE_NOT_FOUND');
    }

    return device;
  }
}
