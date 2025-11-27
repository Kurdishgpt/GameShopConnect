import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import candyBg from "@assets/IMG_1163_1764100879916.jpg";
import { Users, ShoppingBag, Video, Gamepad2, Zap, Crown, MessageSquare, TrendingUp } from "lucide-react";

export default function Landing() {
  const features = [
    { 
      label: "Find Players", 
      icon: Users,
      color: "from-cyan-400 to-blue-500",
      description: "Connect with gamers worldwide"
    },
    { 
      label: "Shop Gear", 
      icon: ShoppingBag,
      color: "from-purple-400 to-pink-500",
      description: "Best gaming equipment deals"
    },
    { 
      label: "Share Stories", 
      icon: Video,
      color: "from-orange-400 to-red-500",
      description: "Showcase your moments"
    },
    { 
      label: "Join Games", 
      icon: Gamepad2,
      color: "from-lime-400 to-green-500",
      description: "Play with your squad"
    },
    {
      label: "Real-time Chat",
      icon: MessageSquare,
      color: "from-blue-400 to-cyan-500",
      description: "Message like Snapchat"
    },
    {
      label: "Get Notified",
      icon: Zap,
      color: "from-yellow-400 to-orange-500",
      description: "Never miss updates"
    },
    {
      label: "Join Requests",
      icon: Crown,
      color: "from-pink-400 to-purple-500",
      description: "Team building made easy"
    },
    {
      label: "Track Stats",
      icon: TrendingUp,
      color: "from-green-400 to-emerald-500",
      description: "Monitor your progress"
    },
  ];

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
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Main Hero */}
          <div className="space-y-6 pt-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 text-cyan-300 font-bold text-sm uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              Gaming Hub v1.0
            </div>

            {/* Main Title */}
            <h1 className="font-black text-6xl md:text-8xl bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl leading-tight">
              Welcome to GameHub
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-3xl font-bold text-white drop-shadow-lg max-w-3xl mx-auto leading-relaxed">
              Connect • Compete • Conquer • Dominate
            </p>

            {/* Description */}
            <p className="text-lg md:text-xl text-cyan-100 max-w-2xl mx-auto leading-relaxed font-semibold">
              The ultimate gaming social platform. Find teammates, shop exclusive gear, share epic moments, and level up your gaming community.
            </p>
          </div>

          {/* CTA Buttons - Large and Bold */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href="/login">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-black bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 hover:from-cyan-300 hover:via-purple-400 hover:to-pink-400 text-white rounded-2xl flex items-center gap-2 transition-all shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
                data-testid="button-login"
              >
                <Zap className="w-5 h-5" />
                Sign In Now
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                className="h-14 px-10 text-lg font-black bg-white/10 backdrop-blur-md border-2 border-white/30 text-white hover:bg-white/20 hover:border-white/50 rounded-2xl flex items-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer"
                data-testid="button-signup"
              >
                Join Now
                <Gamepad2 className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto pt-8">
            {[
              { number: "50K+", label: "Active Gamers" },
              { number: "150+", label: "Games" },
              { number: "24/7", label: "Support" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 hover-elevate"
              >
                <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
                  {stat.number}
                </p>
                <p className="text-white/80 font-semibold text-sm mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative z-10 px-4 py-20 md:py-32">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-lime-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 drop-shadow-lg">
              Powerful Features
            </h2>
            <p className="text-lg text-white/80 font-semibold">
              Everything you need to dominate the gaming world
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.label}
                  className="group relative"
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute -inset-0.5 bg-gradient-to-r ${feature.color} rounded-2xl blur opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                  
                  {/* Card */}
                  <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-2xl p-6 border border-white/10 h-full hover-elevate transition-all group">
                    {/* Icon Background */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-black text-white mb-2">
                      {feature.label}
                    </h3>
                    <p className="text-white/60 text-sm font-medium">
                      {feature.description}
                    </p>

                    {/* Bottom Accent */}
                    <div className={`h-1 bg-gradient-to-r ${feature.color} rounded-full mt-4 w-0 group-hover:w-full transition-all duration-300`}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto">
          {/* Gradient Border Container */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-3xl blur opacity-40"></div>
          
          <div className="relative bg-gradient-to-br from-slate-950 to-slate-900/80 backdrop-blur-xl rounded-3xl p-12 border border-white/10 text-center">
            <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
              Ready to Level Up?
            </h3>
            <p className="text-lg text-white/70 font-semibold mb-8">
              Join thousands of gamers already competing and building their community.
            </p>
            
            <Link href="/signup">
              <Button
                size="lg"
                className="h-12 px-8 text-base font-black bg-gradient-to-r from-lime-400 via-cyan-500 to-blue-600 hover:from-lime-300 hover:via-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl flex items-center gap-2 transition-all shadow-2xl shadow-cyan-500/50 hover:shadow-cyan-500/75 hover:scale-105 active:scale-95 uppercase tracking-wider cursor-pointer mx-auto"
              >
                <Crown className="w-5 h-5" />
                Start Playing Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 px-4 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-white/50 text-sm font-semibold">
          <p>🎮 GameHub © 2025 | The Ultimate Gaming Social Platform 🎮</p>
        </div>
      </div>
    </div>
  );
}
