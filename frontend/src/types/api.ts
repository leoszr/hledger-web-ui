// Health Check
export interface HealthResponse {
  status: string;
  timestamp: string;
  hledger: {
    available: boolean;
    version: string;
  };
  journal: {
    exists: boolean;
    path: string;
  };
}

// Journal
export interface JournalStatusResponse {
  success: boolean;
  exists: boolean;
  path: string;
  lastModified?: string;
  size?: number;
}

// Reports
export interface BalanceResponse {
  success: boolean;
  data: string;
}

export interface RegisterResponse {
  success: boolean;
  data: string;
}

export interface IncomeStatementResponse {
  success: boolean;
  data: string;
}

export interface AccountsResponse {
  success: boolean;
  accounts: string[];
}

// Charts
export interface ExpensesByAccountResponse {
  success: boolean;
  data: Array<{
    account: string;
    amount: number;
  }>;
}

// Projections
export type ProjectionMethod = 'average' | 'linear';

export interface RunProjectionDto {
  baseMonths: number;
  horizonMonths: number;
  method?: ProjectionMethod;
}

export interface ProjectionResultDto {
  month: string;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBalance: number;
}

export interface ProjectionDto {
  id: string;
  createdAt: string;
  parameters: {
    baseMonths: number;
    horizonMonths: number;
    method: ProjectionMethod;
    fromDate?: string;
    toDate?: string;
  };
  results: ProjectionResultDto[];
}

export interface ProjectionResponseDto {
  success: boolean;
  projection: ProjectionDto;
}

export interface ProjectionListResponseDto {
  success: boolean;
  projections: ProjectionDto[];
}

// Investments
export type InvestmentType = 'acao' | 'fii' | 'renda-fixa';

export interface CreateInvestmentDto {
  ticker: string;
  quantidade: number;
  precoMedio: number;
  tipo: InvestmentType;
}

export interface UpdateInvestmentDto {
  ticker?: string;
  quantidade?: number;
  precoMedio?: number;
  tipo?: InvestmentType;
}

export interface InvestmentDto {
  id: string;
  ticker: string;
  quantidade: number;
  precoMedio: number;
  tipo: InvestmentType;
  valorTotal: number;
  createdAt: string;
  updatedAt: string;
}

export interface InvestmentResponseDto {
  success: boolean;
  investment: InvestmentDto;
}

export interface InvestmentListResponseDto {
  success: boolean;
  investments: InvestmentDto[];
  totalPatrimonio: number;
}
