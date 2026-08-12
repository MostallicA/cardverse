// Room Manager - Manages match rooms and seating
// Per ARCHITECTURE.md Section 3.2

import { Player, Team } from '../engine.types.js';

export interface RoomSeat {
  index: number; // 0-3
  playerId: string | null;
  teamId: number; // 0 or 1 (0: seats 0&2, 1: seats 1&3)
  isOccupied: boolean;
  isBot: boolean;
}

export interface Room {
  id: string;
  matchId: string;
  seats: RoomSeat[];
  players: Player[];
  teams: Team[];
  status: 'waiting' | 'active' | 'completed';
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  /**
   * Creates a new room for a match
   * Per ARCHITECTURE.md: "teammates are always seated directly opposite one another"
   */
  createRoom(matchId: string, players: Player[]): Room {
    if (players.length !== 4) {
      throw new Error('Room requires exactly 4 players');
    }

    // Assign seats based on opposite seating rule
    // Seats 0&2 = Team 0, Seats 1&3 = Team 1
    const seats: RoomSeat[] = players.map((player, index) => ({
      index,
      playerId: player.id,
      teamId: index % 2 === 0 ? 0 : 1,
      isOccupied: true,
      isBot: player.isBot || false,
    }));

    // Create teams
    const team0Players = players.filter(
      (p) => seats.find((s) => s.playerId === p.id)?.teamId === 0
    );
    const team1Players = players.filter(
      (p) => seats.find((s) => s.playerId === p.id)?.teamId === 1
    );

    const teams: Team[] = [
      {
        id: 0,
        players: team0Players,
        setsWon: 0,
        tricksWon: 0,
      },
      {
        id: 1,
        players: team1Players,
        setsWon: 0,
        tricksWon: 0,
      },
    ];

    const room: Room = {
      id: `room_${matchId}`,
      matchId,
      seats,
      players,
      teams,
      status: 'waiting',
      createdAt: new Date(),
    };

    this.rooms.set(room.id, room);
    console.log(`[RoomManager] Room created for match ${matchId}`);
    return room;
  }

  /**
   * Gets a room by ID
   */
  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  /**
   * Gets a room by match ID
   */
  getRoomByMatch(matchId: string): Room | undefined {
    for (const [, room] of this.rooms) {
      if (room.matchId === matchId) {
        return room;
      }
    }
    return undefined;
  }

  /**
   * Gets all rooms
   */
  getAllRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  /**
   * Gets active rooms (not completed)
   */
  getActiveRooms(): Room[] {
    return Array.from(this.rooms.values()).filter((r) => r.status !== 'completed');
  }

  /**
   * Replaces a player with a bot
   * Per RULEBOOK.md Section 12
   */
  replaceWithBot(matchId: string, playerId: string, botPlayer: Player): Room | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    // Find the seat
    const seatIndex = room.seats.findIndex((s) => s.playerId === playerId);
    if (seatIndex === -1) return null;

    // Remove player from players list
    const playerIndex = room.players.findIndex((p) => p.id === playerId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1, botPlayer);
    }

    // Update seat
    room.seats[seatIndex].playerId = botPlayer.id;
    room.seats[seatIndex].isBot = true;

    // Update teams
    const teamId = room.seats[seatIndex].teamId;
    const team = room.teams.find((t) => t.id === teamId);
    if (team) {
      const playerInTeamIndex = team.players.findIndex((p) => p.id === playerId);
      if (playerInTeamIndex !== -1) {
        team.players.splice(playerInTeamIndex, 1, botPlayer);
      }
    }

    this.rooms.set(room.id, room);
    console.log(`[RoomManager] Player ${playerId} replaced with bot in match ${matchId}`);
    return room;
  }

  /**
   * Replaces a bot with a player (reconnection)
   * Per RULEBOOK.md Section 12
   */
  replaceBotWithPlayer(matchId: string, botId: string, player: Player): Room | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    // Find the seat with the bot
    const seatIndex = room.seats.findIndex((s) => s.playerId === botId && s.isBot);
    if (seatIndex === -1) return null;

    // Remove bot from players list
    const botIndex = room.players.findIndex((p) => p.id === botId);
    if (botIndex !== -1) {
      room.players.splice(botIndex, 1, player);
    }

    // Update seat
    room.seats[seatIndex].playerId = player.id;
    room.seats[seatIndex].isBot = false;

    // Update teams
    const teamId = room.seats[seatIndex].teamId;
    const team = room.teams.find((t) => t.id === teamId);
    if (team) {
      const botInTeamIndex = team.players.findIndex((p) => p.id === botId);
      if (botInTeamIndex !== -1) {
        team.players.splice(botInTeamIndex, 1, player);
      }
    }

    this.rooms.set(room.id, room);
    console.log(`[RoomManager] Bot ${botId} replaced with player ${player.id} in match ${matchId}`);
    return room;
  }

  /**
   * Updates room status
   */
  updateRoomStatus(matchId: string, status: Room['status']): Room | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    room.status = status;
    if (status === 'active' && !room.startedAt) {
      room.startedAt = new Date();
    }
    if (status === 'completed') {
      room.completedAt = new Date();
    }

    this.rooms.set(room.id, room);
    return room;
  }

  /**
   * Gets the team for a player
   */
  getPlayerTeam(matchId: string, playerId: string): number | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    const seat = room.seats.find((s) => s.playerId === playerId);
    return seat?.teamId ?? null;
  }

  /**
   * Gets teammates for a player
   */
  getTeammates(matchId: string, playerId: string): Player[] | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    const teamId = this.getPlayerTeam(matchId, playerId);
    if (teamId === null) return null;

    const team = room.teams.find((t) => t.id === teamId);
    return team?.players.filter((p) => p.id !== playerId) ?? null;
  }

  /**
   * Gets opponents for a player
   */
  getOpponents(matchId: string, playerId: string): Player[] | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    const teamId = this.getPlayerTeam(matchId, playerId);
    if (teamId === null) return null;

    const opponentTeamId = teamId === 0 ? 1 : 0;
    const opponentTeam = room.teams.find((t) => t.id === opponentTeamId);
    return opponentTeam?.players ?? null;
  }

  /**
   * Checks if a player is in a room
   */
  isPlayerInRoom(matchId: string, playerId: string): boolean {
    const room = this.getRoomByMatch(matchId);
    if (!room) return false;
    return room.seats.some((s) => s.playerId === playerId);
  }

  /**
   * Gets the seat index for a player
   */
  getPlayerSeat(matchId: string, playerId: string): number | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;

    const seat = room.seats.find((s) => s.playerId === playerId);
    return seat?.index ?? null;
  }

  /**
   * Gets all players in a room
   */
  getPlayers(matchId: string): Player[] | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;
    return room.players;
  }

  /**
   * Gets active players (not bots) in a room
   */
  getHumanPlayers(matchId: string): Player[] | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;
    return room.players.filter((p) => !p.isBot);
  }

  /**
   * Gets bot players in a room
   */
  getBotPlayers(matchId: string): Player[] | null {
    const room = this.getRoomByMatch(matchId);
    if (!room) return null;
    return room.players.filter((p) => p.isBot);
  }

  /**
   * Counts the number of active players in a room
   */
  countActivePlayers(matchId: string): number {
    const room = this.getRoomByMatch(matchId);
    if (!room) return 0;
    return room.players.filter((p) => p.isActive).length;
  }

  /**
   * Removes a room (cleanup)
   */
  removeRoom(matchId: string): boolean {
    const room = this.getRoomByMatch(matchId);
    if (!room) return false;

    this.rooms.delete(room.id);
    console.log(`[RoomManager] Room removed for match ${matchId}`);
    return true;
  }

  /**
   * Cleans up completed rooms older than specified time
   */
  cleanup(olderThanMs: number = 3600000): void {
    const now = Date.now();
    const toRemove: string[] = [];

    for (const [id, room] of this.rooms) {
      if (room.status === 'completed' && room.completedAt) {
        const age = now - room.completedAt.getTime();
        if (age > olderThanMs) {
          toRemove.push(id);
        }
      }
    }

    for (const id of toRemove) {
      this.rooms.delete(id);
      console.log(`[RoomManager] Cleaned up old room ${id}`);
    }
  }

  /**
   * Gets room statistics
   */
  getStats(): { totalRooms: number; activeRooms: number; completedRooms: number } {
    const rooms = Array.from(this.rooms.values());
    return {
      totalRooms: rooms.length,
      activeRooms: rooms.filter((r) => r.status === 'active' || r.status === 'waiting').length,
      completedRooms: rooms.filter((r) => r.status === 'completed').length,
    };
  }
}

// Export singleton instance
export const roomManager = new RoomManager();
