import "./globals.css";
import QueryClientProviderWrapper from "../components/QueryClientProviderWrapper";
import { UserProvider } from "@/components/UserContext";
import ToasterProvider from "@/components/ToasterProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Warehouse Petty Cash Flow",
  icons: {
    icon: "/csi-logo.png",
    shortcut: "/csi-logo.png",
    apple: "/csi-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light">
      <body>
        <QueryClientProviderWrapper>
          <UserProvider>
            <ToasterProvider>{children}</ToasterProvider>
          </UserProvider>
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
