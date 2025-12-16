"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  getDoc,
  Timestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Image from "next/image";
import Link from "next/link";
import { showError } from "@/lib/utils/toast";

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Timestamp;
  read: boolean;
}

interface ChatData {
  participants: string[];
  participantNames: { [key: string]: string };
  participantAvatars: { [key: string]: string };
  lastMessage: string;
  lastMessageTimestamp: Timestamp;
  unreadCount: { [key: string]: number };
}

export default function ChatPage({ params }: { params: Promise<{ chatId: string }> }) {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatData, setChatData] = useState<ChatData | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Unwrap params
  useEffect(() => {
    params.then((p) => setChatId(p.chatId));
  }, [params]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Load chat data
  useEffect(() => {
    if (!chatId) return;

    const chatRef = doc(db, "chats", chatId);
    getDoc(chatRef).then((docSnap) => {
      if (docSnap.exists()) {
        setChatData(docSnap.data() as ChatData);
      }
    });
  }, [chatId]);

  // Real-time messages listener
  useEffect(() => {
    if (!chatId) return;

    const messagesRef = collection(db, "chats", chatId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);

      // Mark messages as read
      if (user?.uid) {
        markMessagesAsRead();
      }
    });

    return () => unsubscribe();
  }, [chatId, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const markMessagesAsRead = async () => {
    if (!chatId || !user?.uid) return;

    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      [`unreadCount.${user.uid}`]: 0,
    });
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !user?.uid || !chatData) return;

    setSending(true);
    try {
      const messagesRef = collection(db, "chats", chatId, "messages");
      await addDoc(messagesRef, {
        senderId: user.uid,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });

      // Update chat metadata
      const otherUserId = chatData.participants.find((id) => id !== user.uid);
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        lastMessage: newMessage.trim(),
        lastMessageTimestamp: serverTimestamp(),
        [`unreadCount.${otherUserId}`]:
          ((chatData.unreadCount?.[otherUserId!] || 0) + 1),
      });

      setNewMessage("");
      textareaRef.current?.focus();
    } catch (error) {
      console.error("Error sending message:", error);
      showError("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const getOtherParticipant = () => {
    if (!chatData || !user?.uid) return null;
    const otherUserId = chatData.participants.find((id) => id !== user.uid);
    if (!otherUserId) return null;

    return {
      name: chatData.participantNames[otherUserId],
      avatar: chatData.participantAvatars[otherUserId],
      id: otherUserId,
    };
  };

  const formatTimestamp = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading || !chatId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-gray-300 border-t-[#151D26] rounded-full"></div>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4">
        <Link
          href="/messages"
          className="text-gray-600 hover:text-gray-900"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>

        {otherParticipant && (
          <>
            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
              {otherParticipant.avatar ? (
                <Image
                  src={otherParticipant.avatar}
                  alt={otherParticipant.name}
                  width={40}
                  height={40}
                  className="object-cover"
                />
              ) : (
                <span className="text-lg font-bold text-gray-500">
                  {otherParticipant.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {otherParticipant.name}
              </h1>
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwn = message.senderId === user?.uid;
          return (
            <div
              key={message.id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md xl:max-w-lg px-4 py-2 rounded-lg ${
                  isOwn
                    ? "bg-[#151D26] text-white"
                    : "bg-white text-gray-900 border border-gray-200"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.text}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    isOwn ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={sendMessage} className="flex gap-2">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#151D26] resize-none text-gray-900"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-2 bg-[#151D26] text-white rounded-lg hover:bg-[#2B3D4F] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
