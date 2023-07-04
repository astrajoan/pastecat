import React, { useEffect, useState } from 'react';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getPaste, getPasteCollection } from 'firebase-utils';
import { alertBox } from './ConfirmBox';

import './App.css';

function PasteView() {
  const defaultContent = `Welcome to PasteCat!
  
You are presented this plain text because either:
- You are completely new here
- You've entered an invalid paste ID

Please feel free to:
- Create your own paste by clicking the little squirrel or the little pig
- Double check your paste ID to make sure it's the correct one`;

  const pasteBgStyle = { background: "#fdfdfd" };

  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [pasteName, setPasteName] = useState("");
  const [language, setLanguage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [content, setContent] = useState("");

  const populateDefaultPaste = () => {
    setPasteName("");
    setLanguage("plaintext");
    setDownloadUrl("");
    setContent(defaultContent);
  };

  const fetchPasteFromFirebase = (pasteId) => {
    if (!pasteId) {
      populateDefaultPaste();
    } else {
      getPasteCollection(pasteId)
        .then((docData) => {
          setPasteName(docData.pasteName);
          setLanguage(docData.language);
          getPaste(pasteId, docData.pasteName).then((storageData) => {
            setDownloadUrl(storageData.downloadUrl);
            setContent(storageData.content);
          });
        })
        .catch((error) => {
          console.error(error);
          populateDefaultPaste();
        });
    }
  };

  const handleCheckbox = (e) => {
    setShowLineNumbers(e.target.checked);
  };

  const handleClipboard = (e) => {
    navigator.clipboard.writeText(content).then(() => {
      alertBox("🐈 PasteCat says:", "Copied current paste to clipboard!");
    });
  };

  const renderDownloadLink = () => {
    if (downloadUrl) {
      return (
        <a className="container-text" href={downloadUrl}>
          Download {pasteName}
        </a>
      );
    }
    return (
      <span className="container-text">Download not available</span>
    )
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pasteId = searchParams.get("p");
    fetchPasteFromFirebase(pasteId);
  });

  return (
    <div className="App">
      <div className="code-box">
        <h1>PasteCat <a href="/create/">🐿️ 🐖</a></h1>
        <p>Brought to you by 🍳 and 🍓 with ❤️</p>
        <div className="containers">
          <div className="container-label" onClick={handleClipboard}>
            <span className="container-checkbox">📎</span>
            <span className="container-text">Copy to clipboard</span>
          </div>
          <div className="container-label">
            <span className="container-checkbox">⏬</span>
            {renderDownloadLink()}
          </div>
          <label className="container-label" htmlFor="checkbox">
            <div className="container-checkbox">
              <input id="checkbox" type="checkbox" onChange={handleCheckbox} />
              <label htmlFor="checkbox" />
            </div>
            <span className="container-text">Show line numbers</span>
          </label>
        </div>
        <SyntaxHighlighter
          language={language}
          style={prism}
          customStyle={pasteBgStyle}
          showLineNumbers={showLineNumbers}
        >
          {content}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default PasteView;
