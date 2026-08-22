// root sends folks into shell. real landing maybe later.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/employees");
}
