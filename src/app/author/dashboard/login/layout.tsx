import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ Writer Dashboard — The Isaander",
  robots: { index: false },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
