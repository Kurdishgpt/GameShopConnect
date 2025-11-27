import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import candyBg from "@assets/IMG_1163_1764100879916.jpg";
import { Zap, Gamepad2, Crown, ChevronDown } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${candyBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black/85" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-0 w-72 h-72 bg-gradient-to-br from-lime-400/20 to-green-600/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-center">
        <div className="max-w-5xl mx-auto space-y-10 pt-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-cyan-300 font-bold text-sm uppercase tracking-wider animate-bounce">
            <Zap className="w-4 h-4" />
            Gaming Hub v1.0
          </div>

          {/* Main Title - HUGE */}
          <div className="space-y-6">
            <h1 className="font-black text-7xl md:text-8xl lg:text-9xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              GameHub
            </h1>

            {/* Animated Subtitle */}
            <p className="text-2xl md:text-4xl font-black text-white drop-shadow-lg leading-tight">
              Where Gamers Unite
            </p>

            {/* Description */}
            <p className="text-lg md:text-2xl text-cyan-100 max-w-3xl mx-auto leading-relaxed font-bold drop-shadow-lg">
              Connect with players worldwide, dominate with your squad, and level up your gaming experience on the ultimate social platform.
            </p>
          </div>

          {/* CTA Buttons - Massive */}
          <div className="flex flex-col items-center gap-6 justify-center pt-8">
            <Link href="/login">
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 text-white rounded-3xl flex items-center gap-3 transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-110 active:scale-95 uppercase tracking-wider cursor-pointer"
                data-testid="button-login"
              >
                <Zap className="w-6 h-6" />
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-16 px-12 text-xl font-black bg-white/10 backdrop-blur-md border-3 border-white/40 text-white hover:bg-white/20 hover:border-white/60 rounded-3xl flex items-center gap-3 transition-all shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 uppercase tracking-wider cursor-pointer"
                data-testid="button-signup"
              >
                Join Now
                <Crown className="w-6 h-6" />
              </Button>
            </Link>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-12 animate-bounce">
            <ChevronDown className="w-8 h-8 text-cyan-400 mx-auto" />
          </div>
        </div>
      </div>

      {/* Premium Highlights Section */}
      <div className="relative z-10 px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center hover-elevate">
                <Gamepad2 className="w-12 h-12 mx-auto mb-4 text-cyan-400" />
                <h3 className="text-2xl font-black text-white mb-2">Find Your Squad</h3>
                <p className="text-white/70 font-semibold">Connect with players who match your gaming style and competitive level</p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center hover-elevate">
                <Zap className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                <h3 className="text-2xl font-black text-white mb-2">Instant Connection</h3>
                <p className="text-white/70 font-semibold">Real-time messaging, play requests, and team notifications at your fingertips</p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 to-green-600 rounded-2xl blur opacity-50 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative bg-slate-950/90 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center hover-elevate">
                <Crown className="w-12 h-12 mx-auto mb-4 text-lime-400" />
                <h3 className="text-2xl font-black text-white mb-2">Dominate Together</h3>
                <p className="text-white/70 font-semibold">Build your empire, share your victories, and conquer the gaming world as one</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="relative z-10 px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Gradient Border Container */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur opacity-50"></div>
          
          <div className="relative bg-gradient-to-br from-slate-950 to-slate-900/80 backdrop-blur-xl rounded-3xl p-12 md:p-16 border border-white/20 text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 drop-shadow-lg">
              The Gaming Revolution Starts Here
            </h2>
            <p className="text-xl text-cyan-100 font-bold mb-10 drop-shadow-lg">
              Be part of the most vibrant gaming community. Play smarter. Win bigger. Build legends.
            </p>
            
            <Link href="/signup">
              <Button
                className="h-11 px-6 text-sm font-black bg-gradient-to-r from-lime-400 via-cyan-500 to-blue-600 hover:from-lime-300 hover:via-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 py-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-white/50 text-sm font-semibold">
          <p>🎮 GameHub - The Ultimate Gaming Social Platform 🎮</p>
        </div>
      </div>
    </div>
  );
}
