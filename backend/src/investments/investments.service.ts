import { Injectable, NotFoundException } from '@nestjs/common';
import { JsonStorageService } from '../storage/json-storage.service';
import { PATHS } from '../config/paths';
import { v4 as uuidv4 } from 'uuid';
import {
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentDto,
  InvestmentResponseDto,
  InvestmentListResponseDto,
} from './dto/investment.dto';

interface InvestmentsData {
  investments: InvestmentDto[];
}

@Injectable()
export class InvestmentsService {
  constructor(private readonly jsonStorage: JsonStorageService) {}

  async findAll(): Promise<InvestmentListResponseDto> {
    const data = await this.jsonStorage.readJson<InvestmentsData>(
      PATHS.INVESTMENTS_JSON,
      { investments: [] },
    );
    const investments = data.investments || [];

    const totalPatrimonio = investments.reduce(
      (sum, inv) => sum + inv.valorTotal,
      0,
    );

    return {
      success: true,
      investments,
      totalPatrimonio,
    };
  }

  async findOne(id: string): Promise<InvestmentResponseDto> {
    const data = await this.jsonStorage.readJson<InvestmentsData>(
      PATHS.INVESTMENTS_JSON,
      { investments: [] },
    );
    const investments = data.investments || [];

    const investment = investments.find((inv) => inv.id === id);

    if (!investment) {
      throw new NotFoundException(`Investment with id ${id} not found`);
    }

    return {
      success: true,
      investment,
    };
  }

  async create(
    createDto: CreateInvestmentDto,
  ): Promise<InvestmentResponseDto> {
    const data = await this.jsonStorage.readJson<InvestmentsData>(
      PATHS.INVESTMENTS_JSON,
      { investments: [] },
    );
    const investments = data.investments || [];

    const now = new Date().toISOString();
    const valorTotal = createDto.quantidade * createDto.precoMedio;

    const newInvestment: InvestmentDto = {
      id: uuidv4(),
      ticker: createDto.ticker,
      quantidade: createDto.quantidade,
      precoMedio: createDto.precoMedio,
      tipo: createDto.tipo,
      valorTotal,
      createdAt: now,
      updatedAt: now,
    };

    investments.push(newInvestment);

    await this.jsonStorage.writeJsonAtomic(PATHS.INVESTMENTS_JSON, {
      investments,
    });

    return {
      success: true,
      investment: newInvestment,
    };
  }

  async update(
    id: string,
    updateDto: UpdateInvestmentDto,
  ): Promise<InvestmentResponseDto> {
    const data = await this.jsonStorage.readJson<InvestmentsData>(
      PATHS.INVESTMENTS_JSON,
      { investments: [] },
    );
    const investments = data.investments || [];

    const index = investments.findIndex((inv) => inv.id === id);

    if (index === -1) {
      throw new NotFoundException(`Investment with id ${id} not found`);
    }

    const updatedInvestment = {
      ...investments[index],
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate valorTotal if quantidade or precoMedio changed
    updatedInvestment.valorTotal =
      updatedInvestment.quantidade * updatedInvestment.precoMedio;

    investments[index] = updatedInvestment;

    await this.jsonStorage.writeJsonAtomic(PATHS.INVESTMENTS_JSON, {
      investments,
    });

    return {
      success: true,
      investment: updatedInvestment,
    };
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const data = await this.jsonStorage.readJson<InvestmentsData>(
      PATHS.INVESTMENTS_JSON,
      { investments: [] },
    );
    const investments = data.investments || [];

    const index = investments.findIndex((inv) => inv.id === id);

    if (index === -1) {
      throw new NotFoundException(`Investment with id ${id} not found`);
    }

    investments.splice(index, 1);

    await this.jsonStorage.writeJsonAtomic(PATHS.INVESTMENTS_JSON, {
      investments,
    });

    return {
      success: true,
      message: `Investment with id ${id} deleted successfully`,
    };
  }
}
