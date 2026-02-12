import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import {
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentResponseDto,
  InvestmentListResponseDto,
} from './dto/investment.dto';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Get()
  async findAll(): Promise<InvestmentListResponseDto> {
    return this.investmentsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<InvestmentResponseDto> {
    return this.investmentsService.findOne(id);
  }

  @Post()
  async create(
    @Body() createDto: CreateInvestmentDto,
  ): Promise<InvestmentResponseDto> {
    return this.investmentsService.create(createDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateInvestmentDto,
  ): Promise<InvestmentResponseDto> {
    return this.investmentsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
  ): Promise<{ success: boolean; message: string }> {
    return this.investmentsService.remove(id);
  }
}
