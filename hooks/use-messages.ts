"use client"

import { useState, useEffect, useRef } from "react"
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  or,
  and,
  writeBatch,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Message } from "@/types"

export function useMessages(userId: string, otherUserId: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const notificationPermissionRef = useRef<NotificationPermission | null>(null)
  const isInitialLoadRef = useRef(true)
  const lastNotificationTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    // Solicitar permisos de notificación al cargar
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          notificationPermissionRef.current = permission
        })
      } else {
        notificationPermissionRef.current = Notification.permission
      }
    }
  }, [])

  const showNotification = (senderName: string, messageContent: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      // Crear nueva notificación sin tag para evitar reemplazos
      const notification = new Notification(`New message from ${senderName}`, {
        body: messageContent,
        icon: "/favicon.ico",
        requireInteraction: false,
      })

      setTimeout(() => {
        notification.close()
      }, 4000)

      notification.onclick = () => {
        window.focus()
        notification.close()
      }
    }
  }

  useEffect(() => {
    if (!userId || !otherUserId) return

    // Reset para nueva conversación
    isInitialLoadRef.current = true
    lastNotificationTimeRef.current = Date.now()

    const messagesRef = collection(db, "messages")
    const q = query(
      messagesRef,
      or(
        and(where("senderId", "==", userId), where("receiverId", "==", otherUserId)),
        and(where("senderId", "==", otherUserId), where("receiverId", "==", userId)),
      ),
      orderBy("timestamp", "asc"),
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessagesData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
        editedAt: doc.data().editedAt?.toDate(),
        deletedAt: doc.data().deletedAt?.toDate(),
      })) as Message[]

      // Si es la carga inicial, no mostrar notificaciones
      if (isInitialLoadRef.current) {
        isInitialLoadRef.current = false
        setMessages(newMessagesData)
        setLoading(false)

        // Marcar mensajes como leídos sin notificar
        const unreadMessagesToMark = newMessagesData.filter(
          (msg) => msg.receiverId === userId && !msg.read && msg.senderId === otherUserId,
        )

        if (unreadMessagesToMark.length > 0) {
          Promise.resolve().then(() => {
            const batch = writeBatch(db)
            unreadMessagesToMark.forEach((msg) => {
              const msgRef = doc(db, "messages", msg.id)
              batch.update(msgRef, { read: true })
            })
            batch.commit().catch((error) => console.error("Error marking messages as read:", error))
          })
        }
        return
      }

      // Para actualizaciones posteriores, detectar mensajes nuevos
      const currentTime = Date.now()
      const newIncomingMessages = newMessagesData.filter((msg) => {
        const messageTime = msg.timestamp.getTime()
        return (
          msg.receiverId === userId && // Es para mí
          msg.senderId === otherUserId && // Viene del usuario con quien estoy chateando
          messageTime > lastNotificationTimeRef.current && // Es más reciente que la última notificación
          msg.timestamp && // Tiene timestamp válido
          !msg.deleted // No está eliminado
        )
      })

      // Mostrar notificación para cada mensaje nuevo
      newIncomingMessages.forEach((msg) => {
        showNotification("User", msg.content)
      })

      // Actualizar el tiempo de la última notificación
      if (newIncomingMessages.length > 0) {
        const latestMessageTime = Math.max(...newIncomingMessages.map((msg) => msg.timestamp.getTime()))
        lastNotificationTimeRef.current = latestMessageTime
      }

      setMessages(newMessagesData)
      setLoading(false)

      // Marcar mensajes como leídos de forma asíncrona
      const unreadMessagesToMark = newMessagesData.filter(
        (msg) => msg.receiverId === userId && !msg.read && msg.senderId === otherUserId,
      )

      if (unreadMessagesToMark.length > 0) {
        Promise.resolve().then(() => {
          const batch = writeBatch(db)
          unreadMessagesToMark.forEach((msg) => {
            const msgRef = doc(db, "messages", msg.id)
            batch.update(msgRef, { read: true })
          })
          batch.commit().catch((error) => console.error("Error marking messages as read:", error))
        })
      }
    })

    return () => {
      unsubscribe()
    }
  }, [userId, otherUserId])

  const sendMessage = async (
    content: string,
    repliedTo?: { id: string; content: string; senderDisplayName: string },
  ) => {
    try {
      await addDoc(collection(db, "messages"), {
        senderId: userId,
        receiverId: otherUserId,
        content,
        timestamp: serverTimestamp(),
        read: false,
        edited: false,
        deleted: false, // Inicializar como no eliminado
        reactions: [], // Inicializar con array vacío
        ...(repliedTo && { repliedTo }),
      })
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  const deleteMessage = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        deleted: true,
        deletedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error deleting message:", error)
      throw error
    }
  }

  const addReaction = async (messageId: string, emoji: string) => {
    try {
      const messageRef = doc(db, "messages", messageId)
      const message = messages.find((m) => m.id === messageId)

      if (!message) return

      const existingReactions = message.reactions || []
      const reactionIndex = existingReactions.findIndex((r) => r.emoji === emoji)

      if (reactionIndex >= 0) {
        // La reacción ya existe
        const reaction = existingReactions[reactionIndex]
        const userIndex = reaction.users.indexOf(userId)

        if (userIndex >= 0) {
          // El usuario ya reaccionó con este emoji, remover su reacción
          const updatedUsers = reaction.users.filter((id) => id !== userId)
          if (updatedUsers.length === 0) {
            // Si no quedan usuarios, remover toda la reacción
            const updatedReactions = existingReactions.filter((r) => r.emoji !== emoji)
            await updateDoc(messageRef, { reactions: updatedReactions })
          } else {
            // Actualizar la lista de usuarios
            const updatedReactions = [...existingReactions]
            updatedReactions[reactionIndex] = { emoji, users: updatedUsers }
            await updateDoc(messageRef, { reactions: updatedReactions })
          }
        } else {
          // El usuario no había reaccionado con este emoji, agregar su reacción
          const updatedReactions = [...existingReactions]
          updatedReactions[reactionIndex] = { emoji, users: [...reaction.users, userId] }
          await updateDoc(messageRef, { reactions: updatedReactions })
        }
      } else {
        // Nueva reacción
        const newReaction = { emoji, users: [userId] }
        await updateDoc(messageRef, { reactions: [...existingReactions, newReaction] })
      }
    } catch (error) {
      console.error("Error adding reaction:", error)
      throw error
    }
  }

  const markAsRead = async (messageId: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        read: true,
      })
    } catch (error) {
      console.error("Error marking message as read:", error)
    }
  }

  const editMessage = async (messageId: string, newContent: string) => {
    try {
      await updateDoc(doc(db, "messages", messageId), {
        content: newContent,
        edited: true,
        editedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error editing message:", error)
      throw error
    }
  }

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    addReaction,
    markAsRead,
    editMessage,
  }
}
