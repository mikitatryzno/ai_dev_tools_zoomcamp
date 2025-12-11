import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import CodeEditor from '../components/CodeEditor';
import ParticipantsList from '../components/ParticipantsList';
import LanguageSelector from '../components/LanguageSelector';
import CodeExecutor from '../components/CodeExecutor';
import '../styles/SessionPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function SessionPage() {
  const { sessionId } = useParams();
  const query = useQuery();
  const navigate = useNavigate();
  
  const [session, setSession] = useState(null);
  const [code, setCode] = useState('// Loading...');
  const [language, setLanguage] = useState('javascript');
  const [participants, setParticipants] = useState([]);
  const [username, setUsername] = useState(query.get('username') || '');
  const [isJoining, setIsJoining] = useState(true);
  const [error, setError] = useState(null);
  
  const socketRef = useRef(null);
  const codeChangeTimeoutRef = useRef(null);
  
  // Initialize and connect to the session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // Fetch session data
        const response = await axios.get(`${API_URL}/sessions/${sessionId}`);
        setSession(response.data.session);
        setCode(response.data.session.code);
        setLanguage(response.data.session.language);
        
        // Connect to socket
        const socket = io(SOCKET_URL);
        socketRef.current = socket;
        
        // Socket event handlers
        socket.on('connect', () => {
          console.log('Connected to server');
          socket.emit('join-session', { sessionId, username });
        });
        
        socket.on('user-joined', ({ participant, participants }) => {
          console.log('User joined:', participant);
          setParticipants(participants);
        });
        
        socket.on('user-left', ({ participantId }) => {
          setParticipants(prev => prev.filter(p => p.id !== participantId));
        });
        
        socket.on('code-update', ({ code: newCode }) => {
          setCode(newCode);
        });
        
        socket.on('language-update', ({ language: newLanguage }) => {
          setLanguage(newLanguage);
        });
        
        socket.on('error', ({ message }) => {
          setError(message);
        });
        
        setIsJoining(false);
        
        // Cleanup function
        return () => {
          if (codeChangeTimeoutRef.current) {
            clearTimeout(codeChangeTimeoutRef.current);
          }
          socket.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setError('Session not found or server error');
        setIsJoining(false);
      }
    };
    
    if (sessionId) {
      initializeSession();
    }
  }, [sessionId, username]);
  
  // Handle code changes with debounce
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    
    if (codeChangeTimeoutRef.current) {
      clearTimeout(codeChangeTimeoutRef.current);
    }
    
    codeChangeTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.emit('code-change', { sessionId, code: newCode });
      }
    }, 500); // Debounce time: 500ms
  };
  
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socketRef.current) {
      socketRef.current.emit('language-change', { sessionId, language: newLanguage });
    }
  };
  
  const copySessionLink = () => {
    const url = `${window.location.origin}/session/${sessionId}`;
    navigator.clipboard.writeText(url);
    alert('Session link copied to clipboard!');
  };
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/')}>Back to Home</button>
      </div>
    );
  }
  
  if (isJoining) {
    return (
      <div className="loading-container">
        <h2>Joining session...</h2>
      </div>
    );
  }
  
  return (
    <div className="session-container">
      <div className="session-header">
        <h2>Code Interview Session</h2>
        <div className="session-actions">
          <button onClick={copySessionLink}>Copy Session Link</button>
          <LanguageSelector 
            language={language} 
            onLanguageChange={handleLanguageChange} 
          />
        </div>
      </div>
      
      <div className="session-content">
        <div className="editor-container">
          <CodeEditor 
            code={code} 
            language={language}
            onChange={handleCodeChange} 
          />
        </div>
        
        <div className="sidebar">
          <ParticipantsList participants={participants} />
          <CodeExecutor code={code} language={language} />
        </div>
      </div>
    </div>
  );
}

export default SessionPage;