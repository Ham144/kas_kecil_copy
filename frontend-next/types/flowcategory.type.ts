export interface FlowCategoryResponse {
  id: string;
  no: string;
  name: string;
  description: string;
}

export enum ModePeriod {
  DATE = "date",
  MONTH = "month",
}

export interface FlowCategoryCreate {
  name: string;
  description?: string;
  no: string;
}
