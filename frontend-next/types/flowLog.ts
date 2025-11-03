interface FlowLog {
  id?: number;
  title: string;
  amount: number;
  note?: string;
  attachments?: string[];
  type: FlowLogType;
  createdAt?: string;
  createdBy?: string;
  createdByUsername?: string;
  warehouse?: string;
  category: string;
}

enum FlowLogType {
  IN,
  OUT,
}
