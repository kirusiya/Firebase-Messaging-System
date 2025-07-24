"use client"

import { useEffect, useRef, useLayoutEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Message, User } from "@/types"
import { useAuth } from "@/contexts/auth-context"
import { formatDistanceToNow } from "date-fns"
import { Reply, Smile, Trash2 } from "lucide-react"

interface MessageListProps {
  messages: Message[]
  otherUser: User
  loading: boolean
  onReply: (message: Message) => void
  onAddReaction: (messageId: string, emoji: string) => Promise<void>
  onDeleteMessage: (messageId: string) => Promise<void>
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"]

export function MessageList({
  messages,
  otherUser,
  loading,
  onReply,
  onAddReaction,
  onDeleteMessage,
}: MessageListProps) {
  const { user: currentUser } = useAuth()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const previousUserIdRef = useRef<string>("")
  const [maxHeight, setMaxHeight] = useState("calc(100vh - 250px)")
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const hidePickerTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Calcular altura dinámica
  useLayoutEffect(() => {
    const calculateMaxHeight = () => {
      // Obtener altura del header principal
      const mainHeader = document.querySelector("header")
      const mainHeaderHeight = mainHeader ? mainHeader.offsetHeight : 64

      // Obtener altura del header del chat (CardHeader)
      const chatHeader = document.querySelector("[data-chat-header]")
      const chatHeaderHeight = chatHeader ? chatHeader.offsetHeight : 80

      // Obtener altura del input de mensajes (aproximada)
      const messageInput = document.querySelector("[data-message-input]")
      const messageInputHeight = messageInput ? messageInput.offsetHeight : 100

      // Padding del container principal
      const containerPadding = 48 // py-6 = 24px top + 24px bottom

      // Padding interno del CardContent
      const cardPadding = 32 // p-4 = 16px * 2

      // Calcular altura total ocupada
      const totalUsedHeight = mainHeaderHeight + chatHeaderHeight + messageInputHeight + containerPadding + cardPadding

      // Calcular max-height disponible
      const availableHeight = `calc(100vh - ${totalUsedHeight}px)`

      setMaxHeight(availableHeight)
    }

    // Calcular inicialmente
    calculateMaxHeight()

    // Recalcular en resize
    const handleResize = () => calculateMaxHeight()
    window.addEventListener("resize", handleResize)

    return () => window.removeEventListener("resize", handleResize)
  }, [otherUser.id])

  // Solo ejecutar cuando cambie el usuario
  useLayoutEffect(() => {
    if (otherUser.id !== previousUserIdRef.current) {
      previousUserIdRef.current = otherUser.id

      if (scrollContainerRef.current) {
        const container = scrollContainerRef.current

        // Forzar reflow
        container.style.overflow = "hidden"
        container.offsetHeight
        container.style.overflow = "auto"

        // Múltiples intentos para asegurar que vaya al final
        const scrollToBottom = () => {
          container.scrollTop = container.scrollHeight
        }

        // Ejecutar inmediatamente y con delays
        scrollToBottom()
        setTimeout(scrollToBottom, 10)
        setTimeout(scrollToBottom, 50)
        setTimeout(scrollToBottom, 100)
      }
    }
  }, [otherUser.id])

  // Forzar scroll al final cuando se cargan los mensajes
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      // Ir al final inmediatamente cuando se cargan mensajes
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight
      })
    }
  }, [messages.length, otherUser.id])

  // Configurar wheel handler solo una vez por usuario
  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      container.scrollTop += e.deltaY
    }

    container.addEventListener("wheel", handleWheel, { passive: false })

    return () => {
      container.removeEventListener("wheel", handleWheel)
    }
  }, [otherUser.id])

  // Auto-scroll solo cuando hay mensajes nuevos
  useEffect(() => {
    if (messages.length > 0 && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const { scrollTop, scrollHeight, clientHeight } = container
      const isScrolledToBottom = scrollHeight - scrollTop <= clientHeight + 100

      if (isScrolledToBottom) {
        // Usar requestAnimationFrame para mejor rendimiento
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        })
      }
    }
  }, [messages.length]) // Solo cuando cambia la cantidad de mensajes

  const handleEmojiClick = async (messageId: string, emoji: string) => {
    try {
      await onAddReaction(messageId, emoji)
      setShowEmojiPicker(null)
    } catch (error) {
      console.error("Error adding reaction:", error)
    }
  }

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await onDeleteMessage(messageId)
    } catch (error) {
      console.error("Error deleting message:", error)
    }
  }

  const getReactionTooltip = (reaction: any) => {
    const count = reaction.users.length
    if (count === 1) {
      return `1 person reacted with ${reaction.emoji}`
    }
    return `${count} people reacted with ${reaction.emoji}`
  }

  // Hover logic for emoji picker
  const handleSmileButtonMouseEnter = (messageId: string) => {
    if (hidePickerTimeoutRef.current) {
      clearTimeout(hidePickerTimeoutRef.current)
    }
    setShowEmojiPicker(messageId)
  }

  const handleSmileButtonMouseLeave = () => {
    hidePickerTimeoutRef.current = setTimeout(() => {
      setShowEmojiPicker(null)
    }, 200) // Small delay to allow moving mouse to picker
  }

  const handleEmojiPickerMouseEnter = () => {
    if (hidePickerTimeoutRef.current) {
      clearTimeout(hidePickerTimeoutRef.current)
    }
  }

  const handleEmojiPickerMouseLeave = () => {
    hidePickerTimeoutRef.current = setTimeout(() => {
      setShowEmojiPicker(null)
    }, 200) // Small delay
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">Loading messages...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b" data-chat-header>
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.photoURL || "/placeholder.svg"} />
            <AvatarFallback>{otherUser.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg">{otherUser.displayName}</CardTitle>
            <p className="text-sm text-muted-foreground">{otherUser.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-4 p-4"
        style={{ maxHeight }}
        tabIndex={0}
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">No messages yet. Start the conversation!</div>
        ) : (
          messages.map((message) => {
            const isCurrentUser = message.senderId === currentUser?.id

            // Si el mensaje está eliminado, mostrar mensaje especial
            if (message.deleted) {
              return (
                <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-muted/50 border border-dashed border-muted-foreground/30">
                    <div className="flex items-center space-x-2 text-muted-foreground">
                      <Trash2 className="h-4 w-4" />
                      <p className="text-sm italic">
                        {isCurrentUser ? "You deleted this message" : "This message was deleted"}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs opacity-70">
                        {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div key={message.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                <div
                  className={`group relative max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                  }`}
                >
                  {message.repliedTo && (
                    <div
                      className={`mb-2 p-2 rounded-md border-l-4 ${
                        isCurrentUser
                          ? "border-primary-foreground/50 bg-primary/80"
                          : "border-gray-400 bg-muted-foreground/10"
                      } text-xs italic overflow-hidden`}
                    >
                      <p className="font-semibold">{message.repliedTo.senderDisplayName}</p> {/* CORREGIDO AQUÍ */}
                      <p className="truncate">{message.repliedTo.content}</p>
                    </div>
                  )}
                  <p className="text-sm">{message.content}</p>

                  {/* Reacciones */}
                  {message.reactions && message.reactions.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      {message.reactions.map((reaction, index) => (
                        <span
                          key={index}
                          className={`text-base transition-transform ${
                            !isCurrentUser ? "cursor-pointer hover:scale-110" : "cursor-default"
                          }`}
                          onClick={!isCurrentUser ? () => handleEmojiClick(message.id, reaction.emoji) : undefined}
                          title={getReactionTooltip(reaction)}
                        >
                          {reaction.emoji}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs opacity-70">
                      {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                    </span>
                    {message.edited && (
                      <Badge variant="secondary" className="text-xs ml-2">
                        Edited
                      </Badge>
                    )}
                    {isCurrentUser && <span className="text-xs opacity-70 ml-2">{message.read ? "✓✓" : "✓"}</span>}
                  </div>

                  {/* Botones de acción */}
                  <div
                    className={`absolute top-1 ${
                      isCurrentUser ? "-left-20" : "-right-20"
                    } flex gap-1 transition-opacity ${
                      showEmojiPicker === message.id ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                  >
                    {/* Botón de responder - disponible para todos los mensajes */}
                    <button
                      onClick={() => onReply(message)}
                      className="p-1 rounded-full bg-background text-foreground hover:bg-muted"
                      title="Reply"
                    >
                      <Reply className="h-4 w-4" />
                    </button>

                    {/* Botón de reaccionar - solo para mensajes de otros */}
                    {!isCurrentUser && (
                      <button
                        onMouseEnter={() => handleSmileButtonMouseEnter(message.id)}
                        onMouseLeave={handleSmileButtonMouseLeave}
                        className="p-1 rounded-full bg-background text-foreground hover:bg-muted"
                        title="React"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                    )}

                    {/* Botón de eliminar - solo para mensajes propios */}
                    {isCurrentUser && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="p-1 rounded-full bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Picker de emojis - Solo mostrar para mensajes de otros usuarios */}
                  {!isCurrentUser && showEmojiPicker === message.id && (
                    <div
                      onMouseEnter={handleEmojiPickerMouseEnter}
                      onMouseLeave={handleEmojiPickerMouseLeave}
                      className={`absolute ${isCurrentUser ? "-left-20" : "-right-20"} top-8 bg-background border rounded-lg shadow-lg p-2 flex gap-1 z-10`}
                    >
                      {EMOJI_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleEmojiClick(message.id, emoji)}
                          className="p-1 hover:bg-muted rounded text-lg"
                          title={`React with ${emoji}`}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>
    </Card>
  )
}
