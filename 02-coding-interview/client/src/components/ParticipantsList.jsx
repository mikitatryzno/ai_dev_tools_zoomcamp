import '../styles/ParticipantsList.css';

function ParticipantsList({ participants }) {
  return (
    <div className="participants-list">
      <h3>Participants ({participants.length})</h3>
      <ul>
        {participants.map((participant) => (
          <li key={participant.id}>
            {participant.username}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ParticipantsList;