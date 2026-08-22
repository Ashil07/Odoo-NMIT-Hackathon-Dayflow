"use client";

// employee files it, admin decides it.
import { Approvals } from "@/components/screens/approvals";
import { TimeOff } from "@/components/screens/time-off";
import { useDayflow } from "@/components/app/store";

export default function TimeOffPage() {
  const { isEmp } = useDayflow();
  return isEmp ? <TimeOff /> : <Approvals />;
}
