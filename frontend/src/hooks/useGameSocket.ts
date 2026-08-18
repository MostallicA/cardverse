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
} from '../types/game.types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface UseGameSocketOptions {
  matchId?: string;
  playerId?: string;
  onMatchUpdate?: (state: MatchState) => void;
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
    onTurnStart,
    onCardPlayed,
    onError,
    onMatchComplete,
  } = options;

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('[useGameSocket] No auth token found');
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Connection events
    socket.on('connect', () => {
      console.log('[useGameSocket] Connected to server');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[useGameSocket] Disconnected from server');
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[useGameSocket] Connection error:', error);
      setIsConnected(false);
      onError?.({ code: 'CONNECTION_ERROR', message: error.message });
    });

    // Game events
    socket.on('match_updated', (data) => {
      console.log('[useGameSocket] Match updated:', data);
      setMatchState(data.state);
      onMatchUpdate?.(data.state);
    });

    socket.on('turn_started', (data) => {
      console.log('[useGameSocket] Turn started:', data);
      onTurnStart?.(data);
    });

    socket.on('card_played', (data) => {
      console.log('[useGameSocket] Card played:', data);
      onCardPlayed?.(data);
    });

    socket.on('match_completed', (data) => {
      console.log('[useGameSocket] Match completed:', data);
      onMatchComplete?.(data);
    });

    socket.on('error', (data) => {
      console.error('[useGameSocket] Error:', data);
      onError?.(data);
    });

    // Join match room if matchId and playerId are provided
    if (matchId && playerId && socket.connected) {
      socket.emit('join_match', { matchId, playerId });
    }

    // Cleanup
    return () => {
      if (socket.connected) {
        if (matchId && playerId) {
          socket.emit('leave_match', { matchId, playerId });
        }
        socket.disconnect();
      }
    };
  }, [matchId, playerId, onMatchUpdate, onTurnStart, onCardPlayed, onError, onMatchComplete]);

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
  const playCard = useCallback((matchId: string, playerId: string, cardId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('play_card', { matchId, playerId, cardId });
    } else {
      console.warn('[useGameSocket] Cannot play card - socket not connected');
      onError?.({ code: 'NOT_CONNECTED', message: 'Socket not connected' });
    }
  }, [onError]);

  // Declare Hokm
  const declareHokm = useCallback((
    matchId: string,
    playerId: string,
    mode: string,
    suit?: string
  ) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('declare_hokm', { matchId, playerId, mode, suit });
    } else {
      console.warn('[useGameSocket] Cannot declare Hokm - socket not connected');
      onError?.({ code: 'NOT_CONNECTED', message: 'Socket not connected' });
    }
  }, [onError]);

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