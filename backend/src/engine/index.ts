// Engine Layer - Entry Point
// Exports all engine components for use by other modules

// Shared Types
export * from './engine.types.js';

// Main Service
export { engineService, EngineService } from './engine.service.js';

// Card Engine, Rule Executor, and Bot Manager moved to the Game Layer
// (backend/src/game/) — see ARCHITECTURE.md Section 2.3.

// Turn Manager
export { turnManager, TurnManager } from './turn/turn.manager.js';
export * from './turn/turn.types.js';

// Disconnect Manager
export { disconnectManager, DisconnectManager } from './disconnect/disconnect.manager.js';
export type { DisconnectConfig, DisconnectEvent } from './disconnect/disconnect.manager.js';

// Lobby Manager
export { lobbyManager, LobbyManager } from './lobby/lobby.manager.js';
export type { Lobby, LobbyConfig, LobbyPlayer } from './lobby/lobby.manager.js';

// Room Manager
export { roomManager, RoomManager } from './room/room.manager.js';
export type { Room, RoomSeat } from './room/room.manager.js';

// Session Manager
export { sessionManager, SessionManager } from './session/session.manager.js';
export type { Session } from './session/session.manager.js';
