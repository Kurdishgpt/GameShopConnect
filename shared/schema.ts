import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRole = pgEnum('user_role', ['owner', 'admin', 'media', 'developer', 'player']);
export const platform = pgEnum('platform', ['playstation', 'xbox', 'pc', 'switch', 'mobile']);
export const requestStatus = pgEnum('request_status', ['pending', 'accepted', 'rejected']);

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  
  // Authentication fields
  username: varchar("username").unique().notNull(),
  passwordHash: varchar("password_hash").notNull(),
  
  // Profile fields
  birthDate: timestamp("birth_date"),
  gender: varchar("gender"), // 'male', 'female', 'other'
  
  // Gaming platform fields
  role: userRole("role").notNull().default('player'),
  age: integer("age"),
  selectedPlatform: platform("selected_platform"),
  bio: text("bio"),
  favoriteGames: text("favorite_games").array(),
  isOnline: boolean("is_online").default(false),
});

// Shopping items table
export const shopItems = pgTable("shop_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  ownerId: varchar("owner_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  price: varchar("price").notNull(),
  imageUrl: varchar("image_url"),
  category: varchar("category"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shopping requests table
export const shopRequests = pgTable("shop_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  itemId: varchar("item_id").notNull().references(() => shopItems.id),
  status: requestStatus("status").notNull().default('pending'),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Play requests table
export const playRequests = pgTable("play_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  game: varchar("game").notNull(),
  message: text("message"),
  status: requestStatus("status").notNull().default('pending'),
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages table
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id),
  toUserId: varchar("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Video stories table
export const videoStories = pgTable("video_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  videoUrl: varchar("video_url").notNull(),
  thumbnailUrl: varchar("thumbnail_url"),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  message: text("message"),
  type: varchar("type").notNull(), // 'message', 'request', 'shop', 'play'
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  shopRequests: many(shopRequests),
  sentPlayRequests: many(playRequests, { relationName: 'sentPlayRequests' }),
  receivedPlayRequests: many(playRequests, { relationName: 'receivedPlayRequests' }),
  sentMessages: many(messages, { relationName: 'sentMessages' }),
  receivedMessages: many(messages, { relationName: 'receivedMessages' }),
  videoStories: many(videoStories),
}));

export const shopItemsRelations = relations(shopItems, ({ many }) => ({
  requests: many(shopRequests),
}));

export const shopRequestsRelations = relations(shopRequests, ({ one }) => ({
  user: one(users, {
    fields: [shopRequests.userId],
    references: [users.id],
  }),
  item: one(shopItems, {
    fields: [shopRequests.itemId],
    references: [shopItems.id],
  }),
}));

export const playRequestsRelations = relations(playRequests, ({ one }) => ({
  fromUser: one(users, {
    fields: [playRequests.fromUserId],
    references: [users.id],
    relationName: 'sentPlayRequests',
  }),
  toUser: one(users, {
    fields: [playRequests.toUserId],
    references: [users.id],
    relationName: 'receivedPlayRequests',
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  fromUser: one(users, {
    fields: [messages.fromUserId],
    references: [users.id],
    relationName: 'sentMessages',
  }),
  toUser: one(users, {
    fields: [messages.toUserId],
    references: [users.id],
    relationName: 'receivedMessages',
  }),
}));

export const videoStoriesRelations = relations(videoStories, ({ one }) => ({
  user: one(users, {
    fields: [videoStories.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Zod schemas for validation
export const signupSchema = z.object({
  username: z.string().min(3).max(20),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  birthDate: z.string().refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), "Invalid date format").optional().or(z.literal("")),
  gender: z.enum(['male', 'female', 'other']).optional(),
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
}).partial();

export const updateProfileSchema = createInsertSchema(users).pick({
  age: true,
  selectedPlatform: true,
  bio: true,
  favoriteGames: true,
  profileImageUrl: true,
});

export const insertShopItemSchema = createInsertSchema(shopItems).omit({ id: true, createdAt: true, ownerId: true });

export const insertShopRequestSchema = createInsertSchema(shopRequests).omit({ id: true, createdAt: true, status: true });

export const insertPlayRequestSchema = createInsertSchema(playRequests).omit({ id: true, createdAt: true, status: true });

export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true, read: true, fromUserId: true });

export const insertVideoStorySchema = createInsertSchema(videoStories).omit({ id: true, createdAt: true, likes: true });

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, read: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type UpdateProfile = z.infer<typeof updateProfileSchema>;

export type ShopItem = typeof shopItems.$inferSelect;
export type InsertShopItem = z.infer<typeof insertShopItemSchema>;

export type ShopRequest = typeof shopRequests.$inferSelect;
export type InsertShopRequest = z.infer<typeof insertShopRequestSchema>;

export type PlayRequest = typeof playRequests.$inferSelect;
export type InsertPlayRequest = z.infer<typeof insertPlayRequestSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type VideoStory = typeof videoStories.$inferSelect;
export type InsertVideoStory = z.infer<typeof insertVideoStorySchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
