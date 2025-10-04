import { useState, useRef, useEffect } from "react";
import { X, MessageSquare, Send, Loader2, Minimize2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface FloatingChatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const FloatingChat = ({ isOpen, onClose, userId }: FloatingChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userId) {
      loadChatHistory();
    }
  }, [isOpen, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadChatHistory = async () => {
    const { data, error } = await supabase
      .from("chat_history")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .limit(50);

    if (!error && data) {
      setMessages(data.map(msg => ({ role: msg.role as "user" | "assistant", content: msg.content })));
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      await supabase.from("chat_history").insert({
        user_id: userId,
        role: "user",
        content: input,
      });

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { message: input, userId },
      });

      if (error) throw error;

      const assistantMessage: Message = { role: "assistant", content: data.reply };
      setMessages(prev => [...prev, assistantMessage]);

      await supabase.from("chat_history").insert({
        user_id: userId,
        role: "assistant",
        content: data.reply,
      });
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    setPosition({
      x: Math.max(0, Math.min(window.innerWidth - 400, dragRef.current.startPosX + deltaX)),
      y: Math.max(0, Math.min(window.innerHeight - 600, dragRef.current.startPosY + deltaY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragRef.current = null;
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!isOpen) return null;

  return (
    <Card
      className="fixed z-50 w-[400px] shadow-2xl border-2 border-primary/30 bg-card/95 backdrop-blur-xl"
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        height: isMinimized ? "60px" : "600px",
        transition: isDragging ? "none" : "height 0.3s ease",
      }}
    >
      {/* Header - Draggable */}
      <div
        className="flex items-center justify-between p-4 border-b border-border cursor-move bg-primary/10"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsMinimized(!isMinimized)}
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="h-[460px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Start a conversation with your AI assistant</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage();
              }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </>
      )}
    </Card>
  );
};

export default FloatingChat;
