"use client";

import { FlowLogType } from "@/types/flowLog";
import { FlowLogForm } from "./flow-log-form";

export function RevenueForm() {
  return <FlowLogForm type={FlowLogType.IN} />;
}
