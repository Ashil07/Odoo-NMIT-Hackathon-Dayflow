"use client";

// read-only for staff, full structure editor for HR.
import { AdminPayroll } from "@/components/screens/admin-payroll";
import { EmployeePay } from "@/components/screens/employee-pay";
import { useDayflow } from "@/components/app/store";

export default function PayPage() {
  const { isEmp } = useDayflow();
  return isEmp ? <EmployeePay /> : <AdminPayroll />;
}
