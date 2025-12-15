import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { QueryDevicesDto } from './dto/query-devices.dto';
import { UpdateManufactoringStatusDto } from './dto/update-manufactoring-status.dto';
import { UpdateOperationalStatusDto } from './dto/update-operational-status.dto';
import { AssignOwnerDto } from './dto/assign-owner.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('devices')
@UseGuards(JwtAuthGuard)
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // POST /devices - Create new device
  @Post()
  create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  // GET /devices - List devices with pagination and filters
  @Get()
  findAll(@Query() query: QueryDevicesDto) {
    return this.devicesService.findAll({
      page: query.page,
      pageSize: query.pageSize,
      model: query.model,
      manufactoringStatus: query.manufactoringStatus,
      operationalStatus: query.operationalStatus,
      availableForRental: query.availableForRental,
      ownerId: query.ownerId,
    });
  }

  // GET /devices/reader/:serial - Find device by reader serial number
  @Get('reader/:serial')
  findByReaderSerial(@Param('serial') serial: string) {
    return this.devicesService.findByReaderSerial(serial);
  }

  // GET /devices/cpu/:serial - Find device by CPU serial number
  @Get('cpu/:serial')
  findByCpuSerial(@Param('serial') serial: string) {
    return this.devicesService.findByCpuSerial(serial);
  }

  // GET /devices/battery/:serial - Find device by battery serial number
  @Get('battery/:serial')
  findByBatterySerial(@Param('serial') serial: string) {
    return this.devicesService.findByBatterySerial(serial);
  }

  // GET /devices/:id - Get device by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.findOne(id);
  }

  // PATCH /devices/:id - Update device
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(id, updateDeviceDto);
  }

  // DELETE /devices/:id - Retire device (soft delete)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.devicesService.remove(id);
  }

  // PATCH /devices/:id/manufactoring-status - Update manufactoring status
  @Patch(':id/manufactoring-status')
  updateManufactoringStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateManufactoringStatusDto,
  ) {
    return this.devicesService.updateManufactoringStatus(id, dto.status);
  }

  // PATCH /devices/:id/operational-status - Update operational status
  @Patch(':id/operational-status')
  updateOperationalStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOperationalStatusDto,
  ) {
    return this.devicesService.updateOperationalStatus(id, dto.status);
  }

  // PATCH /devices/:id/owner - Assign owner to device
  @Patch(':id/owner')
  assignOwner(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AssignOwnerDto,
  ) {
    return this.devicesService.assignOwner(id, dto.ownerId ?? null);
  }
}
