import { Budget } from "./budget";

export interface FlowCategoryResponse {
  id: string;
  no: string;
  name: string;
  description: string;
  budgets?: Budget[];
}

export enum ModePeriod {
  DATE = "date",
  MONTH = "month",
}

export interface FlowCategoryCreate {
  id?: string;
  warehouseId?: string;
  name: string;
  description?: string;
  no: string;
}
