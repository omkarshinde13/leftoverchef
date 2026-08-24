import type { Express } from "express";
import { createServer, type Server } from "http";
import { recipeRequestSchema } from "@shared/schema";
import { generateRecipes } from "./gemini";

export async function registerRoutes(
  app: Express,
): Promise<Server> {
  app.post("/api/recipes", async (req, res) => {
    try {
      /*
       * Validate request body.
       */
      const validationResult = recipeRequestSchema.safeParse(
        req.body,
      );

      if (!validationResult.success) {
        return res.status(400).json({
          valid: false,
          recipes: [],
          message:
            validationResult.error.issues
              .map((issue) => issue.message)
              .join(", "),
        });
      }

      const { ingredients } = validationResult.data;

      /*
       * Ask Gemini to validate the input and,
       * if valid, generate recipes.
       */
      const result = await generateRecipes(ingredients);

      /*
       * IMPORTANT:
       *
       * We return Gemini's valid/message/recipes directly.
       *
       * This prevents:
       *
       * "Great! I found 0 recipes..."
       *
       * for invalid inputs.
       */
      return res.json({
        valid: result.valid,
        message: result.message,
        recipes: result.recipes,
      });
    } catch (error) {
      console.error("Error in /api/recipes:", error);

      if (error instanceof Error) {
        if (
          error.message.includes(
            "GEMINI_API_KEY is not configured",
          )
        ) {
          return res.status(500).json({
            valid: false,
            recipes: [],
            message:
              "Gemini API key is not configured on the server.",
          });
        }

        if (
          error.message.includes(
            "Invalid recipe format",
          ) ||
          error.message.includes(
            "Invalid JSON returned from Gemini",
          )
        ) {
          return res.status(502).json({
            valid: false,
            recipes: [],
            message:
              "The AI returned an invalid recipe format. Please try again.",
          });
        }

        return res.status(500).json({
          valid: false,
          recipes: [],
          message:
            "Sorry, I couldn't generate recipes right now. Please try again.",
          details: error.message,
        });
      }

      return res.status(500).json({
        valid: false,
        recipes: [],
        message:
          "Sorry, I couldn't generate recipes right now. Please try again.",
      });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}