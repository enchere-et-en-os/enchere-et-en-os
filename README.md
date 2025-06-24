# Enchère et en os

Ce projet est une application web d'enchères en temps réel construite avec une architecture microservices.

## Technologies

- **Monorepo**: PNPM Workspaces
- **Frontend**: Next.js (React), TypeScript, Tailwind CSS
- **Backend**: NestJS, TypeScript
- **Base de données**: PostgreSQL
- **Authentification**: Keycloak
- **Messagerie**: NATS
- **Cache**: Redis
- **Containerisation**: Docker, Docker Compose

## Démarrage

### Avec Docker (recommandé)

Le moyen le plus simple de lancer l'ensemble du projet est d'utiliser Docker Compose.

1.  Assurez-vous d'avoir Docker et Docker Compose installés sur votre machine.
2.  Depuis la racine du projet, lancez la commande suivante :

    ```bash
    docker compose -f docker/docker-compose.yml up -d --build
    ```

Ceci va construire les images et démarrer tous les services, y compris les bases de données, Keycloak, NATS et Redis.

- **Application web**: [http://localhost:3000](http://localhost:3000)
- **API Gateway**: [http://localhost:8000](http://localhost:8000)
- **Keycloak**: [http://localhost:8080](http://localhost:8080) (admin/admin)

### En local (développement)

Si vous souhaitez lancer les services individuellement pour le développement.

1.  **Installer les dépendances**

    Assurez-vous d'avoir `pnpm` d'installé (`npm install -g pnpm`).
    Puis, à la racine du projet :

    ```bash
    pnpm install
    ```

2.  **Démarrer l'infrastructure**

    Vous pouvez utiliser Docker Compose pour ne démarrer que les services d'infrastructure (bases de données, NATS, etc.).

    ```bash
    docker compose -f docker/docker-compose.yml up -d main-db redis nats keycloak keycloak-db web
    ```

3.  **Lancer les applications**

    Ouvrez un terminal pour chaque service et lancez les commandes suivantes depuis la racine du projet.

    ```bash
    pnpm start:dev
    ```

## Scripts utiles

- `pnpm lint:all`: Linter tous les projets.
- `pnpm test:all`: Lancer les tests pour tous les projets.
