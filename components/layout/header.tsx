"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"
import { LogOut, UserIcon } from "lucide-react" // Importar el icono User
import Image from "next/image"

export function Header() {
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Error logging out:", error)
    }
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Image src="/logo.png" alt="Autsai" width={120} height={32} className="h-8 w-auto" />
        </div>

        {user && (
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} /> {/* Eliminar placeholder.svg aquí */}
                <AvatarFallback>
                  {user.photoURL ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-5 w-5" />}{" "}
                  {/* Mostrar icono si no hay foto, si no, inicial */}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.displayName}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
