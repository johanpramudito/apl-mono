import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ReactNode } from "react";

export default function ThreadLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <ChatSidebar />
        <SidebarInset>{children}</SidebarInset>
      </div>
    </SidebarProvider>
  );
}
