export class BudgetResponseDto {
  id: string;
  warehouseId: string;
  month: number;
  year: number;
  amount: number;
}

export class BudgetCreateDto {
  warehouseId: string;
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

