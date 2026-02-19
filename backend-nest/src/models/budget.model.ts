export class BudgetResponseDto {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
}

export class BudgetCreateDto {
  categoryId: string;
  month: number;
  year: number;
  amount: number;
}

export class BudgetUpdateDto {
  id: string;
  month?: number;
  year?: number;
  amount?: number;
}
