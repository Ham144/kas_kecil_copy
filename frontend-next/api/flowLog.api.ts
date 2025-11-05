import axiosInstance from "@/lib/axios";
import {
  AnalyticResponseDto,
  CreateFlowLogDto,
  FlowLogType,
  GetAnalyticFilter,
} from "@/types/flowLog";

type recentFlowLogsFilter = {
  type?: FlowLogType;
  page?: number;
  warehouse?: string;
  category?: string;
  limit?: number;
  lightMode?: boolean;
};

export const FlowLogApi = {
  uploadFiles: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await axiosInstance.post("/api/flow-log/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  registerExpense: async (data: CreateFlowLogDto) => {
    const res = await axiosInstance.post("/api/flow-log/expense", data);
    return res.data;
  },

  registerRevenue: async (data: CreateFlowLogDto) => {
    const res = await axiosInstance.post("/api/flow-log/revenue", data);
    return res.data;
  },

  getRecentFlowLogs: async (filter: recentFlowLogsFilter) => {
    const params = new URLSearchParams();

    if (filter.type) params.set("type", filter.type);
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.category) params.set("category", filter.category);
    if (filter.warehouse) params.set("warehouse", filter.warehouse);

    const res = await axiosInstance.get("/api/flow-log", { params });
    return res?.data?.data;
  },

  getAnalytic: async (
    filter: GetAnalyticFilter
  ): Promise<AnalyticResponseDto> => {
    const params = new URLSearchParams();
    params.set("selectedDate", filter.selectedDate);
    if (filter.selectedWarehouseId) {
      params.set("selectedWarehouseId", filter.selectedWarehouseId);
    }
    const res = await axiosInstance.get("/api/flow-log/analytic", { params });
    return res?.data;
  },
};
