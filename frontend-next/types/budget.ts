export interface Budget {
  id: string;
  categoryId: string;
  month: number;
  year: number;
  amount: number;
}

export interface BudgetCreateDto {
  categoryId: string;
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
