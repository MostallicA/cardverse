import { createServer, Server as HttpServer } from 'http';
import { SocketManager } from '../../socket';

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
      data: {},
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
