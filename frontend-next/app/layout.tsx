import "./globals.css";
import { Toaster } from "sonner";
import QueryClientProviderWrapper from "../components/QueryClientProviderWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) { 
  
  
  return (
    <html lang="en">
      <body>
        <Toaster position="top-center" />
        <QueryClientProviderWrapper>
        {children}
        </QueryClientProviderWrapper>
      </body>
    </html>
  );
}
