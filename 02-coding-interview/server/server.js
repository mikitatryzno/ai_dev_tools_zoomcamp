const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com' 
      : 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Store active sessions in memory (in production, use Redis or another database)
const sessions = new Map();

// API routes
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.post('/api/sessions', (req, res) => {
  const sessionId = uuidv4();
  const newSession = {
    id: sessionId,
    code: '// Write your code here\n',
    language: 'javascript',
    createdAt: new Date(),
    participants: []
  };
  
  sessions.set(sessionId, newSession);
  res.status(201).json({ sessionId, session: newSession });
});

app.get('/api/sessions/:id', (req, res) => {
  const { id } = req.params;
  const session = sessions.get(id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.status(200).json({ session });
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join-session', ({ sessionId, username }) => {
    const session = sessions.get(sessionId);
    
    if (!session) {
      socket.emit('error', { message: 'Session not found' });
      return;
    }
    
    // Add user to session
    const participant = {
      id: socket.id,
      username: username || `User-${socket.id.substring(0, 5)}`
    };
    
    session.participants.push(participant);
    socket.join(sessionId);
    
    // Notify everyone in the room
    io.to(sessionId).emit('user-joined', { participant, participants: session.participants });
    
    // Send current code to the new user
    socket.emit('code-update', { code: session.code, language: session.language });
    
    console.log(`${participant.username} joined session ${sessionId}`);
  });
  
  socket.on('code-change', ({ sessionId, code }) => {
    const session = sessions.get(sessionId);
    
    if (session) {
      session.code = code;
      // Broadcast to everyone except sender
      socket.to(sessionId).emit('code-update', { code });
    }
  });
  
  socket.on('language-change', ({ sessionId, language }) => {
    const session = sessions.get(sessionId);
    
    if (session) {
      session.language = language;
      io.to(sessionId).emit('language-update', { language });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    // Remove user from all sessions they were part of
    for (const [sessionId, session] of sessions.entries()) {
      const index = session.participants.findIndex(p => p.id === socket.id);
      
      if (index !== -1) {
        const participant = session.participants[index];
        session.participants.splice(index, 1);
        
        // Notify others that user has left
        io.to(sessionId).emit('user-left', { participantId: socket.id });
        
        console.log(`${participant.username} left session ${sessionId}`);
        
        // Clean up empty sessions after some time
        if (session.participants.length === 0) {
          setTimeout(() => {
            if (sessions.has(sessionId) && sessions.get(sessionId).participants.length === 0) {
              sessions.delete(sessionId);
              console.log(`Session ${sessionId} removed due to inactivity`);
            }
          }, 3600000); // 1 hour
        }
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server }; // Export for testing