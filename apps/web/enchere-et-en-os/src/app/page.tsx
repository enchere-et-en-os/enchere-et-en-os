'use client';
import Image from "next/image";
import Keycloak, {KeycloakProfile} from 'keycloak-js';
import {useEffect, useRef, useState} from "react";

export default function Home() {
    const keycloak = useRef<Keycloak.KeycloakInstance>(new Keycloak({
        url: 'http://localhost:8080/',
        realm: 'enchere',
        clientId: 'front'
    }));
    const [user, setUser] = useState<KeycloakProfile | null>(null);

    useEffect(() => {
        keycloak.current.init({onLoad: 'login-required', checkLoginIframe: false}).then(() => {
            keycloak.current.loadUserProfile().then((user) => {
                setUser(user);
            });
        }).catch(() => {
            console.log('Échec de l\'initialisation de Keycloak');
        });
    }, []);

    const logout = (): void => {
        keycloak.current.logout({redirectUri: "http://localhost:3000/"}).then(r => console.log(r));
    }

    return (
        <div
            className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <Image
                    className="dark:invert"
                    src="/next.svg"
                    alt="Next.js logo"
                    width={180}
                    height={38}
                    priority
                />
                <p className="mb-2 tracking-[-.01em]">
                    Welcome {user?.firstName} {user?.lastName}
                </p>

                <div className="flex gap-4 items-center flex-col sm:flex-row">
                    <a
                        className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
                        onClick={() => logout()}
                        rel="noopener noreferrer"
                    >
                        Logout
                    </a>
                </div>
            </main>
        </div>
    );
}
