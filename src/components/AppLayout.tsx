import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Footer from "@/components/Footer";
import jobjetLogo from "@/assets/jobjet-logo-transparent.png";
import { Link } from "react-router-dom";

interface AppLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const AppLayout = ({ children, hideFooter = false }: AppLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-40 flex h-20 items-center gap-2 border-b border-border/50 bg-background/80 backdrop-blur-md px-4">
            <SidebarTrigger />
            <Link to="/" className="ml-2">
              <img src={jobjetLogo} alt="JobJet" className="h-14 w-auto object-contain py-1" />
            </Link>
          </header>
          <main className="flex-1">{children}</main>
          {!hideFooter && <Footer />}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
