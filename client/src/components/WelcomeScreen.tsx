import { ArrowRight, ChefHat, Sparkles } from "lucide-react";

type WelcomeScreenProps = {
  onSelect: (ingredients: string) => void;
};

export function WelcomeScreen({ onSelect }: WelcomeScreenProps) {
  const exampleIngredients = [
    "chicken, rice, tomatoes",
    "pasta, cheese, garlic",
    "eggs, bread, milk",
    "potatoes, onions, carrots",
  ];

  return (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative mb-7 flex h-20 w-20 animate-float items-center justify-center rounded-[1.75rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/25">
        <ChefHat className="h-10 w-10" aria-hidden="true" />
      </div>
      <div className="text-center space-y-2">
        <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-primary">
          <Sparkles className="h-4 w-4" />
          Pantry to plate
        </div>
        <h2 className="text-2xl font-bold sm:text-3xl" data-testid="text-welcome-title">
          What's in your kitchen?
        </h2>
        <p className="text-base text-muted-foreground sm:text-lg max-w-md" data-testid="text-welcome-subtitle">
          Tell me what you have, and I'll turn leftovers into your next favorite meal.
        </p>
      </div>
      <div className="mt-8 w-full max-w-xl">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">Try a starting point</p>
        <div className="flex flex-wrap justify-center gap-2">
        {exampleIngredients.map((ingredients, index) => (
          <button
            key={index}
            className="group flex items-center gap-2 rounded-full border border-border/80 bg-card px-4 py-2.5 text-sm shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md"
            onClick={() => onSelect(ingredients)}
            data-testid={`button-example-${index}`}
          >
            {ingredients}
            <ArrowRight className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
          </button>
        ))}
        </div>
      </div>
    </div>
  );
}
