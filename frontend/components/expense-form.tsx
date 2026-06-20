"use client";

import { FlowLogType } from "@/types/flowLog";
import { FlowLogForm } from "./flow-log-form";

export function ExpenseForm() {
  return <FlowLogForm type={FlowLogType.OUT} />;
}
