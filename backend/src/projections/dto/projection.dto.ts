export class ProjectionResultDto {
  month: string; // YYYY-MM
  projectedBalance: number;
  projectedIncome: number;
  projectedExpenses: number;
}

export class ProjectionDto {
  id: string;
  createdAt: string;
  parameters: {
    baseMonths: number;
    horizonMonths: number;
    method: string;
    fromDate?: string;
    toDate?: string;
  };
  results: ProjectionResultDto[];
}

export class ProjectionResponseDto {
  success: boolean;
  projection: ProjectionDto;
}

export class ProjectionListResponseDto {
  success: boolean;
  projections: ProjectionDto[];
}
