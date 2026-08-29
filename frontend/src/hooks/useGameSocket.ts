/**
 * CardVerse Frontend - Game Socket Hook
 *
 * Custom hook for managing Socket.IO connection and game events
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

import {
  ClientToServerEvents,
  ServerToClientEvents,
  MatchState,
  GameMode,
  Suit,
} from '../types/game.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

/**
 * Module-level socket singleton.
 *
 * We deliberately create the Socket.IO connection OUTSIDE the React lifecycle.
 * React <StrictMode> (dev) invokes effects as mount → cleanup → mount, which —
 * if the socket were created inside `useEffect` — would create TWO sockets for
 * the same authenticated user, and the server would immediately kick the older
 * one with `DUPLICATE_CONNECTION`. Holding the socket at module scope means
 * StrictMode remounts reuse the SAME connection (no duplicates, no ping-pong).
 * The socket is torn down when the page/app itself is closed.
 */
let socketSingleton: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let registeredHandlers = false;
let singletonToken: string | null = null;

function getOrCreateSocket(): Socket<ServerToClientEvents, ClientToServerEvents> | null {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    console.error('[useGameSocket] No auth token found');
    return null;
  }

  // Reuse an existing socket for the SAME token; don't create a second connection.
  if (socketSingleton && singletonToken === token) {
    return socketSingleton;
  }

  // If the token changed, tear down the old socket before creating a new one.
  if (socketSingleton) {
    try {
      socketSingleton.disconnect();
    } catch {
      /* ignore */
    }
    socketSingleton = null;
    registeredHandlers = false;
  }

  const socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    // IMPORTANT: reconnection must be DISABLED. If left enabled, this client
    // automatically retries after the server kicks it for DUPLICATE_CONNECTION,
    // causing an endless ping-pong with the other tab/device.
    reconnection: false,
    reconnectionAttempts: 0,
    reconnectionDelay: 1000,
  });

  socketSingleton = socket;
  singletonToken = token;
  registeredHandlers = false;
  return socket;
}

interface UseGameSocketOptions {
  matchId?: string;
  playerId?: string;
  onMatchUpdate?: (state: MatchState) => void;
  onMatchCreated?: (data: { matchId: string; players: any[] }) => void;
  onMatchStarted?: (data: { matchId: string; config: any }) => void;
  onTurnStart?: (data: { playerId: string; timeoutMs: number }) => void;
  onCardPlayed?: (data: { playerId: string; cardId: string; trick: any }) => void;
  onError?: (error: { code: string; message: string }) => void;
  onMatchComplete?: (data: { matchId: string; result: any }) => void;
}

export function useGameSocket(options: UseGameSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);

  const {
    matchId,
    playerId,
    onMatchUpdate,
    onMatchCreated,
    onMatchStarted,
    onTurnStart,
    onCardPlayed,
    onError,
    onMatchComplete,
  } = options;

  // Callbacks stored in refs so their identity does NOT change between renders.
  // If the inline functions (e.g. `onMatchUpdate: (state) => ...`) were placed in
  // the useEffect dependency array, the effect would re-run on EVERY render and
  // create a NEW socket each time → old socket disconnects → server sees a
  // duplicate → DUPLICATE_CONNECTION ping-pong. Refs keep the effect stable.
  const onMatchUpdateRef = useRef(onMatchUpdate);
  const onMatchCreatedRef = useRef(onMatchCreated);
  const onMatchStartedRef = useRef(onMatchStarted);
  const onTurnStartRef = useRef(onTurnStart);
  const onCardPlayedRef = useRef(onCardPlayed);
  const onMatchCompleteRef = useRef(onMatchComplete);
  const onErrorRef = useRef(onError);
  onMatchUpdateRef.current = onMatchUpdate;
  onMatchCreatedRef.current = onMatchCreated;
  onMatchStartedRef.current = onMatchStarted;
  onTurnStartRef.current = onTurnStart;
  onCardPlayedRef.current = onCardPlayed;
  onMatchCompleteRef.current = onMatchComplete;
  onErrorRef.current = onError;

  // Initialize socket connection — runs ONCE per app lifetime.
  // Remounts (e.g. React <StrictMode> dev, navigation) reuse the module-level
  // SINGLETON socket, so we never open a second connection for the same token
  // (which would trigger the server's DUPLICATE_CONNECTION).
  useEffect(() => {
    const socket = getOrCreateSocket();
    if (!socket) return;

    socketRef.current = socket;

    // IMPORTANT: the module-level socket may ALREADY be connected (e.g. the
    // Lobby page connected it, then we navigated to Game). The global `connect`
    // event only fires once for the singleton, so a later mount would otherwise
    // keep its own `isConnected` stuck on `false` → permanent "Connecting...".
    // Seed isConnected from the socket's current state on every mount.
    setIsConnected(socket.connected);

    // Register connect/disconnect listeners for THIS instance so its own
    // isConnected stays in sync after the initial seed. (Multiple instances
    // simply add their own listeners; there is still only ONE socket connection,
    // so this never causes a duplicate-connection on the server.)
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // Register global socket handlers only ONCE for the lifetime of this
    // singleton (avoiding double-subscription and repeated state updates).
    if (!registeredHandlers) {
      registeredHandlers = true;

      socket.on('connect_error', error => {
        console.error('[useGameSocket] Connection error:', error);
        setIsConnected(false);
        onErrorRef.current?.({ code: 'CONNECTION_ERROR', message: error.message });
      });

      // Game events
      socket.on('match_updated', data => {
        console.log('[useGameSocket] Match updated:', data);
        setMatchState(data.state);
        onMatchUpdateRef.current?.(data.state);
      });

      socket.on('match_created', data => {
        console.log('[useGameSocket] Match created:', data);
        onMatchCreatedRef.current?.(data);
      });

      socket.on('match_started', data => {
        console.log('[useGameSocket] Match started:', data);
        onMatchStartedRef.current?.(data);
      });

      socket.on('turn_started', data => {
        console.log('[useGameSocket] Turn started:', data);
        onTurnStartRef.current?.(data);
      });

      socket.on('card_played', data => {
        console.log('[useGameSocket] Card played:', data);
        onCardPlayedRef.current?.(data);
      });

      socket.on('match_completed', data => {
        console.log('[useGameSocket] Match completed:', data);
        onMatchCompleteRef.current?.(data);
      });

      socket.on('error', data => {
        console.error('[useGameSocket] Error:', data);
        // If the server kicked this socket because the same user logged in
        // elsewhere, stop this client from reconnecting — no ping-pong loops.
        if (data?.code === 'DUPLICATE_CONNECTION') {
          onErrorRef.current?.(data);
          if (socket.io) {
            socket.io.reconnection(false);
          }
          try {
            socket.disconnect();
          } catch {
            /* already closed */
          }
          return; // don't forward the error downstream (unhandled loop)
        }
        onErrorRef.current?.(data);
      });
    }

    // If this mount provides matchId/playerId and the singleton is connected,
    // (re)join the match room on (re)mount.
    if (matchId && playerId && socket.connected) {
      socket.emit('join_match', { matchId, playerId });
    }

    return () => {
      // Clean up THIS instance's listeners (connect/disconnect) on unmount;
      // the module-level socket itself stays alive for other mounts.
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  // Join match (can be called after connection)
  const joinMatch = useCallback((id: string, pId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('join_match', { matchId: id, playerId: pId });
    } else {
      console.warn('[useGameSocket] Cannot join match - socket not connected');
    }
  }, []);

  // Leave match
  const leaveMatch = useCallback((id: string, pId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('leave_match', { matchId: id, playerId: pId });
    }
  }, []);

  // Play a card
  const playCard = useCallback(
    (matchId: string, playerId: string, cardId: string) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('play_card', { matchId, playerId, cardId });
      } else {
        console.warn('[useGameSocket] Cannot play card - socket not connected');
        onError?.({ code: 'NOT_CONNECTED', message: 'Socket not connected' });
      }
    },
    [onError]
  );

  // Declare Hokm
  const declareHokm = useCallback(
    (matchId: string, playerId: string, mode: GameMode, suit?: Suit) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('declare_hokm', { matchId, playerId, mode, suit });
      } else {
        console.warn('[useGameSocket] Cannot declare Hokm - socket not connected');
        onError?.({ code: 'NOT_CONNECTED', message: 'Socket not connected' });
      }
    },
    [onError]
  );

  // Set ready status
  const setReady = useCallback((matchId: string, playerId: string, isReady: boolean) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('set_ready', { matchId, playerId, isReady });
    } else {
      console.warn('[useGameSocket] Cannot set ready - socket not connected');
    }
  }, []);

  // Send chat message
  const sendChat = useCallback((matchId: string, playerId: string, message: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('send_chat', { matchId, playerId, message });
    } else {
      console.warn('[useGameSocket] Cannot send chat - socket not connected');
    }
  }, []);

  // Reconnect to match
  const reconnect = useCallback((matchId: string, playerId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('reconnect', { matchId, playerId });
    } else {
      console.warn('[useGameSocket] Cannot reconnect - socket not connected');
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    matchState,
    joinMatch,
    leaveMatch,
    playCard,
    declareHokm,
    setReady,
    sendChat,
    reconnect,
  };
}
