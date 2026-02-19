import axiosInstance from "@/lib/axios";
import { FlowCategoryResponse } from "@/types/flowcategory.type";

export const FlowLogCategoryApi = {
  showAll: async (): Promise<FlowCategoryResponse[]> => {
    const res =
      await axiosInstance.get<FlowCategoryResponse[]>("/flow-log-category");
    return res?.data;
  },

  delete: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/flow-log-category/${id}`);
  },

  update: async (id: string, data: any): Promise<FlowCategoryResponse> => {
    const res = await axiosInstance.patch<FlowCategoryResponse>(
      `/flow-log-category/${id}`,
      data,
    );
    return res?.data;
  },

  create: async (data: any): Promise<FlowCategoryResponse> => {
    const res = await axiosInstance.post<FlowCategoryResponse>(
      "/flow-log-category",
      data,
    );
    return res?.data;
  },
};
