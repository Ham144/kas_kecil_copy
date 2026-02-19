export interface WarehouseCreateDto {
  name: string;
  location?: string;
  description?: string;
  members?: string[];
}

export interface WarehouseUpdateDto {
  id: string;
  name?: string;
  location?: string;
  description?: string;
  members?: string[];
}

export interface Warehouse {
  id: string;
  name: string;
  description?: string | null;
  members?: string[];
}
