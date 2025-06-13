'use client'

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gavel, Users, Trophy, Clock } from "lucide-react"
import Keycloak, {KeycloakProfile} from 'keycloak-js';
import {useEffect, useRef, useState} from "react";

export default function LandingPage() {
    const keycloak = useRef<Keycloak>(new Keycloak({
        url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'https://auth.enchere.mdlh.fr/',
        realm: 'enchere',
        clientId: 'front'
    }));

    const [user, setUser] = useState<KeycloakProfile | null>(null);

    const handleLogin = () => {
      keycloak.current.init({onLoad: 'login-required', checkLoginIframe: false}).then(() => {
        keycloak.current.loadUserProfile().then((user) => {
            setUser(user);
        });
    }).catch(() => {
        console.log('Échec de l\'initialisation de Keycloak');
    });
    }

    const logout = (): void => {
        keycloak.current.logout({redirectUri: "http://localhost:3000/"}).then(r => console.log(r));
    }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">AuctionHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline">Tableau de bord</Button>
            </Link>
              {user ? (
              <Button onClick={() => logout()}>{user?.firstName}</Button>
            ) : (
              <Button onClick={()  => handleLogin()}>Se connecter</Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">Participez aux enchères en temps réel</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Créez ou rejoignez des salles d'enchères, placez vos offres et suivez les résultats en direct. Une
            expérience d'enchères moderne et sécurisée.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button size="lg" className="text-lg px-8 py-3">
                Commencer maintenant
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-3">
              En savoir plus
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Salles collaboratives</CardTitle>
              <CardDescription>Créez ou rejoignez des salles d'enchères avec d'autres participants</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Clock className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Temps réel</CardTitle>
              <CardDescription>Suivez les enchères en direct avec des mises à jour instantanées</CardDescription>
            </CardHeader>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Trophy className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle>Sécurisé</CardTitle>
              <CardDescription>Authentification Keycloak et transactions sécurisées</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}
