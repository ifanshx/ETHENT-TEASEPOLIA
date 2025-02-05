import type { Metadata } from "next";
import "./globals.css";
import ContextProvider from "@/context";
import { ToastProvider } from "@/context/ToastContext";

export const metadata: Metadata = {
  title: "Ethereal Entities",
  description: "Ethereal Entities",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>
          <ToastProvider>{children}</ToastProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
