import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectionsService } from './projections.service';
import { RunProjectionDto } from './dto/run-projection.dto';
import {
  ProjectionResponseDto,
  ProjectionListResponseDto,
} from './dto/projection.dto';

@Controller('projections')
export class ProjectionsController {
  constructor(private readonly projectionsService: ProjectionsService) {}

  /**
   * POST /api/projections/run
   * Executa uma nova projeção financeira
   */
  @Post('run')
  runProjection(
    @Body() dto: RunProjectionDto,
  ): Promise<ProjectionResponseDto> {
    return this.projectionsService.runProjection(dto);
  }

  /**
   * GET /api/projections/history
   * Lista todas as projeções do histórico
   */
  @Get('history')
  getHistory(): Promise<ProjectionListResponseDto> {
    return this.projectionsService.getHistory();
  }

  /**
   * GET /api/projections/:id
   * Busca uma projeção específica por ID
   */
  @Get(':id')
  getById(@Param('id') id: string): Promise<ProjectionResponseDto> {
    return this.projectionsService.getById(id);
  }
}
