import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Champions Sports Arena | Reservasi Lapangan",
  description: "Sistem reservasi dan sewa lapangan olahraga"
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
