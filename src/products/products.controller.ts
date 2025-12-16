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
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { QuantityDto } from './dto/quantity.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // POST /products - Create new product
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  // GET /products - List products with pagination and filters
  @Get()
  findAll(@Query() query: QueryProductsDto) {
    return this.productsService.findAll({
      page: query.page,
      pageSize: query.pageSize,
      type: query.type,
      active: query.active,
    });
  }

  // GET /products/:id - Get product by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  // PATCH /products/:id - Update product
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  // DELETE /products/:id - Soft delete product
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.remove(id);
  }

  // PATCH /products/:id/reactivate - Reactivate soft-deleted product
  @Patch(':id/reactivate')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.reactivate(id);
  }

  // POST /products/:id/add-stock - Add units to inventory
  @Post(':id/add-stock')
  addStock(@Param('id', ParseIntPipe) id: number, @Body() dto: QuantityDto) {
    return this.productsService.addStock(id, dto.quantity);
  }

  // POST /products/:id/retire - Remove units from inventory
  @Post(':id/retire')
  retire(@Param('id', ParseIntPipe) id: number, @Body() dto: QuantityDto) {
    return this.productsService.retire(id, dto.quantity);
  }

  // POST /products/:id/send-to-repair - Move units to repair
  @Post(':id/send-to-repair')
  sendToRepair(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QuantityDto,
  ) {
    return this.productsService.sendToRepair(id, dto.quantity);
  }

  // POST /products/:id/mark-repaired - Return units from repair to available
  @Post(':id/mark-repaired')
  markRepaired(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: QuantityDto,
  ) {
    return this.productsService.markRepaired(id, dto.quantity);
  }
}
