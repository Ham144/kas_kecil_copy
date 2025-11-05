import axiosInstance from "@/lib/axios";
import { FlowCategoryResponse } from "@/types/flowcategory.type";

export const FlowLogCategoryApi = {
  showAll: async (): Promise<FlowCategoryResponse[]> => {
    const res = await axiosInstance.get<FlowCategoryResponse[]>(
      "/flow-log-category"
    );
    return res?.data;
  },
};
