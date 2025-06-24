"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Users, Clock, Gavel } from "lucide-react"
import Link from "next/link"

interface AuctionRoom {
  id: string
  name: string
  description: string
  status: "active" | "pending" | "closed"
  participants: number
  currentBid: number
  endTime: string
  createdBy: string
}

export default function Dashboard() {
  const [rooms, setRooms] = useState<AuctionRoom[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    startingBid: "",
    duration: "60",
  })

  // Simulation de données
  useEffect(() => {
    const mockRooms: AuctionRoom[] = [
      {
        id: "1",
        name: "Vente d'art contemporain",
        description: "Collection privée d'œuvres modernes",
        status: "active",
        participants: 12,
        currentBid: 2500,
        endTime: "2024-12-15T18:00:00Z",
        createdBy: "user1",
      },
      {
        id: "2",
        name: "Antiquités françaises",
        description: "Mobilier et objets du 18ème siècle",
        status: "pending",
        participants: 8,
        currentBid: 1200,
        endTime: "2024-12-16T20:00:00Z",
        createdBy: "user2",
      },
      {
        id: "3",
        name: "Montres de collection",
        description: "Montres suisses et allemandes rares",
        status: "active",
        participants: 15,
        currentBid: 5800,
        endTime: "2024-12-14T16:30:00Z",
        createdBy: "user3",
      },
    ]
    setRooms(mockRooms)
  }, [])

  const handleCreateRoom = async () => {
    // Ici vous intégreriez l'appel à votre API
    const roomData = {
      name: newRoom.name,
      description: newRoom.description,
      startingBid: Number.parseFloat(newRoom.startingBid),
      duration: Number.parseInt(newRoom.duration),
    }

    console.log("Creating room:", roomData)
    // Simulation d'ajout
    const newRoomData: AuctionRoom = {
      id: Date.now().toString(),
      name: newRoom.name,
      description: newRoom.description,
      status: "pending",
      participants: 1,
      currentBid: Number.parseFloat(newRoom.startingBid),
      endTime: new Date(Date.now() + Number.parseInt(newRoom.duration) * 60000).toISOString(),
      createdBy: "current-user",
    }

    setRooms([...rooms, newRoomData])
    setIsCreateDialogOpen(false)
    setNewRoom({ name: "", description: "", startingBid: "", duration: "60" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "closed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "En cours"
      case "pending":
        return "En attente"
      case "closed":
        return "Terminée"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-2">Gérez vos enchères et participez aux ventes</p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Créer une salle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Créer une nouvelle salle d&apos;enchères</DialogTitle>
                <DialogDescription>
                  Configurez votre salle d&apos;enchères. Les participants pourront la rejoindre une fois créée.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom de la salle</Label>
                  <Input
                    id="name"
                    value={newRoom.name}
                    onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                    placeholder="Ex: Vente d'art moderne"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRoom.description}
                    onChange={(e) => setNewRoom({ ...newRoom, description: e.target.value })}
                    placeholder="Décrivez les objets mis aux enchères..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startingBid">Enchère de départ (€)</Label>
                  <Input
                    id="startingBid"
                    type="number"
                    value={newRoom.startingBid}
                    onChange={(e) => setNewRoom({ ...newRoom, startingBid: e.target.value })}
                    placeholder="100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="duration">Durée (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newRoom.duration}
                    onChange={(e) => setNewRoom({ ...newRoom, duration: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleCreateRoom}>
                  Créer la salle
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Salles actives</CardTitle>
              <Gavel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.filter((r) => r.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Participants total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rooms.reduce((acc, room) => acc + room.participants, 0)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enchère la plus élevée</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.max(...rooms.map((r) => r.currentBid)).toLocaleString()} €</div>
            </CardContent>
          </Card>
        </div>

        {/* Rooms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Card key={room.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <Badge className={getStatusColor(room.status)}>{getStatusText(room.status)}</Badge>
                </div>
                <CardDescription className="line-clamp-2">{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-medium">{room.participants}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Enchère actuelle:</span>
                    <span className="font-bold text-green-600">{room.currentBid.toLocaleString()} €</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fin:</span>
                    <span className="font-medium">
                      {new Date(room.endTime).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <Link href={`/auction/${room.id}`}>
                    <Button className="w-full mt-4" variant={room.status === "active" ? "default" : "outline"}>
                      {room.status === "active" ? "Rejoindre" : "Voir détails"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
