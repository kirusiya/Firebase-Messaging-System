"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { X } from "lucide-react" // Importar el icono X
import { FirebaseError } from "firebase/app" // Importar FirebaseError

interface LoginFormProps {
  onToggleMode: () => void
}

export function LoginForm({ onToggleMode }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("") // Limpiar error previo
    setLoading(true)

    try {
      await login(email, password)
      // Si el login es exitoso, el loader no desaparece, se redirige directamente
      router.push("/")
    } catch (error: any) {
      // Manejo de errores específico para Firebase
      if (error instanceof FirebaseError) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/user-not-found" ||
          error.code === "auth/wrong-password"
        ) {
          setError("Incorrect Email or Password")
        } else {
          setError(error.message)
        }
      } else {
        setError(error.message)
      }
      setLoading(false) // Si hay error, el loader desaparece y se muestra el formulario
    }
  }

  return (
    <div className="relative">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
          {error && (
            <Alert className="mt-4 relative pr-10 border-2 bg-[#f8d7da] text-[#842029] border-[#f5c2c7]">
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-1 right-1 h-6 w-6 text-black hover:bg-transparent"
                onClick={() => setError("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <Button type="button" variant="ghost" className="w-full" onClick={onToggleMode} disabled={loading}>
              Don't have an account? Sign up
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Signing in...</p>
          </div>
        </div>
      )}
    </div>
  )
}
