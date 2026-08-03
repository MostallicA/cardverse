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

// Sub-module exports (will be added as implemented)
// export * from './lobby/lobby.manager';
// export * from './room/room.manager';
// export * from './session/session.manager';
// export * from './disconnect/disconnect.manager';
// export * from './bot/bot.manager';
