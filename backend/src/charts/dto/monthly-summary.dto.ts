export class MonthlySummaryDto {
  month: string; // YYYY-MM
  income: number;
  expenses: number;
  net: number;
}

export class MonthlySummaryResponseDto {
  success: boolean;
  data: MonthlySummaryDto[];
}
