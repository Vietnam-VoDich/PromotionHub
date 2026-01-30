# Story PH2-004: WebSocket Chat (Socket.io)

## Metadata
- **ID:** PH2-004
- **Title:** WebSocket Chat avec Socket.io
- **Priority:** P2 (Moyenne)
- **Complexity:** Moyenne
- **Sprint:** Phase 2 - Améliorations UX

## Description
Implémenter un système de messagerie temps réel entre advertisers et owners utilisant Socket.io. Inclut les notifications instantanées, indicateurs de frappe, et statut en ligne.

## Acceptance Criteria

### AC1: Messagerie temps réel
- [ ] Messages envoyés/reçus instantanément
- [ ] Pas besoin de rafraîchir la page
- [ ] Historique des messages persisté en DB
- [ ] Support des images (via Cloudinary)

### AC2: Indicateurs de statut
- [ ] "En ligne" / "Hors ligne" pour chaque utilisateur
- [ ] "Dernière connexion il y a X minutes"
- [ ] Indicateur "est en train d'écrire..."

### AC3: Notifications temps réel
- [ ] Badge de messages non lus
- [ ] Notification sonore (optionnelle)
- [ ] Notification navigateur (Web Push existant)

### AC4: Conversations
- [ ] Liste des conversations avec aperçu
- [ ] Tri par date du dernier message
- [ ] Marquer comme lu/non lu
- [ ] Recherche dans les messages

### AC5: Performance
- [ ] Reconnexion automatique si déconnexion
- [ ] Gestion des messages offline (queue)
- [ ] Pagination des anciens messages

## Technical Tasks

### Backend
```
1. [ ] npm install socket.io
2. [ ] Créer socket/index.ts - Configuration Socket.io
3. [ ] Créer socket/handlers/chat.handler.ts
4. [ ] Créer socket/handlers/presence.handler.ts
5. [ ] Middleware auth pour Socket.io (JWT)
6. [ ] Events: 'message:send', 'message:received', 'typing:start', 'typing:stop'
7. [ ] Events: 'user:online', 'user:offline'
8. [ ] Redis adapter pour scaling (optionnel)
9. [ ] Modifier messages.service.ts pour émettre events
```

### Frontend
```
1. [ ] npm install socket.io-client
2. [ ] Créer hooks/useSocket.ts
3. [ ] Créer hooks/useChat.ts
4. [ ] Créer context/SocketContext.tsx
5. [ ] Composant ChatWindow
6. [ ] Composant MessageInput avec typing indicator
7. [ ] Composant ConversationList
8. [ ] Composant OnlineStatus
9. [ ] Intégrer badge dans header
```

### Socket Events
```typescript
// Client → Server
'message:send' → { conversationId, content, type }
'typing:start' → { conversationId }
'typing:stop' → { conversationId }
'message:read' → { messageId }

// Server → Client
'message:new' → { message }
'typing:update' → { conversationId, userId, isTyping }
'user:status' → { userId, status, lastSeen }
'unread:count' → { count }
```

### Prisma Schema Updates
```prisma
model Message {
  // ... existing
  readAt     DateTime?
  type       MessageType @default(TEXT)
}

enum MessageType {
  TEXT
  IMAGE
  SYSTEM
}

model UserPresence {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id])
  isOnline  Boolean  @default(false)
  lastSeen  DateTime @default(now())
  socketId  String?
}
```

## Dependencies
- socket.io (server)
- socket.io-client (client)
- @socket.io/redis-adapter (optionnel, pour scaling)

## Out of Scope
- Appels audio/vidéo
- Partage de fichiers autres que images
- Messages vocaux
- Chiffrement E2E

## Estimation
- Backend Socket.io: 4-5h
- Frontend Chat UI: 6-8h
- Intégration: 2-3h
- Tests: 2h
- **Total: 14-18h**

## Definition of Done
- [ ] Messages temps réel fonctionnels
- [ ] Indicateurs de présence
- [ ] Typing indicators
- [ ] Notifications de nouveaux messages
- [ ] Tests E2E chat
- [ ] Performance: < 100ms latence
