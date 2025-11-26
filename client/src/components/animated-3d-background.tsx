export function Animated3DBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
      <div className="absolute inset-0 perspective">
        {/* Main 3D cube */}
        <div className="cube-container">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="cube-face"
              style={{
                transform: `rotateY(${i * 60}deg) translateZ(150px)`,
              }}
            />
          ))}
        </div>

        {/* Floating orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50" />
      </div>

      <style>{`
        @keyframes rotateCube {
          from {
            transform: rotateX(0deg) rotateY(0deg) rotateZ(0deg);
          }
          to {
            transform: rotateX(360deg) rotateY(360deg) rotateZ(0deg);
          }
        }

        @keyframes float1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          25% {
            transform: translate(100px, -100px) scale(1.2);
            opacity: 0.4;
          }
          50% {
            transform: translate(-100px, -200px) scale(0.8);
            opacity: 0.7;
          }
          75% {
            transform: translate(-50px, 100px) scale(1.1);
            opacity: 0.5;
          }
        }

        @keyframes float2 {
          0%, 100% {
            transform: translate(0, 0) scale(1.1);
            opacity: 0.5;
          }
          33% {
            transform: translate(-150px, 150px) scale(0.9);
            opacity: 0.6;
          }
          66% {
            transform: translate(150px, -150px) scale(1.2);
            opacity: 0.4;
          }
        }

        @keyframes float3 {
          0%, 100% {
            transform: translate(0, 0) scale(0.9);
            opacity: 0.4;
          }
          50% {
            transform: translate(200px, 200px) scale(1.3);
            opacity: 0.6;
          }
        }

        .cube-container {
          position: absolute;
          width: 300px;
          height: 300px;
          left: 50%;
          top: 50%;
          margin-left: -150px;
          margin-top: -150px;
          transform-style: preserve-3d;
          animation: rotateCube 20s infinite linear;
          filter: blur(1px);
          opacity: 0.3;
        }

        .cube-face {
          position: absolute;
          width: 300px;
          height: 300px;
          background: linear-gradient(135deg, rgb(139, 92, 246), rgb(59, 130, 246));
          border: 2px solid rgba(139, 92, 246, 0.3);
          opacity: 0.6;
          backface-visibility: hidden;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          mix-blend-mode: screen;
        }

        .orb-1 {
          width: 200px;
          height: 200px;
          background: radial-gradient(circle, rgb(139, 92, 246), transparent);
          left: 10%;
          top: 20%;
          animation: float1 15s ease-in-out infinite;
        }

        .orb-2 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgb(59, 130, 246), transparent);
          right: 10%;
          bottom: 20%;
          animation: float2 18s ease-in-out infinite;
        }

        .orb-3 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgb(99, 102, 241), transparent);
          left: 50%;
          top: 50%;
          margin-left: -150px;
          margin-top: -150px;
          animation: float3 22s ease-in-out infinite;
        }

        .dark .orb-1 {
          background: radial-gradient(circle, rgb(168, 85, 247), transparent);
        }

        .dark .orb-2 {
          background: radial-gradient(circle, rgb(96, 165, 250), transparent);
        }

        .dark .orb-3 {
          background: radial-gradient(circle, rgb(129, 140, 248), transparent);
        }

        .dark .cube-face {
          background: linear-gradient(135deg, rgb(168, 85, 247), rgb(96, 165, 250));
          border-color: rgba(168, 85, 247, 0.4);
        }
      `}</style>
    </div>
  );
}
