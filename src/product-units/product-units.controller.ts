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
import { ProductUnitsService } from './product-units.service';
import { CreateProductUnitDto } from './dto/create-product-unit.dto';
import { UpdateProductUnitDto } from './dto/update-product-unit.dto';
import { QueryProductUnitsDto } from './dto/query-product-units.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('product-units')
@UseGuards(JwtAuthGuard)
export class ProductUnitsController {
  constructor(private readonly productUnitsService: ProductUnitsService) {}

  // POST /product-units - Create new product unit
  @Post()
  create(@Body() createProductUnitDto: CreateProductUnitDto) {
    return this.productUnitsService.create(createProductUnitDto);
  }

  // GET /product-units - List product units with pagination and filters
  @Get()
  findAll(@Query() query: QueryProductUnitsDto) {
    return this.productUnitsService.findAll({
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
      status: query.status,
      active: query.active,
    });
  }

  // GET /product-units/serial/:serial - Find by serial number
  @Get('serial/:serial')
  findBySerial(@Param('serial') serial: string) {
    return this.productUnitsService.findBySerial(serial);
  }

  // GET /product-units/:id - Get product unit by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.findOne(id);
  }

  // PATCH /product-units/:id - Update product unit
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductUnitDto: UpdateProductUnitDto,
  ) {
    return this.productUnitsService.update(id, updateProductUnitDto);
  }

  // PATCH /product-units/:id/status - Update status
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.productUnitsService.updateStatus(id, dto.status);
  }

  // DELETE /product-units/:id - Soft delete product unit
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.remove(id);
  }

  // PATCH /product-units/:id/reactivate - Reactivate soft-deleted product unit
  @Patch(':id/reactivate')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.productUnitsService.reactivate(id);
  }
}
