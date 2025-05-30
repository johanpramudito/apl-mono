/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Moon, Plus, Sun } from "lucide-react";
import { useLayoutEffect, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar as SidebarPrimitive,
} from "@/components/ui/sidebar";
import { useTheme } from "./ThemeProvider";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export const ChatSidebar = () => {
  const [activeThread, setActiveThread] = useState("");
  const [dialogIsOpen, setDialogIsOpen] = useState(false);
  const [textInput, setTextInput] = useState("");

  const { setTheme, theme } = useTheme();
  const router = useRouter();
  const pathname = usePathname();

  const [threads, setThreads] = useState<any[]>([]);

  useEffect(() => {
    async function fetchThreads() {
      try {
        const res = await fetch("/api/thread");
        const data = await res.json();
        setThreads(data.threads || []);
      } catch (error) {
        console.error("Failed to fetch threads:", error);
      }
    }

    fetchThreads();
  }, []);

  const handleToggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const handleCreateThread = async () => {
    const res = await fetch("/api/thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: textInput }),
    });
    const data = await res.json();
    const threadId = data.thread.id_session; // <-- gunakan id_session

    setDialogIsOpen(false);
    setTextInput("");

    router.push(`/thread/${threadId}`);
  };

  useLayoutEffect(() => {
    setActiveThread(pathname.split("/")[2]);
  }, [pathname]);

  const handleLogout = async () => {
    console.log("Logging out...");
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new chat</DialogTitle>
          </DialogHeader>

          <div className="space-y-1">
            <Label htmlFor="chat-title">Chat Title</Label>
            <Input
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              id="chat-title"
              placeholder="Your new chat title"
            />
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDialogIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateThread}>Create Chat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <SidebarPrimitive className="w-64 border-r h-screen flex-shrink-0 flex flex-col bg-background">
        <SidebarHeader>
          <Button
            onClick={() => setDialogIsOpen(true)}
            className="w-full justify-start"
            variant="ghost"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarGroupLabel>Recent Chats</SidebarGroupLabel>
              <SidebarMenu>
                {threads?.map((thread) => (
                  <SidebarMenuItem key={thread.id_session}>
                    <Link href={`/thread/${thread.id_session}`}>
                      <SidebarMenuButton
                        isActive={thread.id_session === activeThread}
                      >
                        {thread.judul}
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <Button
            onClick={handleToggleTheme}
            variant="ghost"
            className="w-full justify-start"
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />{" "}
            Toggle Theme
          </Button>

          <Button
            onClick={handleLogout}
            className="text-white px-6 py-3 text-lg bg-red-600 hover:bg-red-700 transition-colors rounded-md w-full"
          >
            Logout
          </Button>
        </SidebarFooter>
      </SidebarPrimitive>
    </>
  );
};
