const request = require('supertest');
const { app, server } = require('../server');
const { Server } = require('socket.io-client');

describe('Server API Integration Tests', () => {
  afterAll((done) => {
    server.close(done);
  });

  test('GET /api/health returns status ok', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  test('POST /api/sessions creates a new session', async () => {
    const response = await request(app).post('/api/sessions');
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('sessionId');
    expect(response.body).toHaveProperty('session');
    expect(response.body.session).toHaveProperty('code');
    expect(response.body.session).toHaveProperty('language');
  });

  test('GET /api/sessions/:id returns session data', async () => {
    // First create a session
    const createResponse = await request(app).post('/api/sessions');
    const { sessionId } = createResponse.body;

    // Then fetch it
    const getResponse = await request(app).get(`/api/sessions/${sessionId}`);
    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty('session');
    expect(getResponse.body.session.id).toBe(sessionId);
  });

  test('GET /api/sessions/:id returns 404 for non-existent session', async () => {
    const response = await request(app).get('/api/sessions/non-existent-id');
    expect(response.status).toBe(404);
  });
});

describe('Socket.IO Integration Tests', () => {
  let clientSocket1;
  let clientSocket2;
  let sessionId;

  beforeAll(async () => {
    // Create a session first
    const response = await request(app).post('/api/sessions');
    sessionId = response.body.sessionId;
  });

  beforeEach((done) => {
    // Create two client sockets
    clientSocket1 = new Server('http://localhost:3000');
    clientSocket2 = new Server('http://localhost:3000');
    
    clientSocket1.on('connect', () => {
      clientSocket2.on('connect', () => {
        done();
      });
    });
  });

  afterEach(() => {
    clientSocket1.disconnect();
    clientSocket2.disconnect();
  });

  afterAll((done) => {
    server.close(done);
  });

  test('Clients can join a session', (done) => {
    clientSocket1.emit('join-session', { sessionId, username: 'User1' });
    
    clientSocket1.on('user-joined', ({ participant }) => {
      expect(participant.username).toBe('User1');
      done();
    });
  });

  test('Code changes are broadcast to other clients', (done) => {
    const testCode = 'console.log("Hello, World!");';
    
    // First client joins and changes code
    clientSocket1.emit('join-session', { sessionId, username: 'User1' });
    
    clientSocket1.on('user-joined', () => {
      // Second client joins
      clientSocket2.emit('join-session', { sessionId, username: 'User2' });
      
      clientSocket2.on('user-joined', () => {
        // First client changes code
        clientSocket1.emit('code-change', { sessionId, code: testCode });
        
        // Second client should receive the update
        clientSocket2.on('code-update', ({ code }) => {
          expect(code).toBe(testCode);
          done();
        });
      });
    });
  });

  test('Language changes are broadcast to all clients', (done) => {
    const newLanguage = 'python';
    
    // First client joins and changes language
    clientSocket1.emit('join-session', { sessionId, username: 'User1' });
    
    clientSocket1.on('user-joined', () => {
      // Second client joins
      clientSocket2.emit('join-session', { sessionId, username: 'User2' });
      
      clientSocket2.on('user-joined', () => {
        // First client changes language
        clientSocket1.emit('language-change', { sessionId, language: newLanguage });
        
        // Both clients should receive the update
        clientSocket2.on('language-update', ({ language }) => {
          expect(language).toBe(newLanguage);
          done();
        });
      });
    });
  });
});