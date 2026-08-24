import { Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ChatInputProps = {
  onSend: (message: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
    }
  };

  return (
    <div className="sticky bottom-0 z-40 border-t border-border/80 bg-background/90 p-3 backdrop-blur-xl sm:p-4">
      <form onSubmit={handleSubmit} className="mx-auto flex max-w-5xl gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your ingredients (e.g., chicken, tomatoes, rice)..."
          className="flex-1 rounded-2xl border-2 border-border bg-card px-5 py-3.5 text-base shadow-sm transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15"
          disabled={disabled}
          data-testid="input-ingredients"
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 rounded-full"
          disabled={!input.trim() || disabled}
          data-testid="button-send"
        >
          {disabled ? <Sparkles className="h-5 w-5 animate-pulse" /> : <Send className="h-5 w-5" />}
        </Button>
      </form>
      <p className="mx-auto mt-2 hidden max-w-5xl items-center justify-center gap-1 text-center text-xs text-muted-foreground sm:flex">
        <Sparkles className="h-3 w-3 text-primary" />
        Add ingredients separated by commas for the best suggestions
      </p>
    </div>
  );
}
