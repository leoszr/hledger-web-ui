export class ExpensesByAccountDto {
  account: string;
  amount: number;
}

export class ExpensesByAccountResponseDto {
  success: boolean;
  data: ExpensesByAccountDto[];
}
