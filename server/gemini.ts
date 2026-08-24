import "dotenv/config";

import type { Recipe } from "@shared/schema";
import { recipeSchema } from "@shared/schema";
import { z } from "zod";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/interactions";

/*
 * Gemini response schema
 *
 * message has a default because Gemini can occasionally
 * forget to return it even when the recipes are valid.
 */
const geminiResponseSchema = z.object({
  valid: z.boolean(),

  message: z
    .string()
    .default("I found some recipes for you."),

  recipes: z.array(recipeSchema),
});

export type GenerateRecipesResult = {
  valid: boolean;
  message: string;
  recipes: Recipe[];
};

export async function generateRecipes(
  ingredients: string,
): Promise<GenerateRecipesResult> {
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
You are the validation and recipe engine for an application called Leftover Chef.

USER INPUT:
"${ingredients}"

Your job has TWO stages.

==================================================
STAGE 1 — VALIDATE THE USER INPUT
==================================================

Determine whether the user's input is actually related to food ingredients,
cooking, recipes, meals, or something a person could cook.

INVALID examples:

"hii"
"hi"
"hello"
"hey"
"test"
"asdf"
"xyz"
"omkar"
"what is your name"
"how are you"
"good morning"
"random text"

These are NOT food ingredients.

VALID examples:

"potato"
"potato onion"
"potato, onion, tomato"
"I have potato and onion"
"I have rice and vegetables"
"what can I make with potato and onion?"
"give me something using paneer"
"chicken rice"
"bread butter"

Common spelling mistakes should be understood.

If the input is INVALID, return EXACTLY this structure:

{
  "valid": false,
  "message": "That doesn't look like a food ingredient or cooking request. Please enter ingredients such as potato, onion, tomato, rice, paneer, or chicken.",
  "recipes": []
}

DO NOT generate recipes for invalid input.

==================================================
STAGE 2 — GENERATE RECIPES
==================================================

If the input is VALID:

Generate 2 practical recipes using primarily the ingredients provided by the user.

Return:

{
  "valid": true,
  "message": "I found some recipes you can make with your ingredients.",
  "recipes": [
    {
      "title": "Recipe Name",
      "cookingTime": "25 min",
      "servings": "2 servings",
      "ingredients": [
        "2 potatoes",
        "1 onion",
        "1 tablespoon oil"
      ],
      "instructions": [
        "Wash and peel the potatoes.",
        "Cut the potatoes into small pieces.",
        "Slice the onion.",
        "Heat oil in a pan over medium heat.",
        "Add the onion and cook until soft.",
        "Add the potatoes and cook until tender and golden."
      ],
      "missingIngredients": [
        "salt",
        "black pepper"
      ]
    }
  ]
}

==================================================
VERY IMPORTANT OUTPUT RULES
==================================================

1. Return ONLY valid JSON.

2. NEVER use Markdown.

3. NEVER wrap JSON inside \`\`\`json.

4. "valid" MUST be either true or false.

5. "message" MUST always be a string.

6. "recipes" MUST always be an array.

7. If invalid:
   - valid = false
   - recipes = []
   - DO NOT generate recipes.

8. If valid:
   - valid = true
   - generate 2 recipes.

9. "ingredients" MUST ALWAYS be an array of strings.

10. "instructions" MUST ALWAYS be an array of separate strings.

11. Each instruction array item represents ONE cooking step.

12. Do NOT combine all cooking instructions into one string.

13. Do NOT write:
   "Step 1: ... Step 2: ... Step 3: ..."

14. Instead write:
   [
     "Wash the potatoes.",
     "Cut the potatoes.",
     "Heat oil in a pan."
   ]

15. The application will automatically add "Step 1", "Step 2", etc.

16. Generate between 3 and 8 cooking steps per recipe.

17. "missingIngredients" MUST be an array.

18. Do not invent the user's main ingredients.

19. You may add common pantry ingredients such as:
   oil, salt, pepper, water, spices.

20. If the user asks a cooking-related question using ingredients,
   treat it as valid.

21. If the user only says a greeting or random text,
   treat it as invalid.

Return ONLY JSON.
`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY,
      },

      body: JSON.stringify({
        model: "gemini-3.5-flash",
        input: prompt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();

      console.error("Gemini API error:", error);

      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();

    /*
     * Interactions API returns model output
     * inside steps.
     */
    const modelOutputs =
      data.steps?.filter(
        (step: any) => step.type === "model_output",
      ) ?? [];

    const textParts = modelOutputs.flatMap(
      (step: any) =>
        (step.content ?? []).filter(
          (content: any) => content.type === "text",
        ),
    );

    const text = textParts
      .map((content: any) => content.text)
      .join("");

    if (!text) {
      throw new Error("No response from Gemini API");
    }

    console.log("Gemini raw response:", text);

    /*
     * Remove accidental Markdown code fences.
     */
    const cleanedText = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    let parsed: unknown;

    try {
      parsed = JSON.parse(cleanedText);
    } catch (error) {
      console.error("Gemini returned invalid JSON:", cleanedText);

      throw new Error("Invalid JSON returned from Gemini");
    }

    /*
     * Validate Gemini response.
     */
    const validated = geminiResponseSchema.parse(parsed);

    /*
     * Extra safety:
     * If Gemini says invalid, never return recipes.
     */
    if (!validated.valid) {
      return {
        valid: false,
        message:
          validated.message ||
          "Please enter some food ingredients, for example: potato, onion, tomato, rice, paneer.",
        recipes: [],
      };
    }

    /*
     * Valid recipe response.
     */
    return {
      valid: true,
      message:
        validated.message ||
        "I found some recipes you can make with your ingredients.",
      recipes: validated.recipes,
    };
  } catch (error) {
    console.error("Error generating recipes:", error);

    if (error instanceof z.ZodError) {
      console.error("Invalid Gemini response:", error.issues);

      throw new Error("Invalid recipe format from AI");
    }

    throw error;
  }
}