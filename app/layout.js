import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
  title: "FinSync",
  description: "Sync your finances. Simplify your life.",
};

export default function RootLayout({ children }) {
  return (

    <ClerkProvider>
    <html lang="en">
      <body className={`${inter.className}`}>
        {/* header */}
        <Header />
        <main className="min-h-screen">  {children}  </main>

        {/* footer */}
        <footer className="bg-blue-50 py-12">
          
          <div className="container mx-auto px-10 text-center text-gray-600 mb-12">
            <h3> Need Help?</h3>
            <p>📧 support@finsync1885.com</p>
            <p>📍 123 Fintech Street, Silicon Valley, Chennai</p>
          </div>

          <div className="container mx-auto px-4 text-center text-gray-600 mb-0">
            <p>FinSync &copy; All rights reserved 2025</p>
          </div>

        </footer>
      </body>
    </html>
    </ClerkProvider>
  );
}
