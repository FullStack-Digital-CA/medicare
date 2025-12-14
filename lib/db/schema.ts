import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const roleEnum = pgEnum('role', ['developer', 'admin', 'doctor', 'nurse', 'frontdesk']);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: roleEnum("role").notNull().default('frontdesk'),
  isActive: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isActive: true,
});

// Service Categories table
export const serviceCategories = pgTable("service_categories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  icon: text("icon"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Services table - matches actual database structure
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug"),
  description: text("description"),
  shortDescription: text("short_description"),
  price: doublePrecision("price").notNull(),
  duration: integer("duration").notNull(),
  categoryId: integer("category_id").notNull(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertServiceSchema = createInsertSchema(services).pick({
  name: true,
  description: true,
  price: true,
  duration: true,
  categoryId: true,
  isActive: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;

// Form validation schemas
export const categoryFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().nullable(),
  icon: z.string().max(50, "Icon must be less than 50 characters").optional().nullable(),
  isActive: z.boolean(),
  displayOrder: z.number().int().min(0, "Display order must be positive"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const serviceFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional().nullable(),
  price: z.number().min(0, "Price must be positive"),
  duration: z.number().int().min(1, "Duration must be at least 1 minute"),
  categoryId: z.number().int().min(1, "Category is required"),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.infer<typeof serviceFormSchema>;
