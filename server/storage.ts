import {
  users,
  shopItems,
  shopRequests,
  playRequests,
  messages,
  videoStories,
  notifications,
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
  type Notification,
  type InsertNotification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(data: {
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    email?: string;
    birthDate?: Date;
    gender?: string;
  }): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, profile: UpdateProfile): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User>;
  getAllPlayers(): Promise<User[]>;
  updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User>;
  deleteUser(id: string): Promise<void>;

  // Shop operations
  getAllShopItems(): Promise<ShopItem[]>;
  getShopItem(id: string): Promise<ShopItem | undefined>;
  createShopItem(item: InsertShopItem & { ownerId: string }): Promise<ShopItem>;
  deleteShopItem(id: string): Promise<void>;
  createShopRequest(request: InsertShopRequest & { userId: string }): Promise<ShopRequest>;
  getUserShopRequests(userId: string): Promise<ShopRequest[]>;
  deleteShopRequest(id: string): Promise<void>;

  // Play request operations
  createPlayRequest(request: InsertPlayRequest & { fromUserId: string }): Promise<PlayRequest>;
  getUserPlayRequests(userId: string): Promise<PlayRequest[]>;
  updatePlayRequestStatus(id: string, status: 'accepted' | 'rejected'): Promise<PlayRequest>;

  // Message operations
  createMessage(message: InsertMessage & { fromUserId: string }): Promise<Message>;
  getConversations(userId: string): Promise<any[]>;
  getMessages(userId: string, otherUserId: string): Promise<any[]>;
  deleteMessage(id: string): Promise<void>;

  // Video story operations
  createVideoStory(story: InsertVideoStory & { userId: string }): Promise<VideoStory>;
  getAllVideoStories(): Promise<any[]>;
  getUserVideoStories(userId: string): Promise<any[]>;
  getVideoStory(id: string): Promise<any | undefined>;
  likeVideoStory(id: string): Promise<VideoStory>;
  deleteVideoStory(id: string): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification & { userId: string }): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  deleteNotification(id: string): Promise<void>;
  markNotificationRead(id: string): Promise<Notification>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(data: {
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    email?: string;
    birthDate?: Date;
    gender?: string;
  }): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        username: data.username,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || null,
        birthDate: data.birthDate || null,
        gender: data.gender || null,
      })
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    // Check if user exists
    if (userData.id) {
      const existing = await this.getUser(userData.id);
      if (existing) {
        // User exists, update only provided fields
        const [user] = await db
          .update(users)
          .set({ ...userData, updatedAt: new Date() })
          .where(eq(users.id, userData.id))
          .returning();
        return user;
      }
    }
    
    // For new users from OAuth, provide defaults for required fields
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        username: userData.firstName && userData.lastName 
          ? `${userData.firstName.toLowerCase()}-${userData.lastName.toLowerCase()}`
          : `user-${Math.random().toString(36).substr(2, 9)}`,
        passwordHash: 'oauth-user',
        role: 'player',
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

  async updateUserRole(id: string, role: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role: role as any, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getAllPlayers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUserOnlineStatus(id: string, isOnline: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isOnline, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    // Delete all user data (cascade delete)
    await db.delete(shopRequests).where(eq(shopRequests.userId, id));
    await db.delete(shopItems).where(eq(shopItems.ownerId, id));
    await db.delete(playRequests).where(or(eq(playRequests.fromUserId, id), eq(playRequests.toUserId, id)));
    await db.delete(messages).where(or(eq(messages.fromUserId, id), eq(messages.toUserId, id)));
    await db.delete(videoStories).where(eq(videoStories.userId, id));
    await db.delete(notifications).where(eq(notifications.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  // Shop operations
  async getAllShopItems(): Promise<ShopItem[]> {
    return await db.select().from(shopItems).orderBy(desc(shopItems.createdAt));
  }

  async getShopItem(id: string): Promise<ShopItem | undefined> {
    const [item] = await db.select().from(shopItems).where(eq(shopItems.id, id));
    return item;
  }

  async createShopItem(item: InsertShopItem & { ownerId: string; id?: string }): Promise<ShopItem> {
    const [shopItem] = await db.insert(shopItems).values(item).returning();
    return shopItem;
  }

  async deleteShopItem(id: string): Promise<void> {
    // Delete all shop requests for this item first (cascade delete)
    await db.delete(shopRequests).where(eq(shopRequests.itemId, id));
    // Then delete the item
    await db.delete(shopItems).where(eq(shopItems.id, id));
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

  async deleteShopRequest(id: string): Promise<void> {
    await db.delete(shopRequests).where(eq(shopRequests.id, id));
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

  async deleteMessage(id: string): Promise<void> {
    await db.delete(messages).where(eq(messages.id, id));
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

  async getUserVideoStories(userId: string): Promise<any[]> {
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
      .where(eq(videoStories.userId, userId))
      .orderBy(desc(videoStories.createdAt));

    return stories;
  }

  async getVideoStory(id: string): Promise<any | undefined> {
    const [story] = await db
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
      .where(eq(videoStories.id, id));

    return story;
  }

  async likeVideoStory(id: string): Promise<VideoStory> {
    const [story] = await db
      .update(videoStories)
      .set({ likes: sql`${videoStories.likes} + 1` })
      .where(eq(videoStories.id, id))
      .returning();
    return story;
  }

  async deleteVideoStory(id: string): Promise<void> {
    await db.delete(videoStories).where(eq(videoStories.id, id));
  }

  // Notification operations
  async createNotification(notification: InsertNotification & { userId: string }): Promise<Notification> {
    const [notif] = await db.insert(notifications).values(notification).returning();
    return notif;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    const notifs = await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
    return notifs;
  }

  async deleteNotification(id: string): Promise<void> {
    await db.delete(notifications).where(eq(notifications.id, id));
  }

  async markNotificationRead(id: string): Promise<Notification> {
    const [notif] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notif;
  }
}

export const storage = new DatabaseStorage();
