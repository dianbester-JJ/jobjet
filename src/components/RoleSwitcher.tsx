import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const RoleSwitcher = () => {
  const { roles, activeRole, setActiveRole } = useAuth();
  const navigate = useNavigate();

  if (!roles.includes("pro")) return null;

  const isPro = activeRole === "pro";

  const handleToggle = async () => {
    const newRole = isPro ? "customer" : "pro";
    await setActiveRole(newRole);
    navigate(newRole === "pro" ? "/provider/dashboard" : "/dashboard");
  };

  return (
    <button
      onClick={handleToggle}
      className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-accent transition-colors"
    >
      <span className="font-medium text-foreground">
        {isPro ? "Pro Mode" : "Customer Mode"}
      </span>
      <div
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-all duration-300 ease-in-out",
          isPro ? "bg-primary" : "bg-muted-foreground/30"
        )}
      >
        <span
          className={cn(
            "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-all duration-300 ease-in-out",
            isPro ? "translate-x-5 scale-110" : "translate-x-0.5 scale-100"
          )}
        />
      </div>
    </button>
  );
};

export default RoleSwitcher;
