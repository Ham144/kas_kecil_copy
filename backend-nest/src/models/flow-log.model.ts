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
  IN = 'IN',
  OUT = 'OUT',
  ALL = 'ALL',
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

export class RecentFlowLogsFilter {
  type?: FlowLogType;
  page?: number;
  warehouse?: string;
  category?: string;
  limit?: number;
  lightMode?: boolean;
  //admin/flow
  searchKey?: string;
  selectedDate?: string;
}
