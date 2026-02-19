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
  date: Date;
  category: object;
}

export class FlowLogCreateDto {
  title: string;
  amount: number;
  note: string;
  attachments: string[];
  type?: string;
  warehouse: string;
  warehousId: string;
  date: Date;
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
  budgetRemaining: number; //jadi
  budgetSpent: number;
  topCategories: object[];
  topWarehouses: object[];
  categoriesToBudget: {
    totalSpent: number;
    budgetRemaining: number;
    budget: number;
    name: string;
  }[];
  currentMonthBudget: number;
  flowOverTime: object[];
}

export class GetAnalyticFilter {
  selectedDate: Date;
  selectedWarehouseId: string;
  selectedCategoryId: string;
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
  isDownload?: boolean;
}
