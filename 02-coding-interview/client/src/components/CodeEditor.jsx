import { useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { dracula } from '@uiw/codemirror-theme-dracula';
import '../styles/CodeEditor.css';

function CodeEditor({ code, language, onChange }) {
  const editorRef = useRef(null);
  
  const getLanguageExtension = () => {
    switch (language) {
      case 'python':
        return python();
      case 'javascript':
      default:
        return javascript({ jsx: true });
    }
  };
  
  return (
    <div className="code-editor">
      <CodeMirror
        value={code}
        height="100%"
        theme={dracula}
        extensions={[getLanguageExtension()]}
        onChange={onChange}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          syntaxHighlighting: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          defaultKeymap: true,
          searchKeymap: true,
          historyKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
}

export default CodeEditor;