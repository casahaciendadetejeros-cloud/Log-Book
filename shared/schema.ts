import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const visitors = pgTable("visitors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  controlNumber: text("control_number").notNull().unique(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone"),
  email: text("email"),
  purpose: text("purpose").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom schema for insert that requires either phone or email
export const insertVisitorSchema = z.object({
  name: z.string().min(1, "Name is required"),
  gender: z.enum(["male", "female", "prefer_not_to_say"], {
    required_error: "Please select your gender",
  }),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().refine((val) => val === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
    message: "Invalid email format"
  }).optional(),
  purpose: z.string().min(1, "Purpose of visit is required"),
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
