import axiosInstance from "@/lib/axios";
import {
  AnalyticResponseDto,
  CreateFlowLogDto,
  GetAnalyticFilter,
  RecentFlowLogsFilter,
} from "@/types/flowLog";

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

  createNew: async (data: CreateFlowLogDto) => {
    const res = await axiosInstance.post("/api/flow-log/new", data);
    return res.data;
  },
  getRecentFlowLogs: async (filter: RecentFlowLogsFilter) => {
    const params = new URLSearchParams();

    if (filter.type) params.set("type", filter.type);
    if (filter.page) params.set("page", filter.page.toString());
    if (filter.category) params.set("category", filter.category);
    if (filter.warehouse) params.set("warehouse", filter.warehouse);
    if (filter.searchKey) params.set("searchKey", filter.searchKey);
    if (filter.selectedDate) params.set("selectedDate", filter.selectedDate);
    if (filter.isDownload)
      params.set("isDownload", filter.isDownload.toString());

    if (filter.limit) params.set("limit", filter.limit.toString());
    if (filter.lightMode) params.set("lightMode", filter.lightMode.toString());

    const res = await axiosInstance.get("/api/flow-log", { params });
    return res?.data?.data;
  },

  getAnalytic: async (
    filter: GetAnalyticFilter,
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
