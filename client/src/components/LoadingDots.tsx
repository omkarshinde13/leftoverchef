export function LoadingDots() {
  return (
    <div className="flex items-center space-x-1" data-testid="loading-dots">
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "0ms" }} />
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "150ms" }} />
      <div className="h-2 w-2 animate-pulse rounded-full bg-primary" style={{ animationDelay: "300ms" }} />
    </div>
  );
}
