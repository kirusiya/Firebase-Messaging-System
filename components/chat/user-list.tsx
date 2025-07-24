"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUsers } from "@/hooks/use-users"
import { useAuth } from "@/contexts/auth-context"
import type { User } from "@/types"
import { UserIcon } from "lucide-react" // Importar el icono User

interface UserListProps {
  onSelectUser: (user: User) => void
  selectedUserId?: string
}

export function UserList({ onSelectUser, selectedUserId }: UserListProps) {
  const { user: currentUser } = useAuth()
  const { users, loading } = useUsers(currentUser?.id)

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        {" "}
        {/* Volvemos a h-full aquí para que la Card ocupe el 100% de su padre */}
        <CardHeader>
          <CardTitle>Users</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">Loading users...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      {" "}
      {/* Volvemos a h-full aquí */}
      <CardHeader>
        <CardTitle>Users ({users.length})</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-y-auto">
        <div className="space-y-1">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex items-center space-x-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                selectedUserId === user.id ? "bg-muted" : ""
              }`}
              onClick={() => onSelectUser(user)}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={user.photoURL || undefined} /> {/* Eliminar placeholder.svg aquí */}
                <AvatarFallback>
                  {user.photoURL ? user.displayName.charAt(0).toUpperCase() : <UserIcon className="h-6 w-6" />}{" "}
                  {/* Mostrar icono si no hay foto, si no, inicial */}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.displayName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <div className="flex flex-col items-end">
                {/* Usar user.isOnline para el indicador */}
                <div className={`w-2 h-2 rounded-full ${user.isOnline ? "bg-green-500" : "bg-gray-300"}`} />
                <span className="text-xs text-muted-foreground mt-1">{user.isOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
