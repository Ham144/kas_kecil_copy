import axiosInstance from "@/lib/axios";
import type { Budget, BudgetCreateDto, BudgetUpdateDto } from "@/types/budget";

export const BudgetApi = {
  createBudget: async (data: BudgetCreateDto): Promise<Budget> => {
    const response = await axiosInstance.post("/api/budget", data);
    return response.data;
  },

  getBudgetsByCategory: async (categoryId: string): Promise<Budget[]> => {
    const response = await axiosInstance.get<Budget[]>(
      `/api/budget/category/${categoryId}`,
    );
    return response.data;
  },

  getBudget: async (id: string): Promise<Budget> => {
    const response = await axiosInstance.get<Budget>(`/api/budget/${id}`);
    return response.data;
  },

  updateBudget: async (data: BudgetUpdateDto): Promise<Budget> => {
    const response = await axiosInstance.patch<Budget>(
      `/api/budget/${data.id}`,
      data,
    );
    return response.data;
  },

  deleteBudget: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/api/budget/${id}`);
  },
};
