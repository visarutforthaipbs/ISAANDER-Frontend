import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "สมัครเป็นนักเขียน — The Isaander",
  robots: { index: false },
};

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
