import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
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

/*
 * Recipe request
 */
export const recipeRequestSchema = z.object({
  ingredients: z
    .string()
    .trim()
    .min(1, "Please enter at least one ingredient"),
});

export type RecipeRequest = z.infer<typeof recipeRequestSchema>;

/*
 * Recipe
 *
 * IMPORTANT:
 * instructions is an ARRAY.
 *
 * Example:
 *
 * instructions: [
 *   "Wash and chop the potatoes.",
 *   "Heat oil in a pan.",
 *   "Add potatoes and cook until golden."
 * ]
 */
export const recipeSchema = z.object({
  title: z.string(),

  cookingTime: z.string().optional(),

  servings: z.string().optional(),

  ingredients: z.array(z.string()),

  instructions: z.array(z.string()).min(1),

  missingIngredients: z.array(z.string()).optional(),
});

/*
 * API response sent from Express to React
 */
export const recipeResponseSchema = z.object({
  valid: z.boolean(),

  message: z.string(),

  recipes: z.array(recipeSchema),
});

export type Recipe = z.infer<typeof recipeSchema>;

export type RecipeResponse = z.infer<typeof recipeResponseSchema>;