import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChefHat,
  Circle,
  Clock,
  Heart,
  ListChecks,
  RotateCcw,
  Share2,
  Sparkles,
  Users,
} from "lucide-react";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

type RecipeCardProps = {
  title: string;
  image?: string;
  cookingTime?: string;
  servings?: string;
  ingredients: string[];
  missingIngredients?: string[];
  instructions?: string[];
  sourceUrl?: string;
  recipeNumber?: number;

  // Called when the user chooses this recipe
  onStartCooking?: () => void;
};

/*
 * Convert instructions into a clean step array.
 *
 * This also provides backward compatibility in case
 * an older recipe somehow sends a single string.
 */
function getSteps(
  instructions?: string[] | string,
): string[] {
  if (!instructions) {
    return [];
  }

  /*
   * New format:
   * string[]
   */
  if (Array.isArray(instructions)) {
    return instructions
      .map((step) =>
        String(step).trim(),
      )
      .filter(Boolean);
  }

  /*
   * Backward compatibility:
   * old format string
   */
  const normalized =
    instructions
      .replace(/\r/g, "")
      .trim();

  if (!normalized) {
    return [];
  }

  const parts = normalized
    .split(
      /\n+|(?=\s*\d+[\.)]\s+)/g,
    )
    .map((part) =>
      part
        .replace(
          /^\s*(?:\d+[\.)]|[-•])\s*/,
          "",
        )
        .trim(),
    )
    .filter(Boolean);

  return parts.length > 0
    ? parts
    : [normalized];
}

  export function RecipeCard({
    title,
    image,
    cookingTime,
    servings,
    ingredients = [],
    missingIngredients = [],
    instructions,
    sourceUrl,
    recipeNumber,
    onStartCooking,
  }: RecipeCardProps) {
  /*
   * Convert Gemini instructions into
   * individual cooking steps.
   */
  const steps = useMemo(
    () => getSteps(instructions),
    [instructions],
  );

  /*
   * Recipe display mode.
   */
  const [mode, setMode] = useState<
    "overview" | "cook"
  >("overview");

  /*
   * Currently selected cooking step.
   */
  const [activeStep, setActiveStep] =
    useState(0);

  /*
   * Completed cooking steps.
   */
  const [completedSteps, setCompletedSteps] =
    useState<number[]>([]);

  /*
   * Pantry checklist.
   */
  const [
    checkedIngredients,
    setCheckedIngredients,
  ] = useState<number[]>([]);

  /*
   * Pantry / cooking preview switch.
   */
  const [
    showIngredients,
    setShowIngredients,
  ] = useState(true);

  /*
   * Favorite state.
   */
  const [isFavorite, setIsFavorite] =
    useState(false);

  /*
   * Share state.
   */
  const [hasShared, setHasShared] =
    useState(false);

  /*
   * Progress calculations.
   */
  const completedCount =
    completedSteps.length;

  const progress = steps.length
    ? Math.round(
        (completedCount /
          steps.length) *
          100,
      )
    : 0;

  const isFinished =
    steps.length > 0 &&
    completedCount ===
      steps.length;

  /*
   * Complete / uncomplete a step.
   */
  const toggleStep = (
    stepIndex: number,
  ) => {
    setCompletedSteps(
      (current) =>
        current.includes(stepIndex)
          ? current.filter(
              (index) =>
                index !== stepIndex,
            )
          : [
              ...current,
              stepIndex,
            ],
    );
  };

  /*
   * Complete current step
   * and move to next step.
   */
  const finishStepAndContinue = () => {
    toggleStep(activeStep);

    if (
      activeStep <
      steps.length - 1
    ) {
      setActiveStep(
        (current) =>
          current + 1,
      );
    }
  };

  /*
   * Reset cooking mode.
   */
  const resetCooking = () => {
    setActiveStep(0);

    setCompletedSteps([]);

    setMode("overview");
  };

  /*
   * Share recipe.
   */
  const shareRecipe = async () => {
    const shareText = [
      title,
      "",
      ...steps.map(
        (step, index) =>
          `Step ${index + 1}: ${step}`,
      ),
    ].join("\n");

    try {
      if (navigator.share) {
        await navigator.share({
          title,
          text: shareText,
        });
      } else if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          shareText,
        );
      }

      setHasShared(true);
    } catch {
      /*
       * User may cancel sharing.
       * Don't interrupt cooking.
       */
    }
  };

  return (
    <article
      className="recipe-card group overflow-hidden rounded-[1.5rem] border border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      data-testid={`recipe-card-${title
        .toLowerCase()
        .replace(
          /\s+/g,
          "-",
        )}`}
    >
      {/* =======================================================
          RECIPE HEADER
      ======================================================= */}

      <div className="relative overflow-hidden bg-gradient-to-br from-primary/20 via-primary/8 to-background px-5 pb-5 pt-6 sm:px-6">
        <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full bg-primary/15 blur-2xl transition-transform duration-500 group-hover:scale-125" />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
              <ChefHat className="h-5 w-5" />
            </div>

            <div>
              {recipeNumber && (
                <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Recipe{" "}
                  {String(
                    recipeNumber,
                  ).padStart(
                    2,
                    "0",
                  )}
                </p>
              )}

              <h3
                className="text-xl font-bold tracking-tight sm:text-2xl"
                data-testid="text-recipe-title"
              >
                {title}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              setIsFavorite(
                (current) =>
                  !current,
              )
            }
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-all ${
              isFavorite
                ? "border-primary/30 bg-primary text-primary-foreground shadow-md shadow-primary/20"
                : "border-border/80 bg-background/70 text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
            aria-label={
              isFavorite
                ? "Remove recipe from favorites"
                : "Save recipe to favorites"
            }
            aria-pressed={
              isFavorite
            }
            data-testid="button-favorite-recipe"
          >
            <Heart
              className={`h-4 w-4 ${
                isFavorite
                  ? "fill-current"
                  : ""
              }`}
            />
          </button>
        </div>

        {image && (
          <div className="relative mt-5 aspect-video overflow-hidden rounded-2xl bg-muted">
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.style.display =
                  "none";
              }}
            />
          </div>
        )}

        {/* =====================================================
            RECIPE INFO
        ===================================================== */}

        <div className="relative mt-5 flex flex-wrap gap-2">
          {cookingTime && (
            <div
              className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground"
              data-testid="text-cooking-time"
            >
              <Clock className="h-4 w-4 text-primary" />

              <span>
                {cookingTime}
              </span>
            </div>
          )}

          {servings && (
            <div
              className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground"
              data-testid="text-servings"
            >
              <Users className="h-4 w-4 text-primary" />

              <span>
                {servings}
              </span>
            </div>
          )}

          {steps.length > 0 && (
            <div className="flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-sm text-muted-foreground">
              <ListChecks className="h-4 w-4 text-primary" />

              <span>
                {steps.length}{" "}
                {steps.length === 1
                  ? "step"
                  : "steps"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =======================================================
          RECIPE BODY
      ======================================================= */}

      <div className="space-y-5 p-5 sm:p-6">
        {mode === "overview" ? (
          <>
            {/* =================================================
                PANTRY / PREVIEW TABS
            ================================================= */}

            <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/45 p-1.5">
              <button
                type="button"
                onClick={() =>
                  setShowIngredients(
                    true,
                  )
                }
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  showIngredients
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={
                  showIngredients
                }
              >
                Pantry checklist
              </button>

              <button
                type="button"
                onClick={() =>
                  setShowIngredients(
                    false,
                  )
                }
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                  !showIngredients
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                aria-pressed={
                  !showIngredients
                }
              >
                Cooking preview
              </button>
            </div>

            {/* =================================================
                PANTRY CHECKLIST
            ================================================= */}

            {showIngredients ? (
              <div className="animate-fade-in">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">
                      Check what you have
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        checkedIngredients.length
                      }
                      /
                      {
                        ingredients.length
                      }{" "}
                      ingredients ready
                    </p>
                  </div>

                  {ingredients.length >
                    0 && (
                    <span className="text-sm font-bold text-primary">
                      {Math.round(
                        (checkedIngredients.length /
                          ingredients.length) *
                          100,
                      )}
                      %
                    </span>
                  )}
                </div>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{
                      width: `${
                        ingredients.length
                          ? (checkedIngredients.length /
                              ingredients.length) *
                            100
                          : 0
                      }%`,
                    }}
                  />
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {ingredients.map(
                    (
                      ingredient,
                      index,
                    ) => {
                      const isChecked =
                        checkedIngredients.includes(
                          index,
                        );

                      return (
                        <button
                          type="button"
                          key={index}
                          onClick={() =>
                            setCheckedIngredients(
                              (
                                current,
                              ) =>
                                isChecked
                                  ? current.filter(
                                      (
                                        item,
                                      ) =>
                                        item !==
                                        index,
                                    )
                                  : [
                                      ...current,
                                      index,
                                    ],
                            )
                          }
                          className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                            isChecked
                              ? "border-primary/30 bg-primary/8 text-muted-foreground"
                              : "border-border/70 bg-background hover:border-primary/40 hover:bg-primary/5"
                          }`}
                          aria-pressed={
                            isChecked
                          }
                        >
                          <span
                            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                              isChecked
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/40"
                            }`}
                          >
                            {isChecked && (
                              <Check className="h-3 w-3" />
                            )}
                          </span>

                          <span
                            className={
                              isChecked
                                ? "line-through"
                                : ""
                            }
                          >
                            {ingredient}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                {missingIngredients.length >
                  0 && (
                  <div className="mt-4 rounded-2xl border border-dashed border-primary/35 bg-primary/5 p-3 text-sm">
                    <p className="font-semibold text-primary">
                      Worth picking up
                    </p>

                    <p className="mt-1 text-muted-foreground">
                      {missingIngredients.join(
                        ", ",
                      )}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* =================================================
                 COOKING PREVIEW
              ================================================= */

              <div className="animate-fade-in">
                <p className="mb-3 font-semibold">
                  A quick look at the method
                </p>

                <div className="space-y-2">
                  {steps
                    .slice(0, 3)
                    .map(
                      (
                        step,
                        index,
                      ) => (
                        <div
                          key={
                            index
                          }
                          className="flex gap-3 rounded-xl border border-border/60 bg-background p-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/12 text-xs font-bold text-primary">
                            {index +
                              1}
                          </span>

                          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
                            {step}
                          </p>
                        </div>
                      ),
                    )}

                  {steps.length >
                    3 && (
                    <p className="pl-10 text-sm font-medium text-primary">
                      +{" "}
                      {steps.length -
                        3}{" "}
                      more steps inside cooking mode
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="flex flex-wrap gap-2">
              {steps.length > 0 && (
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    // Tell Home.tsx that this recipe was selected
                    onStartCooking?.();

                    // Then open cooking mode
                    setMode("cook");
                  }}
                  data-testid="button-start-cooking"
                >
                  <ChefHat className="h-4 w-4" />
                  Use this recipe
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                className="rounded-xl"
                onClick={
                  shareRecipe
                }
                aria-label="Share recipe"
                data-testid="button-share-recipe"
              >
                <Share2 className="h-4 w-4" />

                <span className="hidden sm:inline">
                  {hasShared
                    ? "Copied"
                    : "Share"}
                </span>
              </Button>
            </div>

            {sourceUrl && (
              <Button
                variant="outline"
                className="w-full rounded-xl"
                onClick={() =>
                  window.open(
                    sourceUrl,
                    "_blank",
                  )
                }
                data-testid="button-view-recipe"
              >
                View full recipe
              </Button>
            )}
          </>
        ) : (
          /* =====================================================
             COOKING MODE
          ===================================================== */

          <div className="animate-slide-up space-y-5">
            {/* =================================================
                COOKING HEADER
            ================================================= */}

            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                  Cooking mode
                </p>

                <h4 className="mt-1 text-lg font-bold">
                  {isFinished
                    ? "You made it!"
                    : `Step ${
                        activeStep +
                        1
                      } of ${
                        steps.length
                      }`}
                </h4>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={
                  resetCooking
                }
                className="rounded-xl text-muted-foreground"
              >
                <RotateCcw className="h-4 w-4" />

                Reset
              </Button>
            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-medium text-muted-foreground">
                  {completedCount}{" "}
                  of{" "}
                  {steps.length}{" "}
                  complete
                </span>

                <span className="font-bold text-primary">
                  {progress}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            {/* =================================================
                FINISHED
            ================================================= */}

            {isFinished ? (
              <div className="rounded-3xl border border-primary/25 bg-primary/8 p-7 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                  <ChefHat className="h-7 w-7" />
                </div>

                <h5 className="mt-4 text-xl font-bold">
                  Dinner is ready
                </h5>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                  Nice work. Take a moment to enjoy your{" "}
                  {title.toLowerCase()}.
                </p>

                <Button
                  className="mt-5 rounded-xl"
                  onClick={() =>
                    setMode(
                      "overview",
                    )
                  }
                >
                  Back to recipe
                </Button>
              </div>
            ) : (
              <>
                {/* =============================================
                    CURRENT STEP
                ============================================= */}

                <div className="rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 to-background p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground shadow-md shadow-primary/20">
                      {activeStep +
                        1}
                    </div>

                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                        Do this now
                      </p>

                      <p className="mt-2 text-base leading-7 sm:text-lg">
                        {
                          steps[
                            activeStep
                          ]
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* =============================================
                    COOKING ROADMAP
                ============================================= */}

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-muted-foreground">
                    Your cooking roadmap
                  </p>

                  {steps.map(
                    (
                      step,
                      index,
                    ) => {
                      const complete =
                        completedSteps.includes(
                          index,
                        );

                      const active =
                        index ===
                        activeStep;

                      return (
                        <button
                          type="button"
                          key={
                            index
                          }
                          onClick={() =>
                            setActiveStep(
                              index,
                            )
                          }
                          className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${
                            active
                              ? "border-primary/40 bg-primary/8 shadow-sm"
                              : "border-border/60 bg-background hover:border-primary/30 hover:bg-primary/5"
                          }`}
                        >
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                              complete
                                ? "bg-primary text-primary-foreground"
                                : active
                                  ? "bg-primary/15 text-primary"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {complete ? (
                              <Check className="h-4 w-4" />
                            ) : active ? (
                              <Circle className="h-3 w-3 fill-current" />
                            ) : (
                              index +
                              1
                            )}
                          </span>

                          <span
                            className={`line-clamp-2 text-sm ${
                              complete
                                ? "text-muted-foreground line-through"
                                : ""
                            }`}
                          >
                            Step{" "}
                            {index +
                              1}
                            :{" "}
                            {step}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>

                {/* =============================================
                    NAVIGATION
                ============================================= */}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() =>
                      setActiveStep(
                        (
                          current,
                        ) =>
                          Math.max(
                            0,
                            current -
                              1,
                          ),
                      )
                    }
                    disabled={
                      activeStep ===
                      0
                    }
                    aria-label="Previous step"
                  >
                    <ArrowLeft className="h-4 w-4" />

                    <span className="hidden sm:inline">
                      Back
                    </span>
                  </Button>

                  <Button
                    className="flex-1 rounded-xl"
                    onClick={
                      finishStepAndContinue
                    }
                    data-testid="button-next-step"
                  >
                    {activeStep ===
                    steps.length -
                      1
                      ? "Mark recipe complete"
                      : "Mark complete & continue"}

                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}