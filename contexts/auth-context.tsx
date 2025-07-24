"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, displayName: string) => Promise<void>
  logout: () => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userDoc = await getDoc(userDocRef)

        if (userDoc.exists()) {
          const userData = userDoc.data()
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: userData.displayName || firebaseUser.displayName || "",
            photoURL: userData.photoURL || firebaseUser.photoURL || undefined,
            createdAt: userData.createdAt?.toDate() || new Date(),
            lastSeen: userData.lastSeen?.toDate() || new Date(),
            isOnline: true, // Establecer como online al cargar la sesión
          })

          // Actualizar lastSeen y isOnline en Firestore
          await updateDoc(userDocRef, {
            lastSeen: serverTimestamp(),
            isOnline: true,
          })
        } else {
          // Si el documento de usuario no existe (ej. después de un registro),
          // se creará en la función register. Aquí solo actualizamos el estado local.
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            displayName: firebaseUser.displayName || "",
            photoURL: firebaseUser.photoURL || undefined,
            createdAt: new Date(), // Placeholder, se actualizará con serverTimestamp en register
            lastSeen: new Date(), // Placeholder
            isOnline: true,
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // onAuthStateChanged se encargará de actualizar el estado y Firestore
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      await updateProfile(firebaseUser, { displayName })

      await setDoc(doc(db, "users", firebaseUser.uid), {
        email,
        displayName,
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        isOnline: true, // Establecer como online al registrarse
      })
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async () => {
    try {
      if (user) {
        // Actualizar lastSeen y isOnline a false al cerrar sesión
        await updateDoc(doc(db, "users", user.id), {
          lastSeen: serverTimestamp(), // Última vez que estuvo activo
          isOnline: false, // Ya no está online
        })
      }
      await signOut(auth)
      localStorage.clear()
    } catch (error: any) {
      console.error("Error logging out:", error)
      throw new Error(error.message)
    }
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName, photoURL })
        await updateDoc(doc(db, "users", auth.currentUser.uid), {
          displayName,
          ...(photoURL && { photoURL }),
        })
      }
    } catch (error: any) {
      console.error("Error updating user profile:", error)
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
