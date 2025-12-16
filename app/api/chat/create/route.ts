import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const { userId, businessId, userName, businessName, userAvatar, businessAvatar } = await request.json();

    if (!userId || !businessId) {
      return NextResponse.json(
        { error: "User ID and Business ID are required" },
        { status: 400 }
      );
    }

    // Check if chat already exists
    const chatsRef = adminDb.collection("chats");
    const existingChats = await chatsRef
      .where("participants", "array-contains", userId)
      .get();

    let existingChatId: string | null = null;

    existingChats.forEach((doc) => {
      const data = doc.data();
      if (data.participants.includes(businessId)) {
        existingChatId = doc.id;
      }
    });

    if (existingChatId) {
      return NextResponse.json({
        success: true,
        chatId: existingChatId,
        message: "Chat already exists",
      });
    }

    // Create new chat
    const newChatRef = await chatsRef.add({
      participants: [userId, businessId],
      participantNames: {
        [userId]: userName || "User",
        [businessId]: businessName || "Business",
      },
      participantAvatars: {
        [userId]: userAvatar || null,
        [businessId]: businessAvatar || null,
      },
      lastMessage: "",
      lastMessageTimestamp: new Date(),
      unreadCount: {
        [userId]: 0,
        [businessId]: 0,
      },
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      chatId: newChatRef.id,
      message: "Chat created successfully",
    });
  } catch (error: any) {
    console.error("Error creating chat:", error);
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    );
  }
}
