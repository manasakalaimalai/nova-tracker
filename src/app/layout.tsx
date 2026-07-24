import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { EditModeProvider } from "@/context/EditModeContext";

export const metadata: Metadata = {
  title: "Nova Tracker",
  description: "Finance tracker for Nova Residency Cohort 0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <EditModeProvider>
          <Nav />
          {children}
        </EditModeProvider>
      </body>
    </html>
  );
}
