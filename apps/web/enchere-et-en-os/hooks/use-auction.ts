// "use client"

// // Hook personnalisé pour gérer l'état des enchères

// import { useState, useEffect, useCallback } from "react"
// import { auctionAPI } from "@/lib/api"
// import { auctionWS } from "@/lib/websocket"

// export interface AuctionRoom {
//   id: string
//   name: string
//   description: string
//   status: "active" | "pending" | "closed"
//   participants: number
//   currentBid: number
//   startingBid: number
//   endTime: string
//   createdBy: string
// }

// export interface Bid {
//   id: string
//   userId: string
//   userName: string
//   amount: number
//   timestamp: string
// }

// export function useAuction(roomId?: string) {
//   const [rooms, setRooms] = useState<AuctionRoom[]>([])
//   const [currentRoom, setCurrentRoom] = useState<AuctionRoom | null>(null)
//   const [bids, setBids] = useState<Bid[]>([])
//   const [isConnected, setIsConnected] = useState(false)
//   const [loading, setLoading] = useState(false)
//   const [error, setError] = useState<string | null>(null)

//   // Charger les salles
//   const loadRooms = useCallback(async () => {
//     setLoading(true)
//     try {
//       const response = await auctionAPI.getRooms()
//       if (response.success) {
//         setRooms(response.data)
//       } else {
//         setError(response.message || "Erreur lors du chargement des salles")
//       }
//     } catch (err) {
//       setError("Erreur réseau")
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   // Charger une salle spécifique
//   const loadRoom = useCallback(async (id: string) => {
//     setLoading(true)
//     try {
//       const [roomResponse, bidsResponse] = await Promise.all([auctionAPI.getRoom(id), auctionAPI.getBids(id)])

//       if (roomResponse.success) {
//         setCurrentRoom(roomResponse.data)
//       }
//       if (bidsResponse.success) {
//         setBids(bidsResponse.data)
//       }
//     } catch (err) {
//       setError("Erreur lors du chargement de la salle")
//     } finally {
//       setLoading(false)
//     }
//   }, [])

//   // Créer une salle
//   const createRoom = useCallback(
//     async (roomData: any) => {
//       setLoading(true)
//       try {
//         const response = await auctionAPI.createRoom(roomData)
//         if (response.success) {
//           await loadRooms() // Recharger la liste
//           return response.data
//         } else {
//           setError(response.message || "Erreur lors de la création")
//           return null
//         }
//       } catch (err) {
//         setError("Erreur réseau")
//         return null
//       } finally {
//         setLoading(false)
//       }
//     },
//     [loadRooms],
//   )

//   // Rejoindre une salle
//   const joinRoom = useCallback(async (id: string) => {
//     try {
//       const response = await auctionAPI.joinRoom(id)
//       if (response.success) {
//         auctionWS.joinRoom(id)
//         return true
//       } else {
//         setError(response.message || "Erreur lors de la connexion")
//         return false
//       }
//     } catch (err) {
//       setError("Erreur réseau")
//       return false
//     }
//   }, [])

//   // Placer une enchère
//   const placeBid = useCallback(async (roomId: string, amount: number) => {
//     try {
//       const response = await auctionAPI.placeBid({ roomId, amount })
//       if (response.success) {
//         // L'enchère sera mise à jour via WebSocket
//         return true
//       } else {
//         setError(response.message || "Erreur lors de l'enchère")
//         return false
//       }
//     } catch (err) {
//       setError("Erreur réseau")
//       return false
//     }
//   }, [])

//   // Configuration WebSocket
//   useEffect(() => {
//     // Événements WebSocket
//     auctionWS.on("connected", () => setIsConnected(true))
//     auctionWS.on("disconnected", () => setIsConnected(false))

//     auctionWS.on("bid", (bidData: Bid) => {
//       setBids((prev) => [bidData, ...prev])
//       if (currentRoom && bidData.amount > currentRoom.currentBid) {
//         setCurrentRoom((prev) => (prev ? { ...prev, currentBid: bidData.amount } : null))
//       }
//     })

//     auctionWS.on("room_update", (roomData: Partial<AuctionRoom>) => {
//       setCurrentRoom((prev) => (prev ? { ...prev, ...roomData } : null))
//     })

//     return () => {
//       auctionWS.off("connected", () => setIsConnected(true))
//       auctionWS.off("disconnected", () => setIsConnected(false))
//       auctionWS.off("bid", () => {})
//       auctionWS.off("room_update", () => {})
//     }
//   }, [currentRoom])

//   // Charger les données initiales
//   useEffect(() => {
//     if (roomId) {
//       loadRoom(roomId)
//     } else {
//       loadRooms()
//     }
//   }, [roomId, loadRoom, loadRooms])

//   return {
//     rooms,
//     currentRoom,
//     bids,
//     isConnected,
//     loading,
//     error,
//     createRoom,
//     joinRoom,
//     placeBid,
//     loadRooms,
//     loadRoom,
//     clearError: () => setError(null),
//   }
// }
