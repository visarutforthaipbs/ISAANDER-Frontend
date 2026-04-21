import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "จัดการนักเขียน — The Isaander",
  robots: { index: false },
};

export default function WritersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
