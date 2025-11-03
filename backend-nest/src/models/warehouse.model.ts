export class WarehouseResponseDto {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  members: string[];
  budgetsCount: number;
}

export class WarehouseDetailResponseDto {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  budgets?: object[];
  flowLogs?: object[];
  members?: object[];
}

export class WarehouseCreateDto {
  name: string;
  location?: string;
  description?: string;
  members?: string[]; //username
}

export class BudgetCreate {
  month: number;
  year: number;
  amount: number;
}

export class WarehouseUpdateDto {
  id: string;
  name?: string;
  location?: string;
  description?: string;
  members?: string[];
  budgets?: BudgetCreate[];
}
