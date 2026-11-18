export interface Conversation {
  id: string;
  userId: string;
  otherUserId: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
}

export interface CreateMessageDTO {
  senderId: string;
  content: string;
}

export interface CreateConversationDTO {
  userId: string;
  otherUserId: string;
}
