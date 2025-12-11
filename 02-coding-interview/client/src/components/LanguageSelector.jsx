import '../styles/LanguageSelector.css';

function LanguageSelector({ language, onLanguageChange }) {
  const languages = [
    { id: 'javascript', name: 'JavaScript' },
    { id: 'python', name: 'Python' },
  ];
  
  return (
    <div className="language-selector">
      <label htmlFor="language-select">Language:</label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        {languages.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;