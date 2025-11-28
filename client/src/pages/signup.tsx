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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Gamepad2, User, Mail, Lock, Calendar, Heart, ArrowRight, Sparkles, Zap, ChevronRight } from "lucide-react";
import gambleBallBg from "@assets/generated_images/futuristic_gaming_gamble_ball.png";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  gender: z.enum(["male", "female", "other"]).optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      email: "",
      birthDate: "",
      gender: undefined,
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          email: data.email || undefined,
          birthDate: data.birthDate || undefined,
          gender: data.gender || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "Signup Failed",
          description: error.message || "Failed to create account",
          variant: "destructive",
        });
        return;
      }

      const user = await response.json();
      login(user);
      toast({
        title: "Welcome!",
        description: "Account created successfully",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
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
      <div className="absolute inset-0 bg-gradient-to-tr from-green-400/10 via-transparent to-purple-500/10" />

      {/* Floating Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-lime-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-gradient-to-br from-orange-400/20 to-red-500/20 rounded-full blur-3xl animate-pulse"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header with Gaming Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-br from-lime-400 via-cyan-500 to-blue-600 mb-6 shadow-2xl shadow-cyan-500/50 animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-2 drop-shadow-lg">Join GameHub!</h1>
          <p className="text-lg text-lime-200 font-semibold">Start your gaming journey now</p>
        </div>

        {/* Progress Steps - Bold and Colorful */}
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div
                className={`h-3 w-10 rounded-full transition-all font-black text-white text-xs flex items-center justify-center ${
                  s <= step ? "bg-gradient-to-r from-cyan-400 to-purple-500 shadow-lg shadow-purple-500/50" : "bg-white/20"
                }`}
              >
                {s <= step && s < 3 && <span></span>}
              </div>
              {s < 3 && <div className={s <= step ? "text-cyan-400" : "text-white/30"}>/</div>}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="relative">
          {/* Gradient Border Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 via-cyan-500 to-pink-500 rounded-2xl blur opacity-75 animate-pulse"></div>
          
          {/* Card Content */}
          <div className="relative bg-slate-950/90 backdrop-blur-2xl rounded-2xl p-10 border border-white/10 shadow-2xl">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-cyan-400" />
                              First
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="John"
                                {...field}
                                className="bg-white/5 border-2 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-400 focus:bg-cyan-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                                data-testid="input-firstname"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                              <User className="w-4 h-4 text-purple-400" />
                              Last
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Doe"
                                {...field}
                                className="bg-white/5 border-2 border-purple-500/30 text-white placeholder:text-white/40 focus:border-purple-400 focus:bg-purple-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                                data-testid="input-lastname"
                              />
                            </FormControl>
                            <FormMessage className="text-red-400 text-xs" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                            <Gamepad2 className="w-4 h-4 text-lime-400" />
                            Gaming Tag
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="gaming_pro_123"
                              {...field}
                              className="bg-white/5 border-2 border-lime-500/30 text-white placeholder:text-white/40 focus:border-lime-400 focus:bg-lime-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                              data-testid="input-username"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full h-12 bg-gradient-to-r from-lime-400 via-cyan-500 to-blue-600 hover:from-lime-300 hover:via-cyan-400 hover:to-blue-500 text-slate-950 font-black text-base rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:scale-105 active:scale-95 uppercase tracking-wider mt-6"
                    >
                      Next Step
                      <ChevronRight className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Credentials */}
                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                            <Lock className="w-4 h-4 text-pink-400" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="••••••••"
                              {...field}
                              className="bg-white/5 border-2 border-pink-500/30 text-white placeholder:text-white/40 focus:border-pink-400 focus:bg-pink-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                              data-testid="input-password"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4 text-orange-400" />
                            Email
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="john@example.com"
                              {...field}
                              className="bg-white/5 border-2 border-orange-500/30 text-white placeholder:text-white/40 focus:border-orange-400 focus:bg-orange-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                              data-testid="input-email"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1 h-10 border-2 border-white/20 text-white hover:bg-white/10 font-bold rounded-lg"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(3)}
                        className="flex-1 h-10 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-500/50 hover:shadow-purple-500/75 uppercase tracking-wider"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Profile */}
                {step === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-red-400" />
                            Birth Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              className="bg-white/5 border-2 border-red-500/30 text-white focus:border-red-400 focus:bg-red-500/5 transition-all h-10 px-3 rounded-lg text-sm"
                              data-testid="input-birthdate"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2 mb-2">
                            <Heart className="w-4 h-4 text-rose-400" />
                            Gender
                          </FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger className="bg-white/5 border-2 border-rose-500/30 text-white focus:border-rose-400 focus:bg-rose-500/5 h-10 rounded-lg text-sm" data-testid="select-gender">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-slate-900 border-white/10">
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-red-400 text-xs" />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2 pt-2">
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        variant="outline"
                        className="flex-1 h-10 border-2 border-white/20 text-white hover:bg-white/10 font-bold rounded-lg"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 h-10 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 text-slate-950 font-black rounded-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-purple-500/50 hover:shadow-purple-500/75 uppercase tracking-wider"
                        data-testid="button-signup"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>
            </Form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/30 to-transparent"></div>
              <span className="text-white/50 text-xs font-bold">OR</span>
              <div className="flex-1 h-px bg-gradient-to-l from-pink-500/30 to-transparent"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-white/80 text-sm font-medium">
                Already a player?{" "}
                <Link href="/login" className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-cyan-400 font-black hover:from-lime-300 hover:to-cyan-300 transition-all">
                  SIGN IN NOW
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-white/50 text-xs font-bold uppercase tracking-widest">
            🎮 Join Thousands of Gamers 🎮
          </p>
        </div>
      </div>
    </div>
  );
}
