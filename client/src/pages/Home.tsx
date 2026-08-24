import { useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { WelcomeScreen } from "@/components/WelcomeScreen";
import { MessageBubble } from "@/components/MessageBubble";
import { RecipeCard } from "@/components/RecipeCard";
import { ChatInput } from "@/components/ChatInput";
import { apiRequest } from "@/lib/queryClient";
import type { RecipeResponse } from "@shared/schema";
import {
  ChefHat,
  Sparkles,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

type Message = {
  id: string;
  type: "user" | "bot";
  content: string;
  recipes?: Recipe[];
  isLoading?: boolean;
};

type Recipe = {
  title: string;
  image?: string;
  cookingTime?: string;
  servings?: string;
  ingredients: string[];
  instructions?: string;
  missingIngredients?: string[];
  sourceUrl?: string;
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Currently selected recipe
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  // Keep the last ingredients so we can suggest more recipes
  const [lastIngredients, setLastIngredients] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (
    ingredients: string,
    suggestMore = false
  ) => {
    setSelectedRecipe(null);

    if (!suggestMore) {
      setLastIngredients(ingredients);
    }

    const userMessage: Message = {
      id: `${Date.now()}-user`,
      type: "user",
      content: ingredients,
    };

    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      type: "bot",
      content: suggestMore
        ? "Finding more delicious recipes..."
        : "Finding delicious recipes...",
      isLoading: true,
    };

    setMessages((prev) => {
      if (suggestMore) {
        return [...prev, userMessage, loadingMessage];
      }

      return [...prev, userMessage, loadingMessage];
    });

    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/recipes", {
        ingredients,
      });

      const data: RecipeResponse = await response.json();

      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading);

        const botMessage: Message = {
          id: `${Date.now()}-bot`,
          type: "bot",
          content: data.message,
          recipes: data.recipes,
        };

        return [...withoutLoading, botMessage];
      });
    } catch (error) {
      console.error("Error fetching recipes:", error);

      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading);

        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          type: "bot",
          content:
            "Sorry, I couldn't generate recipes right now. Please try again!",
        };

        return [...withoutLoading, errorMessage];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestMore = async () => {
    if (!lastIngredients || isLoading) {
      return;
    }

    await handleSendMessage(lastIngredients, true);
  };

  const handleSelectRecipe = (recipeId: string) => {
    /*
     * Only one recipe can be active at a time.
     *
     * Once selected, all other recipes are hidden.
     */
    setSelectedRecipe(recipeId);
  };

  const handleBackToRecipes = () => {
    setSelectedRecipe(null);
  };

  const showWelcome = messages.length === 0;

  return (
    <div className="flex h-screen flex-col bg-background">
      <Header />

      <div className="flex-1 overflow-y-auto">
        {showWelcome ? (
          <WelcomeScreen onSelect={handleSendMessage} />
        ) : (
          <div className="mx-auto max-w-6xl space-y-6 p-4 pb-8 sm:p-6">

            {messages.map((message) => {
              /*
               * IMPORTANT:
               *
               * If a recipe is selected, don't show recipe lists
               * belonging to other messages.
               */
              const hasRecipes =
                message.recipes && message.recipes.length > 0;

              return (
                <div key={message.id} className="animate-slide-up">

                  <MessageBubble
                    type={message.type}
                    content={message.content}
                    isLoading={message.isLoading}
                  />

                  {hasRecipes && (
                    <div className="mt-6">

                      {/* -------------------------------- */}
                      {/* RECIPE HEADER */}
                      {/* -------------------------------- */}

                      <div className="mb-5 flex items-end justify-between gap-4">
                        <div>

                          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
                            <Sparkles className="h-4 w-4" />

                            {selectedRecipe
                              ? "Your selected recipe"
                              : "Your recipe shortlist"}
                          </div>

                          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            {selectedRecipe
                              ? "Let's start cooking"
                              : "Pick your next delicious move"}
                          </h2>

                          <p className="mt-1 text-sm text-muted-foreground">
                            {selectedRecipe
                              ? "Follow the guided steps at your own pace."
                              : "Check your ingredients, then choose a recipe."}
                          </p>

                        </div>

                        <div className="hidden shrink-0 rounded-2xl border border-primary/20 bg-primary/8 p-3 text-primary sm:block">
                          <ChefHat className="h-6 w-6" />
                        </div>
                      </div>

                      {/* -------------------------------- */}
                      {/* SELECTED RECIPE CONTROLS */}
                      {/* -------------------------------- */}

                      {selectedRecipe && (
                        <div className="mb-5 flex flex-wrap gap-3">

                          <button
                            type="button"
                            onClick={handleBackToRecipes}
                            className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold transition hover:bg-muted"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            Back to recipe choices
                          </button>

                          <button
                            type="button"
                            onClick={handleSuggestMore}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${
                                isLoading ? "animate-spin" : ""
                              }`}
                            />

                            {isLoading
                              ? "Finding more..."
                              : "Suggest More Recipes"}
                          </button>

                        </div>
                      )}

                      {/* -------------------------------- */}
                      {/* RECIPE CARDS */}
                      {/* -------------------------------- */}

                      <div
                        className={
                          selectedRecipe
                            ? "grid gap-5"
                            : "grid gap-5 lg:grid-cols-2"
                        }
                      >
                        {message.recipes!.map((recipe, index) => {
                          const recipeId = `${message.id}-${index}`;

                          /*
                           * THIS IS THE IMPORTANT FIX.
                           *
                           * When a recipe is selected, ONLY that
                           * exact recipe is rendered.
                           */
                          if (
                            selectedRecipe &&
                            selectedRecipe !== recipeId
                          ) {
                            return null;
                          }

                          return (
                            <div
                              key={recipeId}
                              className="recipe-reveal"
                              style={{
                                animationDelay: `${index * 100}ms`,
                              }}
                            >
                              <RecipeCard
                                recipeNumber={index + 1}
                                {...recipe}
                                onStartCooking={() =>
                                  handleSelectRecipe(recipeId)
                                }
                              />
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* -------------------------------- */}
      {/* CHAT INPUT */}
      {/* -------------------------------- */}

      <ChatInput
        onSend={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
}