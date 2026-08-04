// Engine Layer - Entry Point
// Exports all engine components for use by other modules

// Shared Types
export * from './engine.types';

// Main Service
export { engineService, EngineService } from './engine.service';

// Card Engine & Rule Executor
export { cardEngine, CardEngine } from './card/card.engine';
export { ruleExecutor, RuleExecutor } from './card/rule.executor';

// Turn Manager
export { turnManager, TurnManager } from './turn/turn.manager';
export * from './turn/turn.types';

// Disconnect Manager
export { disconnectManager, DisconnectManager } from './disconnect/disconnect.manager';
export type { DisconnectConfig, DisconnectEvent } from './disconnect/disconnect.manager';

// Bot Manager
export { botManager, BotManager } from './bot/bot.manager';
export type { BotManagerConfig } from './bot/bot.manager';

// Lobby Manager
export { lobbyManager, LobbyManager } from './lobby/lobby.manager';
export type { Lobby, LobbyConfig, LobbyPlayer } from './lobby/lobby.manager';

// Room Manager
export { roomManager, RoomManager } from './room/room.manager';
export type { Room, RoomSeat } from './room/room.manager';

// Session Manager
export { sessionManager, SessionManager } from './session/session.manager';
export type { Session } from './session/session.manager';
