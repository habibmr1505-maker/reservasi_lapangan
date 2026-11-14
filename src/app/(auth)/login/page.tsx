import LoginForm from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  if (await getSession()) redirect("/dashboard");
  return <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-sky-800 p-4">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-2xl md:grid-cols-2">
      <section className="hidden flex-col justify-between bg-blue-950 p-10 text-white md:flex">
        <div><p className="text-sm font-bold uppercase tracking-[.25em] text-cyan-300">Champions Sports Arena</p><h1 className="mt-10 text-4xl font-bold leading-tight">Kelola lapangan lebih mudah.</h1><p className="mt-4 text-blue-100">Satu sistem untuk jadwal, reservasi, pembayaran, dan laporan.</p></div>
        <p className="text-sm text-blue-200">Sistem Reservasi & Sewa Lapangan</p>
      </section>
      <section className="p-7 sm:p-10"><p className="text-sm font-semibold text-blue-700">CHAMPIONS SPORTS ARENA</p><h2 className="mt-3 text-3xl font-bold">Selamat datang</h2><p className="mt-2 text-slate-500">Masuk menggunakan akun admin atau kasir.</p><LoginForm /><p className="mt-8 text-xs text-slate-400">Akses hanya untuk petugas terdaftar.</p></section>
    </div>
  </main>;
}
