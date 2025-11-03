export class FlowlogResponseDto {
  id: string;
  title: string;
  amount: number;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
  createdAt?: Date;
  createdBy?: string;
  warehouse?: object;
  category: object;
}

export class FlowLogCreateDto {
  title: string;
  amount: number;
  note: string;
  attachments: string[];
  type?: FlowLogType;
  warehouse: string;
  category: string;
}

enum FlowLogType {
  IN,
  OUT,
}
