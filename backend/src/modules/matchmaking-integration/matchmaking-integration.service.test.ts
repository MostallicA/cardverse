import { MatchmakingIntegrationService } from './matchmaking-integration.service';
import { lobbyManager } from '../../engine/lobby/lobby.manager';

describe('MatchmakingIntegrationService', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('starts the match when the lobby reaches the ready state', () => {
    const service = new MatchmakingIntegrationService({
      defaultTotalSetsToWin: 7,
      defaultTurnTimeoutMs: 8000,
      defaultDeclarationTimeoutMs: 20000,
      botReplacementEnabled: true,
      coinPenaltyAmount: 0,
    });

    const startMatchSpy = jest.spyOn(service, 'startMatch').mockReturnValue(true);

    const matchId = `match_test_${Date.now()}`;
    lobbyManager.createLobby(matchId, matchId, 'host', 'Host');
    lobbyManager.addPlayer(matchId, {
      id: 'p2',
      userId: 'p2',
      username: 'Player2',
      seatIndex: 1,
      teamId: 1,
      isActive: true,
      isBot: false,
      consecutiveMisses: 0,
    });
    lobbyManager.addPlayer(matchId, {
      id: 'p3',
      userId: 'p3',
      username: 'Player3',
      seatIndex: 2,
      teamId: 0,
      isActive: true,
      isBot: false,
      consecutiveMisses: 0,
    });
    lobbyManager.addPlayer(matchId, {
      id: 'p4',
      userId: 'p4',
      username: 'Player4',
      seatIndex: 3,
      teamId: 1,
      isActive: true,
      isBot: false,
      consecutiveMisses: 0,
    });

    lobbyManager.setPlayerReady(matchId, 'host', true);
    lobbyManager.setPlayerReady(matchId, 'p2', true);
    lobbyManager.setPlayerReady(matchId, 'p3', true);
    lobbyManager.setPlayerReady(matchId, 'p4', true);

    expect(startMatchSpy).toHaveBeenCalledWith(matchId);

    lobbyManager.closeLobby(matchId);
  });
});
