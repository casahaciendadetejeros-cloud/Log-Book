import { type User, type InsertUser, type Visitor, type InsertVisitor } from "@shared/schema";
import { randomUUID } from "crypto";

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
    return Array.from(this.visitors.values()).filter((visitor) =>
      visitor.name.toLowerCase().includes(lowercaseQuery) ||
      visitor.email.toLowerCase().includes(lowercaseQuery) ||
      visitor.phone.includes(query) ||
      visitor.controlNumber.toLowerCase().includes(lowercaseQuery)
    );
  }
}

export const storage = new MemStorage();
