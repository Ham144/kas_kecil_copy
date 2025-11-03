export interface Budget {
  id: string;
  warehouseId: string;
  month: number;
  year: number;
  amount: number;
}

export interface BudgetCreateDto {
  warehouseId: string;
  month: number;
  year: number;
  amount: number;
}

export interface BudgetUpdateDto {
  id: string;
  month?: number;
  year?: number;
  amount?: number;
}

