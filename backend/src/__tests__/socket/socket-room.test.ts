import { createServer, Server as HttpServer } from 'http';

import { SocketManager } from '../../socket/index.js';

// Mock the database so the unit test does not load the real Prisma client
// (Prisma 7 generates ESM-only code that cannot be loaded in a CJS test run).
jest.mock('../../db/prisma', () => ({
  prisma: {
    match: { update: jest.fn().mockResolvedValue({}) },
  },
}));

describe('SocketManager room handling', () => {
  let server: HttpServer;

  beforeEach(() => {
    server = createServer();
  });

  afterEach(() => {
    server.close();
  });

  it('joins a single normalized room for prefixed match IDs', async () => {
    const manager = new SocketManager(server as any);
    const join = jest.fn().mockResolvedValue(undefined);
    const socket = {
      id: 'socket-1',
      data: { userId: 'player-1' }, // authenticated value injected by the JWT middleware
      join,
      emit: jest.fn(),
      leave: jest.fn(),
    } as any;

    await (manager as any).handleJoinMatch(socket, {
      matchId: 'match_123',
      playerId: 'player-1',
    });

    expect(join).toHaveBeenCalledTimes(1);
    expect(join).toHaveBeenCalledWith('match_123');
  });
});
