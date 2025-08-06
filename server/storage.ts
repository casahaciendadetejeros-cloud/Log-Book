import { type User, type InsertUser, type Visitor, type InsertVisitor } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./firebase";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Visitor methods
  getVisitor(id: string): Promise<Visitor | undefined>;
  getAllVisitors(): Promise<Visitor[]>;
  getVisitorsByDate(date: string): Promise<Visitor[]>;
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor | undefined>;
  deleteVisitor(id: string): Promise<boolean>;
  searchVisitors(query: string): Promise<Visitor[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private visitors: Map<string, Visitor>;
  private controlNumberCounter: number = 1;

  constructor() {
    this.users = new Map();
    this.visitors = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    return this.visitors.get(id);
  }

  async getAllVisitors(): Promise<Visitor[]> {
    return Array.from(this.visitors.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getVisitorsByDate(date: string): Promise<Visitor[]> {
    const targetDate = new Date(date);
    return Array.from(this.visitors.values()).filter((visitor) => {
      const visitorDate = new Date(visitor.createdAt);
      return visitorDate.toDateString() === targetDate.toDateString();
    });
  }

  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    const id = randomUUID();
    const year = new Date().getFullYear();
    const controlNumber = `#TL-${year}-${this.controlNumberCounter.toString().padStart(3, '0')}`;
    this.controlNumberCounter++;

    const visitor: Visitor = {
      ...insertVisitor,
      id,
      controlNumber,
      createdAt: new Date(),
    };

    this.visitors.set(id, visitor);
    return visitor;
  }

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor | undefined> {
    const visitor = this.visitors.get(id);
    if (!visitor) return undefined;

    const updatedVisitor = { ...visitor, ...updates };
    this.visitors.set(id, updatedVisitor);
    return updatedVisitor;
  }

  async deleteVisitor(id: string): Promise<boolean> {
    return this.visitors.delete(id);
  }

  async searchVisitors(query: string): Promise<Visitor[]> {
    const lowercaseQuery = query.toLowerCase();
    // Remove spaces and special characters for phone number search
    const cleanQuery = query.replace(/[\s\-\(\)\+]/g, '');
    
    return Array.from(this.visitors.values()).filter((visitor) =>
      visitor.name.toLowerCase().includes(lowercaseQuery) ||
      visitor.email.toLowerCase().includes(lowercaseQuery) ||
      visitor.phone.replace(/[\s\-\(\)\+]/g, '').includes(cleanQuery) ||
      visitor.controlNumber.toLowerCase().includes(lowercaseQuery)
    );
  }
}

// Firestore Storage Implementation
export class FirestoreStorage implements IStorage {
  private visitorsCollection = db.collection('visitors');
  private usersCollection = db.collection('users');

  async getUser(id: string): Promise<User | undefined> {
    try {
      const doc = await this.usersCollection.doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } as User : undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const query = await this.usersCollection.where('username', '==', username).limit(1).get();
      if (query.empty) return undefined;
      const doc = query.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const docRef = await this.usersCollection.add(user);
      return { id: docRef.id, ...user };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    try {
      const doc = await this.visitorsCollection.doc(id).get();
      if (!doc.exists) return undefined;
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as Visitor;
    } catch (error) {
      console.error('Error getting visitor:', error);
      return undefined;
    }
  }

  async getAllVisitors(): Promise<Visitor[]> {
    try {
      const snapshot = await this.visitorsCollection.orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Visitor;
      });
    } catch (error) {
      console.error('Error getting all visitors:', error);
      return [];
    }
  }

  async getVisitorsByDate(date: string): Promise<Visitor[]> {
    try {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

      const snapshot = await this.visitorsCollection
        .where('createdAt', '>=', startOfDay)
        .where('createdAt', '<=', endOfDay)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Visitor;
      });
    } catch (error) {
      console.error('Error getting visitors by date:', error);
      return [];
    }
  }

  async createVisitor(insertVisitor: InsertVisitor): Promise<Visitor> {
    try {
      // Generate control number
      const year = new Date().getFullYear();
      const countSnapshot = await this.visitorsCollection.count().get();
      const controlNumber = `#TL-${year}-${(countSnapshot.data().count + 1).toString().padStart(3, '0')}`;

      const visitorData = {
        ...insertVisitor,
        controlNumber,
        createdAt: new Date(),
      };

      const docRef = await this.visitorsCollection.add(visitorData);
      return { id: docRef.id, ...visitorData };
    } catch (error) {
      console.error('Error creating visitor:', error);
      throw error;
    }
  }

  async updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor | undefined> {
    try {
      const docRef = this.visitorsCollection.doc(id);
      await docRef.update(updates);
      const doc = await docRef.get();
      if (!doc.exists) return undefined;
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as Visitor;
    } catch (error) {
      console.error('Error updating visitor:', error);
      return undefined;
    }
  }

  async deleteVisitor(id: string): Promise<boolean> {
    try {
      await this.visitorsCollection.doc(id).delete();
      return true;
    } catch (error) {
      console.error('Error deleting visitor:', error);
      return false;
    }
  }

  async searchVisitors(query: string): Promise<Visitor[]> {
    try {
      // Firestore doesn't support full-text search, so we'll get all visitors and filter client-side
      // In production, you might want to use Algolia or implement a more sophisticated search
      const allVisitors = await this.getAllVisitors();
      const lowercaseQuery = query.toLowerCase();
      const cleanQuery = query.replace(/[\s\-\(\)\+]/g, '');
      
      return allVisitors.filter((visitor) =>
        visitor.name.toLowerCase().includes(lowercaseQuery) ||
        visitor.email.toLowerCase().includes(lowercaseQuery) ||
        visitor.phone.replace(/[\s\-\(\)\+]/g, '').includes(cleanQuery) ||
        visitor.controlNumber.toLowerCase().includes(lowercaseQuery)
      );
    } catch (error) {
      console.error('Error searching visitors:', error);
      return [];
    }
  }
}

// Use Firestore storage by default, fallback to memory storage if Firebase is not available
let storage: IStorage;
try {
  storage = new FirestoreStorage();
} catch (error) {
  console.warn('Firebase not available, using memory storage:', error);
  storage = new MemStorage();
}

export { storage };
