"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

interface ChatContextType {
  unreadCount: number;
}

const ChatContext = createContext<ChatContextType>({
  unreadCount: 0,
});

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setUnreadCount(0);
      setPreviousUnreadCount(0);
      return;
    }

    // Listen to chats collection for unread messages
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("participants", "array-contains", user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalUnread = 0;
      let latestMessage = "";
      let latestSenderName = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const userUnread = data.unreadCount?.[user.uid] || 0;
        totalUnread += userUnread;

        // Get the latest message info for notification
        if (userUnread > 0 && data.lastMessage) {
          const otherParticipantId = data.participants.find((id: string) => id !== user.uid);
          if (otherParticipantId && data.participantNames?.[otherParticipantId]) {
            latestMessage = data.lastMessage;
            latestSenderName = data.participantNames[otherParticipantId];
          }
        }
      });

      // Show notification if unread count increased (and not first load)
      if (totalUnread > previousUnreadCount && previousUnreadCount >= 0) {
        showNotification(latestSenderName, latestMessage);
      }

      setPreviousUnreadCount(totalUnread);
      setUnreadCount(totalUnread);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const showNotification = (senderName: string, message: string) => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      notificationPermission !== "granted"
    ) {
      return;
    }

    // Only show notification if tab is not visible
    if (typeof document !== "undefined" && document.visibilityState === "visible") {
      return;
    }


    const notification = new Notification(`New message from ${senderName}`, {
      body: message.length > 100 ? message.substring(0, 100) + "..." : message,
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "chat-message",
      requireInteraction: false,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  };

  return (
    <ChatContext.Provider value={{ unreadCount }}>
      {children}
    </ChatContext.Provider>
  );
}
