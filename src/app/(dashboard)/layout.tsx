import { requireUser } from "@/lib/auth";
import Sidebar from "@/components/Sidebar";

export default async function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await requireUser();
  return <div className="min-h-screen md:flex"><Sidebar user={user} /><main className="min-w-0 flex-1 p-4 sm:p-7 lg:p-9"><div className="mx-auto max-w-7xl">{children}</div></main></div>;
}
