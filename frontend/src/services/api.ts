import axios from 'axios';
import type {
  HealthResponse,
  JournalStatusResponse,
  BalanceResponse,
  RegisterResponse,
  IncomeStatementResponse,
  AccountsResponse,
  ExpensesByAccountResponse,
  RunProjectionDto,
  ProjectionResponseDto,
  ProjectionListResponseDto,
  CreateInvestmentDto,
  UpdateInvestmentDto,
  InvestmentResponseDto,
  InvestmentListResponseDto,
} from '../types/api';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Health
export const healthApi = {
  check: () => api.get<HealthResponse>('/health'),
};

// Journal
export const journalApi = {
  status: () => api.get<JournalStatusResponse>('/journal/status'),
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; message: string }>('/journal/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Reports
export const reportsApi = {
  balance: () => api.get<BalanceResponse>('/reports/balance'),
  register: () => api.get<RegisterResponse>('/reports/register'),
  incomeStatement: () => api.get<IncomeStatementResponse>('/reports/income-statement'),
  accounts: () => api.get<AccountsResponse>('/reports/accounts'),
};

// Charts
export const chartsApi = {
  expensesByAccount: () => api.get<ExpensesByAccountResponse>('/charts/expenses-by-account'),
};

// Projections
export const projectionsApi = {
  run: (data: RunProjectionDto) => api.post<ProjectionResponseDto>('/projections/run', data),
  history: () => api.get<ProjectionListResponseDto>('/projections/history'),
  getById: (id: string) => api.get<ProjectionResponseDto>(`/projections/${id}`),
};

// Investments
export const investmentsApi = {
  list: () => api.get<InvestmentListResponseDto>('/investments'),
  getById: (id: string) => api.get<InvestmentResponseDto>(`/investments/${id}`),
  create: (data: CreateInvestmentDto) => api.post<InvestmentResponseDto>('/investments', data),
  update: (id: string, data: UpdateInvestmentDto) => api.put<InvestmentResponseDto>(`/investments/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean; message: string }>(`/investments/${id}`),
};

export default api;
