import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "บทความที่บันทึก — The Isaander",
  robots: { index: false },
};

export default function SavedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
