export interface User {
  id: string
  email: string
  displayName: string
  photoURL?: string
  createdAt: Date
  lastSeen: Date
  isOnline: boolean // Nuevo campo para el estado online
}

export interface MessageReaction {
  emoji: string
  users: string[] // Array de user IDs que reaccionaron con este emoji
}

export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: Date
  read: boolean
  edited?: boolean
  editedAt?: Date
  deleted?: boolean // Nuevo campo para mensajes eliminados
  deletedAt?: Date // Nuevo campo para cuando se eliminó
  reactions?: MessageReaction[] // Nuevo campo para reacciones
  repliedTo?: {
    id: string
    content: string
    senderDisplayName: string
  }
}

export interface Chat {
  id: string
  participants: string[]
  lastMessage?: Message
  lastMessageTime: Date
  createdAt: Date
}

export interface GroupChat extends Chat {
  name: string
  description?: string
  adminId: string
  members: string[]
}
