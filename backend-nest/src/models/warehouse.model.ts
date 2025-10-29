export class WarehouseResponseDto {
  id: string;
  name: string;
  members: object[];
}

export class WarehouseDetailResponseDto {
  id: string;
  name: string;
  budgets?: object[];
  flowLogs?: object[];
  members?: object[];
}

export class WarehouseCreateDto {
  name: string;
  members: string[]; //username
}

export class WarehouseUpdateDto {
  id: string;
  name?: string;
  budgets?: number;
  members?: string[];
}
