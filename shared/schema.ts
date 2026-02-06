import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

// Students table for document generation
export const students = pgTable("students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // e.g., "Junior Tech", "Intern"
  type: text("type").notNull(), // "Student" or "Intern"
  placementStart: timestamp("placement_start"),
  placementEnd: timestamp("placement_end"),
  supervisor: text("supervisor"),
  department: text("department"),
  skills: text("skills"), // JSON string of skills mastered
  status: text("status").notNull().default('Active'), // Active, Completed, Alumni
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true,
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;

// Documents table
export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  type: text("type").notNull(), // "Certificate", "Placement Letter", "Compliance", "Custom"
  studentId: varchar("student_id").references(() => students.id, { onDelete: 'cascade' }),
  studentName: text("student_name"), // Denormalized for easy access
  content: text("content"), // Base64 encoded PDF or file content
  metadata: text("metadata"), // JSON string for additional info
  generatedDate: timestamp("generated_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  generatedDate: true,
  createdAt: true,
});

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;
