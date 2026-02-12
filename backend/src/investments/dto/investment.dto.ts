export class CreateInvestmentDto {
  ticker: string;
  quantidade: number;
  precoMedio: number;
  tipo: 'acao' | 'fii' | 'renda-fixa';
}

export class UpdateInvestmentDto {
  ticker?: string;
  quantidade?: number;
  precoMedio?: number;
  tipo?: 'acao' | 'fii' | 'renda-fixa';
}

export class InvestmentDto {
  id: string;
  ticker: string;
  quantidade: number;
  precoMedio: number;
  tipo: 'acao' | 'fii' | 'renda-fixa';
  valorTotal: number; // Calculado: quantidade * precoMedio
  createdAt: string;
  updatedAt: string;
}

export class InvestmentResponseDto {
  success: boolean;
  investment: InvestmentDto;
}

export class InvestmentListResponseDto {
  success: boolean;
  investments: InvestmentDto[];
  totalPatrimonio: number; // Soma de todos os valores
}
