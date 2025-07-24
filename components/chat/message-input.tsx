"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, X } from "lucide-react"
import type { Message, User } from "@/types" // Import User type

interface MessageInputProps {
  onSendMessage: (
    content: string,
    repliedTo?: { id: string; content: string; senderDisplayName: string },
  ) => Promise<void>
  disabled?: boolean
  messageToReplyTo?: Message | null
  onClearReply: () => void
  currentUser: User | null // New prop for current user
  otherUser: User | null // New prop for other user
}

export function MessageInput({
  onSendMessage,
  disabled,
  messageToReplyTo,
  onClearReply,
  currentUser, // Destructure new prop
  otherUser, // Destructure new prop
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    setSending(true)
    try {
      const replyData = messageToReplyTo
        ? {
            id: messageToReplyTo.id,
            content: messageToReplyTo.content,
            // Determine senderDisplayName based on who sent the original message
            senderDisplayName:
              messageToReplyTo.senderId === currentUser?.id
                ? currentUser.displayName
                : otherUser?.displayName || "Unknown User",
          }
        : undefined
      await onSendMessage(message.trim(), replyData)
      setMessage("")
      onClearReply()
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <Card data-message-input>
      <CardContent className="p-4">
        {messageToReplyTo && (
          <div className="relative mb-3 p-2 rounded-md bg-muted border-l-4 border-primary text-sm italic">
            <p className="font-semibold">Replying to {messageToReplyTo.senderDisplayName}</p>{" "}
            {/* Use senderDisplayName */}
            <p className="truncate">{messageToReplyTo.content}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-1 right-1 h-6 w-6 text-muted-foreground"
              onClick={onClearReply}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={disabled || sending}
            className="flex-1"
          />
          <Button type="submit" disabled={!message.trim() || disabled || sending} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
