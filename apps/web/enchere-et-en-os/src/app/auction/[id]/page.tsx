"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Users, Clock, Gavel, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface Bid {
  id: string
  userId: string
  userName: string
  amount: number
  timestamp: string
}

interface AuctionRoom {
  id: string
  name: string
  description: string
  status: "active" | "pending" | "closed"
  participants: number
  currentBid: number
  startingBid: number
  endTime: string
  createdBy: string
}

export default function AuctionRoom() {
  const params = useParams()
  const roomId = params.id as string

  const [room, setRoom] = useState<AuctionRoom | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [newBidAmount, setNewBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [isConnected, setIsConnected] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Simulation de données
  useEffect(() => {
    const mockRoom: AuctionRoom = {
      id: roomId,
      name: "Vente d'art contemporain",
      description:
        "Collection privée d'œuvres modernes incluant des peintures, sculptures et photographies d'artistes reconnus.",
      status: "active",
      participants: 12,
      currentBid: 2500,
      startingBid: 1000,
      endTime: "2024-12-15T18:00:00Z",
      createdBy: "user1",
    }

    const mockBids: Bid[] = [
      { id: "1", userId: "user1", userName: "Alice M.", amount: 1000, timestamp: "2024-12-14T10:00:00Z" },
      { id: "2", userId: "user2", userName: "Bob L.", amount: 1200, timestamp: "2024-12-14T10:05:00Z" },
      { id: "3", userId: "user3", userName: "Claire D.", amount: 1500, timestamp: "2024-12-14T10:10:00Z" },
      { id: "4", userId: "user4", userName: "David R.", amount: 2000, timestamp: "2024-12-14T10:15:00Z" },
      { id: "5", userId: "user5", userName: "Emma S.", amount: 2500, timestamp: "2024-12-14T10:20:00Z" },
    ]

    setRoom(mockRoom)
    setBids(mockBids.reverse()) // Plus récentes en premier
    setIsConnected(true)
  }, [roomId])

  // Timer countdown
  useEffect(() => {
    if (!room) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const endTime = new Date(room.endTime).getTime()
      const distance = endTime - now

      if (distance > 0) {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((distance % (1000 * 60)) / 1000)
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
      } else {
        setTimeLeft("Terminée")
        clearInterval(timer)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [room])

  // Simulation de nouvelles enchères en temps réel
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      // Simulation aléatoire de nouvelles enchères
      if (Math.random() > 0.7) {
        const users = ["Jean P.", "Marie L.", "Paul D.", "Sophie M.", "Lucas B."]
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const currentMax = Math.max(...bids.map((b) => b.amount))
        const newAmount = currentMax + Math.floor(Math.random() * 500) + 100

        const newBid: Bid = {
          id: Date.now().toString(),
          userId: `user${Date.now()}`,
          userName: randomUser,
          amount: newAmount,
          timestamp: new Date().toISOString(),
        }

        setBids((prev) => [newBid, ...prev])
        if (room) {
          setRoom((prev) => (prev ? { ...prev, currentBid: newAmount } : null))
        }
      }
    }, 8000) // Nouvelle enchère toutes les 8 secondes

    return () => clearInterval(interval)
  }, [isConnected, bids, room])

  const handlePlaceBid = async () => {
    if (!newBidAmount || !room) return

    const bidAmount = Number.parseFloat(newBidAmount)
    if (bidAmount <= room.currentBid) {
      alert("Votre enchère doit être supérieure à l'enchère actuelle")
      return
    }

    // Ici vous intégreriez l'appel à votre API WebSocket
    const newBid: Bid = {
      id: Date.now().toString(),
      userId: "current-user",
      userName: "Vous",
      amount: bidAmount,
      timestamp: new Date().toISOString(),
    }

    setBids((prev) => [newBid, ...prev])
    setRoom((prev) => (prev ? { ...prev, currentBid: bidAmount } : null))
    setNewBidAmount("")
  }

  const getMinBidAmount = () => {
    return room ? room.currentBid + 50 : 0
  }

  if (!room) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge className={room.status === "active" ? "bg-green-500" : "bg-yellow-500"}>
              {room.status === "active" ? "En cours" : "En attente"}
            </Badge>
            {isConnected && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Connecté
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Auction Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{room.name}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">{room.currentBid.toLocaleString()} €</div>
                    <p className="text-sm text-gray-600">Enchère actuelle</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2 flex items-center justify-center gap-2">
                      <Clock className="h-6 w-6" />
                      {timeLeft}
                    </div>
                    <p className="text-sm text-gray-600">Temps restant</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2 flex items-center justify-center gap-2">
                      <Users className="h-6 w-6" />
                      {room.participants}
                    </div>
                    <p className="text-sm text-gray-600">Participants</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Place Bid */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Placer une enchère
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      type="number"
                      placeholder={`Minimum: ${getMinBidAmount()} €`}
                      value={newBidAmount}
                      onChange={(e) => setNewBidAmount(e.target.value)}
                      min={getMinBidAmount()}
                    />
                    <p className="text-sm text-gray-600 mt-2">
                      Enchère minimum: {getMinBidAmount().toLocaleString()} €
                    </p>
                  </div>
                  <Button
                    onClick={handlePlaceBid}
                    disabled={!newBidAmount || Number.parseFloat(newBidAmount) <= room.currentBid}
                    className="px-8"
                  >
                    Enchérir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bid History */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Historique des enchères
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]" ref={scrollAreaRef}>
                  <div className="p-4 space-y-4">
                    {bids.map((bid, index) => (
                      <div key={bid.id}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {bid.userName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-sm">{bid.userName}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(bid.timestamp).toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-green-600">{bid.amount.toLocaleString()} €</p>
                            {index === 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Gagnant
                              </Badge>
                            )}
                          </div>
                        </div>
                        {index < bids.length - 1 && <Separator className="mt-4" />}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
