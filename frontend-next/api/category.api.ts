import axiosInstance from "@/lib/axios";
import { FlowCategoryResponse } from "@/types/flowcategory.type";

export const FlowLogCategoryApi = {
  showAll: async ({
    selectedWarehouseId,
    searchKey,
  }: {
    selectedWarehouseId: string;
    searchKey: string;
  }): Promise<FlowCategoryResponse[]> => {
    const params = new URLSearchParams();
    if (searchKey) params.append("searchKey", searchKey);
    if (selectedWarehouseId)
      params.append("selectedWarehouseId", selectedWarehouseId);
    const res = await axiosInstance.get<FlowCategoryResponse[]>(
      "/api/flow-log-category",
      { params },
    );
    return res?.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/flow-log-category/${id}`);
  },

  update: async (id: string, data: any): Promise<FlowCategoryResponse> => {
    const res = await axiosInstance.patch<FlowCategoryResponse>(
      `/api/flow-log-category/${id}`,
      data,
    );
    return res?.data;
  },

  create: async (data: any): Promise<FlowCategoryResponse> => {
    const res = await axiosInstance.post<FlowCategoryResponse>(
      "/api/flow-log-category",
      data,
    );
    return res?.data;
  },
};
