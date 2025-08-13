import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  controlNumber: text("control_number").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom schema for insert that requires either phone or email
export const insertVisitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  purpose: z.string().min(1, "Purpose of visit is required"),
}).refine((data) => data.phone || data.email, {
  message: "Either phone number or email address is required",
  path: ["phone"], // This will show the error on the phone field
});

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
