import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/HomePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

function HomePage() {
  const [isCreating, setIsCreating] = useState(false);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const createNewSession = async () => {
    try {
      setIsCreating(true);
      const response = await axios.post(`${API_URL}/sessions`);
      const { sessionId } = response.data;
      
      // Navigate to the new session
      navigate(`/session/${sessionId}?username=${encodeURIComponent(username || '')}`);
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create a new session. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Code Interview Platform</h1>
        <p>Create a new interview session and share the link with candidates</p>
        
        <div className="form-group">
          <label htmlFor="username">Your Name (optional)</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        
        <button 
          className="create-button"
          onClick={createNewSession}
          disabled={isCreating}
        >
          {isCreating ? 'Creating...' : 'Create New Session'}
        </button>
      </div>
    </div>
  );
}

export default HomePage;