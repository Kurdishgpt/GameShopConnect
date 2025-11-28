import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authUtils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Gamepad2, Mail, Lock, ArrowRight, Zap } from "lucide-react";
import gambleBallBg from "@assets/generated_images/futuristic_gaming_gamble_ball.png";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Login Failed",
          description: error.message || "Invalid username or password",
          variant: "destructive",
        });
        return;
      }

      const user = await response.json();
      login(user);
      toast({
        title: "Welcome back!",
        description: "Logged in successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Gamble Ball Background */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${gambleBallBg})` }} />

      {/* Vibrant Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/70 via-purple-900/70 to-pink-900/70" />
      
      {/* Animated Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10" />

      {/* Floating Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-green-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with Gaming Icon */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 mb-6 shadow-2xl shadow-purple-500/50 animate-bounce">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-3 drop-shadow-lg">Welcome Back!</h1>
          <p className="text-lg text-cyan-200 font-semibold">Enter the gaming arena</p>
        </div>

        {/* Main Card */}
        <div className="relative">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-75 animate-pulse"></div>
          
          {/* Card Content */}
          <div className="relative bg-slate-950/90 backdrop-blur-2xl rounded-2xl p-10 border border-white/10 shadow-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Username Field */}
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm font-bold uppercase tracking-wide flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded bg-gradient-to-r from-cyan-400 to-blue-500 flex items-center justify-center">
                          <Mail className="w-3 h-3 text-white" />
                        </div>
                        Username
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="gaming_pro_123"
                          {...field}
                          className="bg-white/5 border-2 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-400 focus:bg-cyan-500/5 focus:shadow-lg focus:shadow-cyan-500/20 transition-all h-12 px-4 rounded-xl text-base font-medium"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs font-semibold" />
                    </FormItem>
                  )}
                />

                {/* Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white text-sm font-bold uppercase tracking-wide flex items-center gap-2 mb-3">
                        <div className="w-5 h-5 rounded bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                          <Lock className="w-3 h-3 text-white" />
                        </div>
                        Password
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-white/5 border-2 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:bg-purple-500/5 focus:shadow-lg focus:shadow-purple-500/20 transition-all h-12 px-4 rounded-xl text-base font-medium"
                          data-testid="input-password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400 text-xs font-semibold" />
                    </FormItem>
                  )}
                />

                {/* Sign In Button - Big and Bold */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 mt-8 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 text-white font-black text-lg rounded-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-105 active:scale-95 uppercase tracking-wider"
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5" />
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </Form>

            {/* Divider */}
            <div className="my-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
              <span className="text-white/50 text-sm font-semibold">OR</span>
              <div className="flex-1 h-px bg-gradient-to-l from-pink-500/30 to-transparent"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">
                Don't have an account?{" "}
                <Link href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 font-black hover:from-cyan-300 hover:to-pink-400 transition-all">
                  CREATE ACCOUNT
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs font-semibold uppercase tracking-widest">
            ⚡ Secure Gaming Platform ⚡
          </p>
        </div>
      </div>
    </div>
  );
}
