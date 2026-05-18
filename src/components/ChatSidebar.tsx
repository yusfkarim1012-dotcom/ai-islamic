import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { MessageSquare, Plus, Pencil, Trash2, History } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export interface Conversation {
  id: string;
  title: string;
  messages: Array<{ id: string; role: "user" | "assistant"; content: string }>;
  createdAt: number;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onRename: (id: string, newTitle: string) => void;
  onDelete: (id: string) => void;
}

export const ChatSidebar = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onRename,
  onDelete,
}: ChatSidebarProps) => {
  const { t } = useLanguage();
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleRenameOpen = (conv: Conversation) => {
    setRenameId(conv.id);
    setRenameValue(conv.title);
  };

  const handleRenameConfirm = () => {
    if (renameId && renameValue.trim()) {
      onRename(renameId, renameValue.trim());
    }
    setRenameId(null);
    setRenameValue("");
  };

  const handleDeleteConfirm = () => {
    if (deleteId) {
      onDelete(deleteId);
    }
    setDeleteId(null);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <History className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>{t.history}</SheetTitle>
          </SheetHeader>

          <div className="p-3">
            <Button onClick={onNew} className="w-full gap-2">
              <Plus className="h-4 w-4" />
              {t.newChat}
            </Button>
          </div>

          <ScrollArea className="flex-1 h-[calc(100vh-180px)] overflow-y-auto">
            <div className="space-y-2 p-3">
              {conversations.length === 0 ? (
                <p className="p-4 text-center text-sm text-muted-foreground">
                  {t.noChats}
                </p>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`flex flex-col gap-2 rounded-lg p-3 cursor-pointer transition-colors ${activeId === conv.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted bg-card border border-border"
                      }`}
                    onClick={() => onSelect(conv.id)}
                  >
                    {/* Title Row */}
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate text-sm font-medium">{conv.title}</span>
                    </div>
                    {/* Buttons Row - Always visible */}
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`h-9 px-3 gap-1.5 ${activeId === conv.id
                          ? "bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground"
                          : "bg-primary/10 hover:bg-primary/20 text-primary"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameOpen(conv);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="text-xs">{t.rename}</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={`h-9 px-3 gap-1.5 ${activeId === conv.id
                          ? "bg-red-500/30 hover:bg-red-500/40 text-primary-foreground"
                          : "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                          }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(conv.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs">{t.delete}</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Rename Modal */}
      <Dialog open={!!renameId} onOpenChange={() => setRenameId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.renameTitle}</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder={t.newName}
            onKeyDown={(e) => e.key === "Enter" && handleRenameConfirm()}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameId(null)}>
              {t.cancel}
            </Button>
            <Button onClick={handleRenameConfirm}>{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.delete}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            {t.deleteConfirm}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              {t.no}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              {t.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
