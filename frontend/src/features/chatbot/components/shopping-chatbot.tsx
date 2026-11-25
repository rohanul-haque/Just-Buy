"use client";

import * as React from "react";
import Link from "next/link";
import {
  Bot,
  Heart,
  Loader2,
  MessageSquare,
  Package,
  RotateCcw,
  Send,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/use-auth";
import { useSendChatMessage } from "@/features/chatbot/hooks/use-chatbot";
import type { ChatMessage, ChatProductCard } from "@/features/chatbot/types";
import type { ProductSize } from "@/features/products/types";
import { useAddToCart } from "@/features/cart/hooks/use-cart";
import { useAddToWishlist } from "@/features/wishlist/hooks/use-wishlist";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import notify from "@/lib/toast";

const QUICK_PROMPTS = [
  "কী কী ক্যাটাগরি আছে?",
  "নতুন কী কী প্রোডাক্ট আছে?",
  "৫০ ডলারের মধ্যে প্রোডাক্ট দেখাও",
  "সেরা প্রোডাক্টগুলো দেখাও",
];

function ChatProductMiniCard({
  product,
  isAuthenticated,
  onNavigate,
}: {
  product: ChatProductCard;
  isAuthenticated: boolean;
  onNavigate: () => void;
}) {
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      notify.info("কার্টে প্রোডাক্ট যোগ করতে অনুগ্রহ করে আগে লগইন করুন।");
      return;
    }
    if (!product.inStock) return;
    addToCartMutation.mutate(
      {
        productId: product.id,
        quantity: 1,
        ...(product.sizes && product.sizes.length > 0
          ? { size: product.sizes[0] as ProductSize }
          : {}),
      },
      {
        onSuccess: () => {
          notify.success("কার্টে যোগ করা হয়েছে", product.name);
        },
        onError: (err) => {
          notify.apiError(err, "কার্টে যোগ করা যায়নি");
        },
      },
    );
  };

  const handleAddToWishlist = () => {
    if (!isAuthenticated) {
      notify.info("উইশলিস্টে যোগ করতে অনুগ্রহ করে আগে লগইন করুন।");
      return;
    }
    addToWishlistMutation.mutate(product.id, {
      onSuccess: () => {
        notify.success("উইশলিস্টে যোগ করা হয়েছে", product.name);
      },
      onError: (err) => {
        notify.apiError(err, "উইশলিস্টে যোগ করা যায়নি");
      },
    });
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-2.5 flex gap-2.5 items-start shadow-none">
      <Link
        href={`/products/${product.id}`}
        onClick={onNavigate}
        className="size-16 rounded-lg bg-neutral-100 border border-neutral-200/70 overflow-hidden shrink-0 flex items-center justify-center"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
          />
        ) : (
          <Package className="size-5 text-neutral-400" />
        )}
      </Link>

      <div className="min-w-0 flex-1 space-y-1">
        <Link
          href={`/products/${product.id}`}
          onClick={onNavigate}
          className="block text-xs font-semibold text-neutral-900 hover:text-[#ff6200] truncate"
        >
          {product.name}
        </Link>

        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-[#ff6200]">
            ${product.price.toFixed(2)}
          </span>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full",
              product.inStock
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600",
            )}
          >
            {product.inStock ? "স্টকে আছে" : "স্টক নেই"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pt-1">
          <button
            type="button"
            disabled={!product.inStock || addToCartMutation.isPending}
            onClick={handleAddToCart}
            className="flex-1 inline-flex items-center justify-center gap-1 rounded-md bg-[#ff6200] hover:bg-[#e55800] text-white text-[11px] font-semibold py-1.5 px-2 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addToCartMutation.isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ShoppingCart className="size-3" />
            )}
            <span>Add to Cart</span>
          </button>

          <button
            type="button"
            disabled={addToWishlistMutation.isPending}
            onClick={handleAddToWishlist}
            title="Add to Wishlist"
            aria-label="Add to Wishlist"
            className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white hover:border-[#ff6200] hover:text-[#ff6200] text-neutral-600 p-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            {addToWishlistMutation.isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Heart className="size-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ShoppingChatbot() {
  const { data: user } = useCurrentUser();
  const [isOpen, setIsOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const sendMessageMutation = useSendChatMessage();

  React.useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, sendMessageMutation.isPending]);

  const handleResetChat = () => {
    setMessages([]);
  };

  const handleSend = async (textToSend?: string) => {
    const trimmed = (textToSend ?? input).trim();
    if (!trimmed || sendMessageMutation.isPending) return;

    if (!textToSend) {
      setInput("");
    }

    const historyPayload = messages.slice(-12).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const optimisticUserMsg: ChatMessage = {
      role: "user",
      content: trimmed,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticUserMsg]);

    try {
      const result = await sendMessageMutation.mutateAsync({
        message: trimmed,
        history: historyPayload,
      });

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: result.reply,
        products: result.products,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => prev.slice(0, -1));
      notify.apiError(err, "AI সহায়কের সাথে সংযোগ করা যায়নি।");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end"
      style={{
        fontFamily: "var(--font-sans), var(--font-bengali), sans-serif",
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-3 w-[calc(100vw-2.5rem)] sm:w-[400px] h-[540px] max-h-[80vh] rounded-2xl border border-neutral-200 bg-white shadow-xl flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#ff6200] text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-full bg-white/15 flex items-center justify-center">
                <Bot className="size-4.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight">
                  JustBuy AI সহায়ক
                </h3>
                <p className="text-[11px] text-white/90">
                  প্রোডাক্ট ও ক্যাটাগরি সম্পর্কে জানুন
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="নতুন চ্যাট"
                  aria-label="নতুন চ্যাট"
                  className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
                >
                  <RotateCcw className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="বন্ধ করুন"
                aria-label="বন্ধ করুন"
                className="p-1.5 rounded-lg hover:bg-white/15 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/40">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 px-2">
                <div className="size-12 rounded-full bg-orange-50 text-[#ff6200] flex items-center justify-center">
                  <Sparkles className="size-6" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-neutral-900">
                    {user?.name
                      ? `স্বাগতম, ${user.name.split(" ")[0]}!`
                      : "JustBuy-তে স্বাগতম!"}
                  </p>
                  <p className="text-xs text-neutral-500 leading-relaxed">
                    কী কী প্রোডাক্ট ও ক্যাটাগরি আছে তা বাংলায় বা ইংরেজিতে
                    জিজ্ঞাসা করুন।
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="rounded-full border border-[#ff6200]/30 bg-orange-50/70 px-3 py-1.5 text-xs font-medium text-[#ff6200] hover:bg-[#ff6200] hover:text-white transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div key={idx} className="space-y-2">
                  <div
                    className={cn(
                      "flex",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap",
                        msg.role === "user"
                          ? "bg-[#ff6200] text-white rounded-br-xs"
                          : "bg-neutral-100 text-neutral-900 rounded-bl-xs border border-neutral-200/70",
                      )}
                    >
                      {msg.content}
                    </div>
                  </div>

                  {msg.role === "assistant" &&
                    msg.products &&
                    msg.products.length > 0 && (
                      <div className="space-y-2 pl-1 pr-2">
                        {msg.products.map((product) => (
                          <ChatProductMiniCard
                            key={product.id}
                            product={product}
                            isAuthenticated={Boolean(user)}
                            onNavigate={() => setIsOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                </div>
              ))
            )}

            {sendMessageMutation.isPending && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-xs bg-neutral-100 border border-neutral-200/70 px-3.5 py-2.5 flex items-center gap-2 text-xs text-neutral-500">
                  <Loader2 className="size-3.5 animate-spin text-[#ff6200]" />
                  <span>JustBuy ক্যাটালগ খোঁজা হচ্ছে...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 border-t border-neutral-200 bg-white flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="প্রোডাক্ট, দাম বা ক্যাটাগরি নিয়ে লিখুন..."
              disabled={sendMessageMutation.isPending}
              className="flex-1 h-10 rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#ff6200] focus:bg-white focus:outline-hidden"
            />
            <Button
              type="button"
              size="icon"
              disabled={!input.trim() || sendMessageMutation.isPending}
              onClick={() => handleSend()}
              aria-label="পাঠান"
              className="size-10 rounded-lg bg-[#ff6200] hover:bg-[#e55800] text-white border-0 shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? "চ্যাটবট বন্ধ করুন" : "চ্যাটবট খুলুন"}
        className="size-13 rounded-full bg-[#ff6200] hover:bg-[#e55800] active:scale-95 text-white shadow-lg flex items-center justify-center transition-all cursor-pointer"
      >
        {isOpen ? (
          <X className="size-6" />
        ) : (
          <MessageSquare className="size-6" />
        )}
      </button>
    </div>
  );
}

export default ShoppingChatbot;
