import type { Metadata } from "next";
import "./globals.css";
import ContextProvider from "@/context";
import { ToastProvider } from "@/context/ToastContext";
import AdSense from "@/components/AdSense";

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
      <head>
        <AdSense pId="ca-pub-1677446125075790" />
        <meta
          name="google-adsense-account"
          content="ca-pub-1677446125075790"
        ></meta>
      </head>
      <body>
        <ContextProvider>
          <ToastProvider>{children}</ToastProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
