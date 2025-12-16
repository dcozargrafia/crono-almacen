import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RentalStatus } from '@prisma/client';

@Controller('rentals')
@UseGuards(JwtAuthGuard)
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  // POST /rentals - Create new rental
  @Post()
  create(@Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto);
  }

  // GET /rentals - List rentals with pagination and filters
  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: RentalStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.rentalsService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
      clientId: clientId ? parseInt(clientId, 10) : undefined,
    });
  }

  // GET /rentals/:id - Get rental by ID
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.findOne(id);
  }

  // PATCH /rentals/:id - Update rental basic fields
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRentalDto: UpdateRentalDto,
  ) {
    return this.rentalsService.update(id, updateRentalDto);
  }

  // POST /rentals/:id/return - Mark rental as returned
  @Post(':id/return')
  returnRental(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.returnRental(id);
  }

  // POST /rentals/:id/cancel - Cancel rental
  @Post(':id/cancel')
  cancelRental(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.cancelRental(id);
  }

  // GET /rentals/:id/chip-sequence - Get chip sequences for rental
  @Get(':id/chip-sequence')
  getChipSequence(@Param('id', ParseIntPipe) id: number) {
    return this.rentalsService.getChipSequenceForRental(id);
  }
}
