import { flowCategoryResponseDto } from './flow-category.model';
import { WarehouseResponseDto } from './warehouse.model';

export class FlowlogResponseDto {
  id: string;
  title: string;
  amount: number;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
  createdAt?: Date;
  createdBy?: string;
  warehouse?: object;
  category: object;
}

export class FlowLogCreateDto {
  title: string;
  amount: number;
  note: string;
  attachments: string[];
  type?: FlowLogType;
  warehouse: string;
  category: string;
}

export enum FlowLogType {
  IN,
  OUT,
}

export class AnalyticResponseDto {
  totalInflow: number;
  totalOutflow: number;
  budgetRemaining: number;
  budgetSpent: number;
  topCategories: object[];
  topWarehouses: object[];
  currentMonthBudget: number;
  flowOverTime: object[];
}

export class GetAnalyticFilter {
  selectedDate: Date;
  selectedWarehouseId: string;
}
