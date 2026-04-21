import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Writer Dashboard — The Isaander",
  robots: { index: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
