import { LoadingDots } from "./LoadingDots";

type MessageBubbleProps = {
  type: "user" | "bot";
  content: string;
  isLoading?: boolean;
};

export function MessageBubble({ type, content, isLoading = false }: MessageBubbleProps) {
  if (type === "user") {
    return (
      <div className="ml-auto max-w-md" data-testid="message-user">
        <div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-primary-foreground">
          <p className="text-base font-medium">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mr-auto max-w-2xl" data-testid="message-bot">
      <div className="rounded-2xl rounded-tl-sm border border-border bg-card px-4 py-3">
        {isLoading ? (
          <LoadingDots />
        ) : (
          <p className="text-base">{content}</p>
        )}
      </div>
    </div>
  );
}
