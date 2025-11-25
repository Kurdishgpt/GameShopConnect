import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import candyBg from "@assets/IMG_1163_1764100879916.jpg";

export default function Landing() {
  return (
    <div className="min-h-screen relative">
      {/* Hero Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${candyBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="font-heading font-bold text-5xl md:text-7xl text-white drop-shadow-lg" data-testid="heading-welcome">
            Welcome to GameHub
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
            Connect with gamers, find teammates, shop for gaming gear, and share your epic gaming moments
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/login">
              <a>
                <Button
                  size="lg"
                  variant="default"
                  className="text-lg px-8 py-6 font-semibold"
                  data-testid="button-login"
                >
                  Sign In
                </Button>
              </a>
            </Link>
            <Link href="/signup">
              <a>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 font-semibold"
                  data-testid="button-signup"
                >
                  Sign Up
                </Button>
              </a>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 max-w-3xl mx-auto">
            {[
              { label: "Find Players", icon: "👥" },
              { label: "Shop Gear", icon: "🛍️" },
              { label: "Share Stories", icon: "📹" },
              { label: "Join Games", icon: "🎮" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="bg-white/10 backdrop-blur-md rounded-lg p-4 border border-white/20"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <p className="text-white font-medium">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
