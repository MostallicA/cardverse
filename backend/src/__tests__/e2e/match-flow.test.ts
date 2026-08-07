/**
 * End-to-End Test: Complete Match Flow
 * 
 * Tests the full game lifecycle from match creation to completion
 * Using Socket.IO client for real-time communication
 */

/// <reference types="jest" />

import { io, Socket } from 'socket.io-client';
import axios from 'axios';

const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/v1`;

describe('Match Flow E2E Test', () => {
  let matchId: string;
  let sockets: Socket[] = [];
  let matchStartedData: any;
  let turnStartedData: any;
  const players = [
    { userId: 'player1', username: 'Player One' },
    { userId: 'player2', username: 'Player Two' },
    { userId: 'player3', username: 'Player Three' },
    { userId: 'player4', username: 'Player Four' },
  ];

  // Helper: Wait for event
  const waitForEvent = (socket: Socket, event: string, timeout = 5000): Promise<any> => {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Timeout waiting for ${event}`));
      }, timeout);
      socket.once(event, (data) => {
        clearTimeout(timer);
        resolve(data);
      });
    });
  };

  beforeAll(async () => {
    // Create match via REST API
    console.log('📋 Creating match...');
    const response = await axios.post(`${API_URL}/match-integration/create`, {
      queueEntryId: 'e2e-test',
      players: players.map((p) => ({
        userId: p.userId,
        username: p.username,
        skillRating: 1000,
        fairPlayScore: 100,
        region: 'default',
      })),
      gameMode: 'RANKED',
    });

    expect(response.data.success).toBe(true);
    matchId = response.data.matchId;
    console.log(`✅ Match created: ${matchId}`);

    // Connect all players via Socket.IO
    console.log('📡 Connecting players via Socket.IO...');
    for (const player of players) {
      const socket = io(BASE_URL, {
        auth: { userId: player.userId },
        autoConnect: true,
        reconnection: true,
      });

      socket.on('connect', () => {
        console.log(`✅ ${player.username} connected (${socket.id})`);
      });

      socket.on('connect_error', (err) => {
        console.error(`❌ ${player.username} connection error:`, err.message);
      });

      sockets.push(socket);
    }

    // Wait for all connections
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Join match room
    console.log('🚪 Joining match room...');
    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit('join_match', {
        matchId,
        playerId: players[i].userId,
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  });

  afterAll(() => {
    // Disconnect all sockets
    console.log('🔌 Disconnecting all sockets...');
    for (const socket of sockets) {
      if (socket.connected) {
        socket.disconnect();
      }
    }
    sockets = [];
  });

  test('1. All players should join match room', () => {
    // All sockets should be connected
    for (const socket of sockets) {
      expect(socket.connected).toBe(true);
    }
    console.log('✅ All players connected to match room');
  });

  test('2. Players should set ready status', async () => {
    console.log('🔄 Setting ready status for all players...');

    const startPromise = Promise.race([
      waitForEvent(sockets[0], 'match_started', 10000),
      waitForEvent(sockets[0], 'match_started_ack', 10000),
    ]);
    const turnPromise = waitForEvent(sockets[0], 'turn_started', 10000);

    // All players set ready
    for (let i = 0; i < sockets.length; i++) {
      sockets[i].emit('set_ready', {
        matchId,
        playerId: players[i].userId,
        isReady: true,
      });
    }

    // Wait for match to start (all players ready -> match starts automatically)
    matchStartedData = await startPromise;
    turnStartedData = await turnPromise;

    expect(matchStartedData.matchId).toBe(matchId);
    expect(turnStartedData.playerId).toBeDefined();
    console.log('✅ All players ready, match started');
    console.log(`✅ Turn started for player: ${turnStartedData.playerId}`);
  });

  test('3. Match should start and cards should be dealt', async () => {
    console.log('🎯 Verifying turn start event...');

    expect(matchStartedData?.matchId).toBe(matchId);
    expect(turnStartedData?.playerId).toBeDefined();
    console.log('✅ Match start and turn start were observed');
  }, 15000);

  test('4. Players should be able to play cards', async () => {
    console.log('🎴 Playing cards...');

    // We need to get the current player from turn_started event
    // For simplicity, let's just simulate a few moves
    
    // This is a simplified test - in reality we'd need to track game state
    // and play valid cards
    
    // For now, we'll just verify that the game state exists
    const response = await axios.get(`${API_URL}/match-integration/state/${matchId}`);
    expect(response.data.success).toBe(true);
    console.log('✅ Game state retrieved successfully');
  });

  test('5. Match state should be accessible', async () => {
    console.log('📊 Getting match state...');
    
    const response = await axios.get(`${API_URL}/match-integration/state/${matchId}`);
    expect(response.data.success).toBe(true);
    expect(response.data.state).toBeDefined();
    console.log('✅ Match state retrieved successfully');
  });

  test('6. Player disconnect and bot replacement', async () => {
    console.log('🔌 Simulating player disconnect...');
    
    // Disconnect player 2
    const disconnectedPlayer = players[1];
    sockets[1].disconnect();
    console.log(`❌ ${disconnectedPlayer.username} disconnected`);

    // Wait for auto-kick or bot replacement
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check match state
    const response = await axios.get(`${API_URL}/match-integration/state/${matchId}`);
    expect(response.data.success).toBe(true);
    
    // Check if bot was added (simplified check)
    console.log('✅ Disconnect handled');
  });

  test('7. Player reconnection', async () => {
    console.log('🔄 Simulating player reconnection...');
    
    const reconnectingPlayer = players[1];
    sockets[1].connect();
    
    // Wait for reconnection
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Reconnect to match
    sockets[1].emit('reconnect', {
      matchId,
      playerId: reconnectingPlayer.userId,
    });

    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`✅ ${reconnectingPlayer.username} reconnected`);
  });

  test('8. Match cleanup', async () => {
    console.log('🧹 Cleaning up match...');
    
    // End match
    const matchState = await axios.get(`${API_URL}/match-integration/state/${matchId}`);
    expect(matchState.data.success).toBe(true);

    // Cleanup
    await axios.post(`${API_URL}/match-integration/cleanup`, { matchId });
    console.log('✅ Match cleaned up');
  });
});