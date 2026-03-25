import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Lock, User, Loader2 } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const defaultMode = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        if (error) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
          toast({
            title: "Check your email",
            description: "We've sent you a password reset link.",
          });
          setMode("signin");
        }
      } else if (mode === "signup") {
        if (!fullName.trim()) {
          toast({
            title: "Name required",
            description: "Please enter your full name.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Sign up failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account created!",
            description: "Welcome to JobJet!",
          });
          navigate("/");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Sign in failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "You've successfully signed in.",
          });
          navigate("/");
        }
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div>
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to home
            </Link>

            <div className="mt-6 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-hero">
                <span className="text-lg font-bold text-primary-foreground">J</span>
              </div>
              <span className="font-display text-xl font-semibold text-foreground">JobJet</span>
            </div>

            <h2 className="mt-8 font-display text-2xl font-bold text-foreground">
              {mode === "signin" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset your password"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "forgot" ? (
                <>
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Sign in
                  </button>
                </>
              ) : mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-medium text-primary hover:text-primary/80"
                  >
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {mode === "signup" && (
              <div>
                <Label htmlFor="fullName">Full name</Label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {mode !== "forgot" && (
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  minLength={6}
                  required
                />
              </div>
              {mode === "signup" && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              )}
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => setMode("forgot")}
                  className="mt-1 text-xs font-medium text-primary hover:text-primary/80"
                >
                  Forgot your password?
                </button>
              )}
            </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {mode === "signin" ? "Signing in..." : mode === "forgot" ? "Sending..." : "Creating account..."}
                </>
              ) : (
                <>{mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Create account"}</>
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="relative hidden flex-1 lg:block">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-primary-foreground">
            <h3 className="font-display text-4xl font-bold">
              Find trusted service providers
            </h3>
            <p className="mt-4 text-lg text-primary-foreground/80">
              Book painters, plumbers, cleaners and more — all verified professionals.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
