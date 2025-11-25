// Google OAuth setup
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: true,
      maxAge: sessionTtl,
    },
  });
}

async function upsertUser(profile: any) {
  await storage.upsertUser({
    id: profile.id,
    email: profile.emails?.[0]?.value || null,
    firstName: profile.given_name || profile.name?.givenName || null,
    lastName: profile.family_name || profile.name?.familyName || null,
    profileImageUrl: profile.photos?.[0]?.value || profile.picture || null,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only set up Google Strategy if credentials are provided
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    // Determine the correct callback URL based on environment
    let callbackURL: string;
    
    if (process.env.REPLIT_DOMAINS) {
      // Extract the first domain from REPLIT_DOMAINS (comma-separated list)
      const replitDomain = process.env.REPLIT_DOMAINS.split(",")[0].trim();
      callbackURL = `https://${replitDomain}/api/auth/google/callback`;
    } else if (process.env.NODE_ENV === "production") {
      // Production fallback - should have REPLIT_DEPLOYMENT
      callbackURL = `https://${process.env.REPLIT_DEPLOYMENT}/api/auth/google/callback`;
    } else {
      // Development fallback
      callbackURL = `http://localhost:5000/api/auth/google/callback`;
    }

    console.log("Google OAuth callback URL:", callbackURL);

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            await upsertUser(profile);
            done(null, profile);
          } catch (err) {
            done(err);
          }
        }
      )
    );

    app.get(
      "/api/auth/google",
      passport.authenticate("google", {
        scope: ["profile", "email"],
      })
    );

    app.get(
      "/api/auth/google/callback",
      passport.authenticate("google", {
        failureRedirect: "/",
      }),
      (req, res) => {
        res.redirect("/");
      }
    );
  } else {
    // Fallback route if credentials not set
    app.get("/api/auth/google", (req, res) => {
      res.status(500).json({ 
        message: "Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables." 
      });
    });
  }

  passport.serializeUser((user: any, cb) => cb(null, user?.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      if (!id) {
        return cb(null, null);
      }
      const user = await storage.getUser(id);
      cb(null, user || null);
    } catch (err) {
      // Don't fail on deserialization errors, just return null
      cb(null, null);
    }
  });

  app.get("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.redirect("/");
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};
