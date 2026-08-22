"use client";

// same route, two very different days depending on who signed in.
import { AdminDashboard } from "@/components/screens/admin-dashboard";
import { EmployeeDashboard } from "@/components/screens/employee-dashboard";
import { useDayflow } from "@/components/app/store";

export default function DashboardPage() {
  const { isEmp } = useDayflow();
  return isEmp ? <EmployeeDashboard /> : <AdminDashboard />;
}
