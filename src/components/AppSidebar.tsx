import { Home, Search, MessageSquare, User, CalendarDays, LogOut, Briefcase, LayoutDashboard, HelpCircle, UserCircle } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import jobjetLogo from "@/assets/jobjet-logo-transparent.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const location = useLocation();
  const { user, signOut, loading, isPro, roles } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  

  const isActive = (path: string) => location.pathname === path;

  const mainNav = [
    { title: "Home", url: "/", icon: Home },
    { title: "Browse Services", url: "/services", icon: Search },
  ];

  const userNav = [
    { title: "Messages", url: "/messages", icon: MessageSquare },
    { title: "Bookings", url: "/bookings", icon: CalendarDays },
    { title: "Account", url: "/personal-details", icon: User },
    { title: "Help", url: "/help", icon: HelpCircle },
  ];

  const proNav = [
    { title: "Listings", url: "/provider/dashboard", icon: LayoutDashboard },
    ...(user ? [{ title: "Profile", url: `/pro/${user.id}`, icon: UserCircle }] : []),
  ];
  
  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="p-4">
          <Link to="/" className="flex items-center justify-center">
            <img
              src={jobjetLogo}
              alt="JobJet"
              className={collapsed ? "h-20 w-auto" : "h-32 w-auto"}
            />
          </Link>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNav.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {!loading && user && (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>My Account</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {userNav.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(item.url)}
                          tooltip={item.title}
                        >
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {isPro && (
                <>
                  <SidebarSeparator />
                  <SidebarGroup>
                    <SidebarGroupLabel>Pro Tools</SidebarGroupLabel>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {proNav.map((item) => (
                          <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                              asChild
                              isActive={isActive(item.url)}
                              tooltip={item.title}
                            >
                              <Link to={item.url}>
                                <item.icon className="h-4 w-4" />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </SidebarGroup>
                </>
              )}
            </>
          )}
        </SidebarContent>

        <SidebarFooter className="p-3">
          {!loading && user && (
            <div className="space-y-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={signOut}
              >
                <LogOut className="mr-2 h-3.5 w-3.5" />
                {!collapsed && "Sign Out"}
              </Button>
            </div>
          )}

          {!loading && !user && !collapsed && (
            <div className="space-y-2">
              <Link to="/auth?mode=signin">
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth?mode=signup">
                <Button size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </SidebarFooter>
      </Sidebar>
    </>
  );
};

export default AppSidebar;
