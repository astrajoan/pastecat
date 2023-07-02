import React, { useEffect, useState } from 'react';

import { doc, getDoc } from "firebase/firestore";
import { ref, getBytes, getDownloadURL } from "firebase/storage";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { db, storage } from './Firebase';
import { alertBox } from './ConfirmBox';

import './App.css';

function PasteView() {
  const defaultCodeString = `Welcome to PasteCat!
  
You are presented this plain text because either:
- You are completely new here
- You've entered an invalid paste ID

Please feel free to:
- Create your own paste by clicking the little squirrel or the little pig
- Double check your paste ID to make sure it's the correct one`;

  const pasteBgStyle = { background: "#fdfdfd" };

  const [showLineNumbers, setShowLineNumbers] = useState(false);
  const [pasteName, setPasteName] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("/");
  const [codeString, setCodeString] = useState("");
  const [language, setLanguage] = useState("");

  const fetchPasteStorage = (pastePath) => {
    const storageRef = ref(storage, pastePath);
    getDownloadURL(storageRef).then((url) => {
      setDownloadUrl(url);
    });
    getBytes(storageRef).then((bytes) => {
      const decoder = new TextDecoder("utf-8");
      setCodeString(decoder.decode(bytes).trimEnd());
    });
  };

  const populateDefaultPaste = () => {
    setPasteName("");
    setLanguage("plaintext");
    setDownloadUrl("");
    setCodeString(defaultCodeString);
  };

  const fetchPasteCollection = (pasteId) => {
    if (!pasteId) {
      populateDefaultPaste();
      return;
    }
    getDoc(doc(db, "pastes", pasteId)).then((docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPasteName(data.name);
        setLanguage(data.language);
        fetchPasteStorage(pasteId + "/" + data.name);
      } else {
        console.error("Paste ID " + pasteId + " does not exist!");
        populateDefaultPaste();
      }
    });
  };

  const handleCheckbox = (e) => {
    setShowLineNumbers(e.target.checked);
  };

  const handleClipboard = (e) => {
    navigator.clipboard.writeText(codeString).then(() => {
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
    fetchPasteCollection(pasteId);
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
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default PasteView;
