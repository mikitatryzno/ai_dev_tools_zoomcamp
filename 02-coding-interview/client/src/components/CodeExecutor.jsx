import { useState } from 'react';
import { usePython } from 'react-py';
import '../styles/CodeExecutor.css';

function CodeExecutor({ code, language }) {
  const [output, setOutput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  
  // For Python execution using WebAssembly
  const { runPython, stdout, stderr, isLoading, isRunning } = usePython();
  
  const executeJavaScript = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      // Create a safe execution environment
      const originalConsoleLog = console.log;
      const logs = [];
      
      // Override console.log to capture output
      console.log = (...args) => {
        logs.push(args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(' '));
      };
      
      // Execute the code in a try-catch block
      try {
        // Use Function constructor to evaluate code
        const executeCode = new Function(code);
        executeCode();
        setOutput(logs.join('\n'));
      } catch (error) {
        setOutput(`Error: ${error.message}`);
      }
      
      // Restore original console.log
      console.log = originalConsoleLog;
    } catch (error) {
      setOutput(`Execution error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };
  
  const executePython = async () => {
    setIsExecuting(true);
    setOutput('');
    
    try {
      await runPython(code);
      // Output will be updated via the usePython hook
    } catch (error) {
      setOutput(`Execution error: ${error.message}`);
    } finally {
      setIsExecuting(false);
    }
  };
  
  const executeCode = async () => {
    if (language === 'javascript') {
      await executeJavaScript();
    } else if (language === 'python') {
      await executePython();
    } else {
      setOutput(`Execution not supported for ${language}`);
    }
  };
  
  // For Python, use stdout and stderr from the hook
  const pythonOutput = stdout || stderr;
  
  return (
    <div className="code-executor">
      <h3>Code Execution</h3>
      
      <button 
        onClick={executeCode}
        disabled={isExecuting || isLoading || isRunning}
        className="execute-button"
      >
        {isExecuting || isRunning ? 'Executing...' : 'Run Code'}
      </button>
      
      {isLoading && <p>Loading Python environment...</p>}
      
      <div className="output-container">
        <h4>Output:</h4>
        <pre className="output">
          {language === 'python' ? pythonOutput : output}
        </pre>
      </div>
    </div>
  );
}

export default CodeExecutor;