import {
  users,
  shopItems,
  shopRequests,
  playRequests,
  messages,
  videoStories,
  type User,
  type UpsertUser,
  type UpdateProfile,
  type ShopItem,
  type InsertShopItem,
  type ShopRequest,
  type InsertShopRequest,
  type PlayRequest,
  type InsertPlayRequest,
  type Message,
  type InsertMessage,
  type VideoStory,
  type InsertVideoStory,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateProfile): Promise<User>;
  getAllPlayers(): Promise<User[]>;

  // Shop operations
  getAllShopItems(): Promise<ShopItem[]>;
  createShopItem(item: InsertShopItem): Promise<ShopItem>;
  createShopRequest(request: InsertShopRequest & { userId: string }): Promise<ShopRequest>;
  getUserShopRequests(userId: string): Promise<ShopRequest[]>;

  // Play request operations
  createPlayRequest(request: InsertPlayRequest & { fromUserId: string }): Promise<PlayRequest>;
  getUserPlayRequests(userId: string): Promise<PlayRequest[]>;
  updatePlayRequestStatus(id: string, status: 'accepted' | 'rejected'): Promise<PlayRequest>;

  // Message operations
  createMessage(message: InsertMessage & { fromUserId: string }): Promise<Message>;
  getConversations(userId: string): Promise<any[]>;
  getMessages(userId: string, otherUserId: string): Promise<any[]>;

  // Video story operations
  createVideoStory(story: InsertVideoStory & { userId: string }): Promise<VideoStory>;
  getAllVideoStories(): Promise<any[]>;
  likeVideoStory(id: string): Promise<VideoStory>;
}

export class DatabaseStorage implements IStorage {
  // User operations - Required for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserProfile(id: string, profile: UpdateProfile): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllPlayers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  // Shop operations
  async getAllShopItems(): Promise<ShopItem[]> {
    return await db.select().from(shopItems).orderBy(desc(shopItems.createdAt));
  }

  async createShopItem(item: InsertShopItem): Promise<ShopItem> {
    const [shopItem] = await db.insert(shopItems).values(item).returning();
    return shopItem;
  }

  async createShopRequest(request: InsertShopRequest & { userId: string }): Promise<ShopRequest> {
    const [shopRequest] = await db.insert(shopRequests).values(request).returning();
    return shopRequest;
  }

  async getUserShopRequests(userId: string): Promise<ShopRequest[]> {
    return await db
      .select()
      .from(shopRequests)
      .where(eq(shopRequests.userId, userId))
      .orderBy(desc(shopRequests.createdAt));
  }

  // Play request operations
  async createPlayRequest(request: InsertPlayRequest & { fromUserId: string }): Promise<PlayRequest> {
    const [playRequest] = await db.insert(playRequests).values(request).returning();
    return playRequest;
  }

  async getUserPlayRequests(userId: string): Promise<PlayRequest[]> {
    return await db
      .select()
      .from(playRequests)
      .where(
        or(
          eq(playRequests.fromUserId, userId),
          eq(playRequests.toUserId, userId)
        )
      )
      .orderBy(desc(playRequests.createdAt));
  }

  async updatePlayRequestStatus(id: string, status: 'accepted' | 'rejected'): Promise<PlayRequest> {
    const [playRequest] = await db
      .update(playRequests)
      .set({ status })
      .where(eq(playRequests.id, id))
      .returning();
    return playRequest;
  }

  // Message operations
  async createMessage(message: InsertMessage & { fromUserId: string }): Promise<Message> {
    const [msg] = await db.insert(messages).values(message).returning();
    return msg;
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get all users with whom the current user has exchanged messages
    const conversations = await db
      .select({
        user: users,
        lastMessage: messages,
      })
      .from(messages)
      .leftJoin(
        users,
        or(
          and(eq(messages.fromUserId, userId), eq(users.id, messages.toUserId)),
          and(eq(messages.toUserId, userId), eq(users.id, messages.fromUserId))
        )
      )
      .where(
        or(
          eq(messages.fromUserId, userId),
          eq(messages.toUserId, userId)
        )
      )
      .orderBy(desc(messages.createdAt));

    // Group by user and get the last message for each conversation
    const conversationMap = new Map();
    for (const conv of conversations) {
      if (!conv.user) continue;
      const existingConv = conversationMap.get(conv.user.id);
      if (!existingConv || new Date(conv.lastMessage.createdAt!) > new Date(existingConv.lastMessage.createdAt!)) {
        conversationMap.set(conv.user.id, {
          user: conv.user,
          lastMessage: conv.lastMessage,
          unreadCount: 0, // TODO: Implement unread count
        });
      }
    }

    return Array.from(conversationMap.values());
  }

  async getMessages(userId: string, otherUserId: string): Promise<any[]> {
    const msgs = await db
      .select({
        id: messages.id,
        content: messages.content,
        read: messages.read,
        createdAt: messages.createdAt,
        fromUserId: messages.fromUserId,
        toUserId: messages.toUserId,
        fromUser: users,
      })
      .from(messages)
      .leftJoin(users, eq(messages.fromUserId, users.id))
      .where(
        or(
          and(eq(messages.fromUserId, userId), eq(messages.toUserId, otherUserId)),
          and(eq(messages.fromUserId, otherUserId), eq(messages.toUserId, userId))
        )
      )
      .orderBy(messages.createdAt);

    return msgs.map(msg => ({
      ...msg,
      toUser: null, // Not needed for display
    }));
  }

  // Video story operations
  async createVideoStory(story: InsertVideoStory & { userId: string }): Promise<VideoStory> {
    const [videoStory] = await db.insert(videoStories).values(story).returning();
    return videoStory;
  }

  async getAllVideoStories(): Promise<any[]> {
    const stories = await db
      .select({
        id: videoStories.id,
        title: videoStories.title,
        description: videoStories.description,
        videoUrl: videoStories.videoUrl,
        thumbnailUrl: videoStories.thumbnailUrl,
        likes: videoStories.likes,
        createdAt: videoStories.createdAt,
        userId: videoStories.userId,
        user: users,
      })
      .from(videoStories)
      .leftJoin(users, eq(videoStories.userId, users.id))
      .orderBy(desc(videoStories.createdAt));

    return stories;
  }

  async likeVideoStory(id: string): Promise<VideoStory> {
    const [story] = await db
      .update(videoStories)
      .set({ likes: sql`${videoStories.likes} + 1` })
      .where(eq(videoStories.id, id))
      .returning();
    return story;
  }
}

export const storage = new DatabaseStorage();
