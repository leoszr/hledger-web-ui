export class RunProjectionDto {
  baseMonths: number; // Quantos meses usar como base
  horizonMonths: number; // Quantos meses projetar no futuro
  method?: 'average' | 'linear'; // Método de projeção
}
