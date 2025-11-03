export interface FlowCategoryResponse {
  id: string;
  no: string;
  name: string;
  description: string;
}

export interface FlowCategoryCreate {
  name: string;
  description?: string;
  no: string;
}
