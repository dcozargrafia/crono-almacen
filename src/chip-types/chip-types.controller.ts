import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ChipTypesService } from './chip-types.service';
import { CreateChipTypeDto } from './dto/create-chip-type.dto';
import { UpdateChipTypeDto } from './dto/update-chip-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chip-types')
@UseGuards(JwtAuthGuard)
export class ChipTypesController {
  constructor(private readonly chipTypesService: ChipTypesService) {}

  // POST /chip-types - Create new chip type
  @Post()
  create(@Body() dto: CreateChipTypeDto) {
    return this.chipTypesService.create(dto);
  }

  // GET /chip-types - List all chip types
  @Get()
  findAll() {
    return this.chipTypesService.findAll();
  }

  // GET /chip-types/:id - Get chip type by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chipTypesService.findOne(id);
  }

  // PATCH /chip-types/:id - Update chip type
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateChipTypeDto,
  ) {
    return this.chipTypesService.update(id, dto);
  }

  // DELETE /chip-types/:id - Delete chip type
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chipTypesService.remove(id);
  }

  // PUT /chip-types/:id/sequence - Upload sequence CSV file
  @Put(':id/sequence')
  @UseInterceptors(FileInterceptor('file'))
  uploadSequence(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('FILE_REQUIRED');
    }
    return this.chipTypesService.uploadSequenceFromCsv(id, file.buffer);
  }

  // GET /chip-types/:id/sequence - Get sequence (full or range)
  @Get(':id/sequence')
  getSequence(
    @Param('id', ParseIntPipe) id: number,
    @Query('start') start?: number,
    @Query('end') end?: number,
  ) {
    if (start !== undefined && end !== undefined) {
      return this.chipTypesService.getSequenceRange(
        id,
        Number(start),
        Number(end),
      );
    }
    return this.chipTypesService.getSequence(id);
  }
}
