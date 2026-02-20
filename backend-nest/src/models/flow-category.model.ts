export class flowCategoryResponseDto {
  id: string;
  no: string;
  name: string;
  description: string;
}

export class flowCategoryCreateDto {
  name: string;
  description?: string;
  no: string;
  warehouseId: string;
}
