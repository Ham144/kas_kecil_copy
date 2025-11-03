import "./globals.css";
import QueryClientProviderWrapper from "../components/QueryClientProviderWrapper";
import { UserProvider } from "@/components/UserContext";
import ToasterProvider from "@/components/ToasterProvider";

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
