import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  roles: string[];
  activeRole: string;
  setActiveRole: (role: string) => Promise<void>;
  isPro: boolean;
  isCustomer: boolean;
  addProRole: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRoleState] = useState<string>("customer");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (session?.user) {
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setRoles([]);
          setActiveRoleState("customer");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("roles, active_role")
      .eq("id", userId)
      .maybeSingle();

    if (data) {
      setRoles(data.roles || ["customer"]);
      setActiveRoleState(data.active_role || "customer");
    }
  };

  const setActiveRole = async (role: string) => {
    if (!user) return;
    setActiveRoleState(role);
    await supabase
      .from("profiles")
      .update({ active_role: role })
      .eq("id", user.id);
  };

  const addProRole = async () => {
    if (!user) return;
    const newRoles = roles.includes("pro") ? roles : [...roles, "pro"];
    setRoles(newRoles);
    setActiveRoleState("pro");
    await supabase
      .from("profiles")
      .update({ roles: newRoles, active_role: "pro" })
      .eq("id", user.id);

    // Also ensure user_roles has provider
    await supabase
      .from("user_roles")
      .upsert({ user_id: user.id, role: "provider" as any }, { onConflict: "user_id,role" });
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setRoles([]);
    setActiveRoleState("customer");
  };

  const isPro = activeRole === "pro" && roles.includes("pro");
  const isCustomer = activeRole === "customer" || !roles.includes("pro");

  return (
    <AuthContext.Provider value={{
      user, session, loading, signUp, signIn, signOut,
      roles, activeRole, setActiveRole, isPro, isCustomer, addProRole,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
