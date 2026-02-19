import { UserInfo } from "./auth";
import { Warehouse } from "./warehouse";

export enum FlowLogType {
  IN = "IN",
  OUT = "OUT",
  ALL = "ALL",
}

// Base FlowLog interface matching backend FlowlogResponseDto
export interface FlowLog {
  id: string;
  title: string;
  amount: number;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
  createdAt?: string;
  createdBy?: UserInfo;
  warehouse?: Warehouse;
  date?: Date;
  category?: {
    id: string;
    name: string;
    // Add other category properties as needed
  };
}

// DTO for creating a new flow log (matches backend FlowLogCreateDto)
export interface CreateFlowLogDto {
  title: string;
  amount: number;
  note: string;
  attachments?: string[];
  type?: FlowLogType;
  warehouseId: string; // warehouse ID
  warehouse?: Warehouse;
  date?: string;
  category: string; // category ID
}

// Filter options for querying flow logs
export interface FlowLogFilter {
  type?: FlowLogType;
  category?: string;
  warehouse?: string;
  createdByUsername?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

// Response wrapper for API responses
export interface FlowLogApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
}

// Paginated response for flow logs
export interface PaginatedFlowLogs {
  logs: FlowLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Error response interface
export interface FlowLogError {
  statusCode: number;
  message: string;
  error?: string;
}

export interface AnalyticTopCategory {
  categoryId: string;
  categoryName: string;
  name: string;
  amount: number;
  value: number;
  total: number;
}

export interface AnalyticTopWarehouse {
  id: string;
  name: string;
  total: number;
}

export interface AnalyticLinePoint {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface AnalyticRankItem {
  name: string;
  amount: number;
}

export interface AnalyticResponseDto {
  totalInflow: number;
  totalOutflow: number;
  budgetRemaining: number;
  budgetSpent: number;
  topCategories: object[];
  topWarehouses: object[];
  currentMonthBudget: number;
  categoriesToBudget: {
    totalSpent: number;
    budgetRemaining: number;
    budget: number;
    name: string;
  }[];
  flowOverTime: object[];
}

export interface GetAnalyticFilter {
  selectedDate: string;
  selectedWarehouseId?: string;
}

export interface RecentFlowLogsFilter {
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
