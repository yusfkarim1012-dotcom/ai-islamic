import { useState, useEffect } from "react";
import { Conversation } from "@/components/ChatSidebar";

const STORAGE_KEY = "ai-chat-conversations";

export const useConversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Conversation[];
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveId(parsed[0].id);
        }
      } catch (e) {
        console.error("Failed to parse conversations", e);
      }
    }
  }, []);

  // Save to localStorage whenever conversations change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const activeConversation = conversations.find((c) => c.id === activeId);

  const createNew = (): string => {
    const newConv: Conversation = {
      id: Date.now().toString(),
      title: "گفتوگۆی نوێ",
      messages: [],
      createdAt: Date.now(),
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    return newConv.id;
  };

  const updateMessages = (
    messages: Conversation["messages"],
    targetId?: string
  ) => {
    const id = targetId || activeId;
    if (!id) return;
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          // Auto-update title from first user message if still default
          let title = c.title;
          if (title === "گفتوگۆی نوێ" && messages.length > 0) {
            const firstUser = messages.find((m) => m.role === "user");
            if (firstUser) {
              // Take only the first 3 words
              const words = firstUser.content.trim().split(/\s+/).slice(0, 3);
              title = words.join(" ") + (firstUser.content.trim().split(/\s+/).length > 3 ? "..." : "");
            }
          }
          return { ...c, messages, title };
        }
        return c;
      })
    );
  };

  const rename = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    );
  };

  const remove = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
  };

  return {
    conversations,
    activeId,
    activeConversation,
    createNew,
    updateMessages,
    rename,
    remove,
    selectConversation,
  };
};
