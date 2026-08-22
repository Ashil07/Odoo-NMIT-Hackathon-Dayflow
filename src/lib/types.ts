// wire shapes shared by api routes and client screens.
export type Role = "EMPLOYEE" | "HR_ADMIN";

export type MyProfile = {
  title: string;
  dept: string;
  manager: string;
  joined: string;
  location: string;
  phone: string;
  address: string;
  monthlyWage: number;
};

export type Me = {
  id: string;
  empId: string;
  email: string;
  name: string;
  role: Role;
  emailVerified: boolean;
  mustChangePassword: boolean;
  profile: MyProfile;
};

// one person as seen by hr in the register / directory
export type Person = {
  id: string;
  empId: string;
  name: string;
  role: string;
  dept: string;
  st: string;
  in: string;
  out: string;
  hrs: string;
  extra: string;
  mgr: string;
  joined: string;
  loc: string;
  wage: number;
};

// one leave request
export type LeaveRow = {
  id: string;
  who: string;
  type: string;
  range: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
  note: string;
  attach?: string;
  decisionNote?: string;
};

// one day of my attendance log
export type LogRow = { day: string; in: string; out: string; hrs: string; status: string };
