"use client";

export default function EmptyThreadPage() {
  return (
    <div className="flex flex-1 items-center justify-center text-muted-foreground">
      <div className="text-center px-4">
        <h2 className="text-2xl font-semibold mb-2">
          No conversation selected
        </h2>
        <p className="text-sm">
          Select a thread from the sidebar or create a new one to start
          chatting.
        </p>
      </div>
    </div>
  );
}
