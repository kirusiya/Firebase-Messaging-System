"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { User } from "@/types"

export function useUsers(currentUserId?: string) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const usersRef = collection(db, "users")
    const q = currentUserId ? query(usersRef, where("__name__", "!=", currentUserId)) : usersRef

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastSeen: doc.data().lastSeen?.toDate() || new Date(),
      })) as User[]

      setUsers(usersData)
      setLoading(false)
    })

    return unsubscribe
  }, [currentUserId])

  return { users, loading }
}
