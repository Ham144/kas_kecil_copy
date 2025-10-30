export interface WarehouseCreateDto {
  name: string;
  location?: string;
  description?: string;
  // Tambahkan field lain sesuai kebutuhan
}

export interface WarehouseUpdateDto {
  id: string;
  name?: string;
  location?: string;
  description?: string;
  // Tambahkan field lain sesuai kebutuhan
}

export interface Warehouse {
  id: string;
  name: string;
  location?: string;
  description?: string;
  budgets?: number;
  createdAt?: string;
  updatedAt?: string;
  // Tambahkan field lain sesuai kebutuhan
}
