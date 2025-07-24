"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/layout/header"
import { UserList } from "@/components/chat/user-list"
import { MessageList } from "@/components/chat/message-list"
import { MessageInput } from "@/components/chat/message-input"
import type { User, Message } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"
import { redirect } from "next/navigation"
import { useMessages } from "@/hooks/use-messages"

export default function HomePage() {
  const { user, loading } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [messageToReplyTo, setMessageToReplyTo] = useState<Message | null>(null)

  const {
    messages,
    loading: messagesLoading,
    sendMessage,
    deleteMessage,
    addReaction,
  } = useMessages(user?.id || "", selectedUser?.id || "")

  const handleSendMessage = async (
    content: string,
    repliedTo?: { id: string; content: string; senderDisplayName: string },
  ) => {
    await sendMessage(content, repliedTo)
    setMessageToReplyTo(null)
  }

  const handleReply = (message: Message) => {
    setMessageToReplyTo(message)
  }

  const handleClearReply = () => {
    setMessageToReplyTo(null)
  }

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage(messageId)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    redirect("/auth")
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="container mx-auto px-4 py-6 flex-1 flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Users List */}
          <div className="lg:col-span-1 flex flex-col" style={{ maxHeight: "calc(100vh - 12rem)" }}>
            <UserList onSelectUser={setSelectedUser} selectedUserId={selectedUser?.id} />
          </div>
          {/* Chat Area */}
          <div className="lg:col-span-2 flex flex-col flex-1">
            <Card className="flex-1 flex flex-col min-h-0">
              {selectedUser ? (
                <>
                  <MessageList
                    messages={messages}
                    otherUser={selectedUser}
                    loading={messagesLoading}
                    onReply={handleReply}
                    onAddReaction={addReaction}
                    onDeleteMessage={handleDeleteMessage}
                  />
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    disabled={messagesLoading}
                    messageToReplyTo={messageToReplyTo}
                    onClearReply={handleClearReply}
                    currentUser={user}
                    otherUser={selectedUser}
                  />
                </>
              ) : (
                <CardContent className="flex flex-col items-center justify-center flex-1 text-center">
                  <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Welcome to Autsai Messaging</h3>
                  <p className="text-muted-foreground">Select a user from the list to start a conversation</p>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
