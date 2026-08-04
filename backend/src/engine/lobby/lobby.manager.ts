// Lobby Manager - Manages pre-match lobby state
// Per ARCHITECTURE.md Section 3.2

import { Player } from '../engine.types';

export interface LobbyConfig {
  maxPlayers: number; // 4 for Hokm
  readyTimeoutMs: number; // Time to wait for all players to be ready
  hostSettings: {
    allowSpectators: boolean;
    gameMode?: string;
  };
}

export interface LobbyPlayer extends Player {
  isReady: boolean;
  readyAt?: Date;
}

export interface Lobby {
  id: string;
  matchId: string;
  hostId: string;
  players: LobbyPlayer[];
  config: LobbyConfig;
  status: 'waiting' | 'ready' | 'starting' | 'closed';
  createdAt: Date;
  startedAt?: Date;
}

export class LobbyManager {
  private lobbies: Map<string, Lobby> = new Map();
  private config: LobbyConfig;

  constructor(config: LobbyConfig) {
    this.config = config;
  }

  /**
   * Creates a new lobby for a match
   */
  createLobby(lobbyId: string, matchId: string, hostId: string, hostUsername: string): Lobby {
    const host: LobbyPlayer = {
      id: hostId,
      userId: hostId,
      username: hostUsername,
      seatIndex: 0,
      teamId: 0,
      isActive: true,
      isBot: false,
      consecutiveMisses: 0,
      isReady: false,
    };

    const lobby: Lobby = {
      id: lobbyId,
      matchId,
      hostId,
      players: [host],
      config: { ...this.config },
      status: 'waiting',
      createdAt: new Date(),
    };

    this.lobbies.set(lobbyId, lobby);
    console.log(`[LobbyManager] Lobby ${lobbyId} created for match ${matchId}`);
    return lobby;
  }

  /**
   * Adds a player to a lobby
   */
  addPlayer(lobbyId: string, player: Omit<LobbyPlayer, 'isReady' | 'readyAt'>): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    if (lobby.players.length >= this.config.maxPlayers) {
      throw new Error('Lobby is full');
    }

    if (lobby.status !== 'waiting') {
      throw new Error('Lobby is not accepting new players');
    }

    // Find available seat (0-3)
    const usedSeats = new Set(lobby.players.map((p) => p.seatIndex));
    let seatIndex = -1;
    for (let i = 0; i < this.config.maxPlayers; i++) {
      if (!usedSeats.has(i)) {
        seatIndex = i;
        break;
      }
    }

    if (seatIndex === -1) {
      throw new Error('No available seats');
    }

    // Assign team based on opposite seating rule
    // Seats 0&2 = Team 0, Seats 1&3 = Team 1
    const teamId = seatIndex % 2 === 0 ? 0 : 1;

    const newPlayer: LobbyPlayer = {
      ...player,
      seatIndex,
      teamId,
      isReady: false,
    };

    lobby.players.push(newPlayer);
    this.lobbies.set(lobbyId, lobby);

    console.log(
      `[LobbyManager] Player ${player.username} joined lobby ${lobbyId} (seat ${seatIndex})`
    );
    return lobby;
  }

  /**
   * Removes a player from a lobby
   */
  removePlayer(lobbyId: string, playerId: string): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const playerIndex = lobby.players.findIndex((p) => p.id === playerId);
    if (playerIndex === -1) return null;

    // Check if player is host
    if (lobby.hostId === playerId) {
      // If host leaves, transfer host to next player or close lobby
      const remainingPlayers = lobby.players.filter((p) => p.id !== playerId);
      if (remainingPlayers.length > 0) {
        lobby.hostId = remainingPlayers[0].id;
      } else {
        lobby.status = 'closed';
        this.lobbies.delete(lobbyId);
        return lobby;
      }
    }

    lobby.players.splice(playerIndex, 1);
    this.lobbies.set(lobbyId, lobby);

    console.log(`[LobbyManager] Player ${playerId} left lobby ${lobbyId}`);
    return lobby;
  }

  /**
   * Updates a player's ready status
   */
  setPlayerReady(lobbyId: string, playerId: string, isReady: boolean): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    const player = lobby.players.find((p) => p.id === playerId);
    if (!player) return null;

    player.isReady = isReady;
    player.readyAt = isReady ? new Date() : undefined;
    this.lobbies.set(lobbyId, lobby);

    // Check if all players are ready
    if (this.areAllPlayersReady(lobby)) {
      lobby.status = 'ready';
      this.lobbies.set(lobbyId, lobby);
      console.log(`[LobbyManager] All players ready in lobby ${lobbyId}`);
    }

    return lobby;
  }

  /**
   * Checks if all players in a lobby are ready
   */
  areAllPlayersReady(lobby: Lobby): boolean {
    return lobby.players.every((p) => p.isReady);
  }

  /**
   * Checks if a lobby has enough players to start
   */
  isLobbyFull(lobby: Lobby): boolean {
    return lobby.players.length >= this.config.maxPlayers;
  }

  /**
   * Starts the lobby (moves to starting state)
   */
  startLobby(lobbyId: string): Lobby | null {
    const lobby = this.lobbies.get(lobbyId);
    if (!lobby) return null;

    if (!this.areAllPlayersReady(lobby)) {
      throw new Error('Not all players are ready');
    }

    if (!this.isLobbyFull(lobby)) {
      throw new Error('Lobby is not full');
    }

    lobby.status = 'starting';
    lobby.startedAt = new Date();
    this.lobbies.set(lobbyId, lobby);

    console.log(`[LobbyManager] Lobby ${lobbyId} starting`);
    return lobby;
  }

  /**
   * Closes a lobby (after match starts or is cancelled)
   */
  closeLobby(lobbyId: string): void {
    const lobby = this.lobbies.get(lobbyId);
    if (lobby) {
      lobby.status = 'closed';
      this.lobbies.set(lobbyId, lobby);
      console.log(`[LobbyManager] Lobby ${lobbyId} closed`);
    }
  }

  /**
   * Gets a lobby by ID
   */
  getLobby(lobbyId: string): Lobby | undefined {
    return this.lobbies.get(lobbyId);
  }

  /**
   * Gets a lobby by match ID
   */
  getLobbyByMatch(matchId: string): Lobby | undefined {
    for (const [, lobby] of this.lobbies) {
      if (lobby.matchId === matchId) {
        return lobby;
      }
    }
    return undefined;
  }

  /**
   * Gets all lobbies in a specific state
   */
  getLobbiesByStatus(status: Lobby['status']): Lobby[] {
    const result: Lobby[] = [];
    for (const [, lobby] of this.lobbies) {
      if (lobby.status === status) {
        result.push(lobby);
      }
    }
    return result;
  }

  /**
   * Gets all waiting lobbies (not full, not started)
   */
  getWaitingLobbies(): Lobby[] {
    return this.getLobbiesByStatus('waiting');
  }

  /**
   * Gets all active lobbies (ready or starting)
   */
  getActiveLobbies(): Lobby[] {
    return [...this.getLobbiesByStatus('ready'), ...this.getLobbiesByStatus('starting')];
  }

  /**
   * Updates lobby configuration
   */
  updateConfig(config: Partial<LobbyConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): LobbyConfig {
    return { ...this.config };
  }

  /**
   * Cleans up old lobbies (closed for more than 1 hour)
   */
  cleanup(olderThanMs: number = 3600000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, lobby] of this.lobbies) {
      if (lobby.status === 'closed') {
        const age = now - lobby.createdAt.getTime();
        if (age > olderThanMs) {
          toRemove.push(id);
        }
      }
    }

    for (const id of toRemove) {
      this.lobbies.delete(id);
      console.log(`[LobbyManager] Cleaned up old lobby ${id}`);
    }
  }
}

// Export singleton instance with default config
export const lobbyManager = new LobbyManager({
  maxPlayers: 4,
  readyTimeoutMs: 30000, // 30 seconds
  hostSettings: {
    allowSpectators: false,
  },
});
