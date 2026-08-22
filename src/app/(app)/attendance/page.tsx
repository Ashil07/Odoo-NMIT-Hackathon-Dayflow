"use client";

// my log, or the whole register if HR is looking.
import { AdminAttendance } from "@/components/screens/admin-attendance";
import { EmployeeAttendance } from "@/components/screens/employee-attendance";
import { useDayflow } from "@/components/app/store";

export default function AttendancePage() {
  const { isEmp } = useDayflow();
  return isEmp ? <EmployeeAttendance /> : <AdminAttendance />;
}
