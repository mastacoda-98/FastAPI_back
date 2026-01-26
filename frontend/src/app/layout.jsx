import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/ui/Navbar";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "LMS",
  description: "Learning Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-stone-50">
        <AuthProvider>
          <Navbar />
          <div>{children}</div>
        </AuthProvider>
        <ToastContainer />
      </body>
    </html>
  );
}
