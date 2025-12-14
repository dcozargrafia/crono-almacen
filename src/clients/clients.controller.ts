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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { QueryClientsDto } from './dto/query-clients.dto';

@Controller('clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  // POST /clients - Create new client
  @Post()
  create(@Body() createClientDto: CreateClientDto) {
    return this.clientsService.create(createClientDto);
  }

  // GET /clients - List clients with pagination
  @Get()
  findAll(@Query() query: QueryClientsDto) {
    return this.clientsService.findAll({
      page: query.page,
      limit: query.limit,
      active: query.active,
    });
  }

  // GET /clients/sportmaniacs/:code - Find by Sportmaniacs code
  @Get('sportmaniacs/:code')
  findByCodeSportmaniacs(@Param('code', ParseIntPipe) code: number) {
    return this.clientsService.findByCodeSportmaniacs(code);
  }

  // GET /clients/:id - Get client by id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.findOne(id);
  }

  // PATCH /clients/:id - Update client
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, updateClientDto);
  }

  // DELETE /clients/:id - Soft delete client
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clientsService.remove(id);
  }

  // PATCH /clients/:id/reactivate - Reactivate soft deleted client
  @Patch(':id/reactivate')
  reactivate(@Param('id', ParseIntPipe) id: number) {
    return this.clientsService.reactivate(id);
  }
}
