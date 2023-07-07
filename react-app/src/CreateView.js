import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

import { storePaste } from 'pastecat-utils/firebase.js';

import { alertBox, choiceBox } from './ConfirmBox.js';

import './App.css';

const CreateView = () => {
  const navigate = useNavigate();

  const defaultPasteName = "untitled_pastecat";
  const defaultLanguage = "select-language";
  const plainTextLanguage = "plaintext";

  const supportedLanguages = [
    ...SyntaxHighlighter.supportedLanguages,
    plainTextLanguage,
  ].sort();

  const [pasteName, setPasteName] = useState(defaultPasteName);
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState(defaultLanguage);
  const [pasteId, setPasteId] = useState("");

  const handleGenerate = async () => {
    if (content === "") {
      alertBox("🐈 PasteCat says:", "Cannot create empty paste!");
    } else {
      choiceBox(
        "🐈 PasteCat kindly asks:",
        "Are you done editing?",
        handleStorePaste,
      );
    }
  };

  const handleStorePaste = async () => {
    try {
      const newPasteId = await storePaste(
        pasteName,
        language === defaultLanguage ? plainTextLanguage : language,
        content,
      );
      setPasteId(newPasteId);
      navigate("/?p=" + newPasteId);
    } catch (error) {
      switch (error.code) {
        case 'storage/canceled':
          console.error("Generation cancelled.");
          break;
        case 'storage/server-file-wrong-size':
          console.error("File size mismatch, try uploading again.");
          break;
        default:
          console.error("An unknown error occurred.");
          break;
      }
    }
  };

  return (
    <div className="App">
      <div className="code-box">
        <h1>PasteCat <a href="/create/">🐿️ 🐖</a></h1>
        <p>Brought to you by 🍳 and 🍓 with ❤️</p>
        <div className="containers">
          <div className="container-label">
            <span className="container-checkbox">✍️</span>
            <select
              id="language"
              className="container-dropdown"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value={defaultLanguage}>Select a language</option>
              {supportedLanguages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div className="container-label" onClick={handleGenerate}>
            <span className="container-checkbox">🐈</span>
            <span className="container-text">Generate your PasteCat!</span>
          </div>
        </div>
        <div className="paste-inputs">
          <div className="name-input-row">
            <input
              id="paste-name"
              type="text"
              className="name-input"
              placeholder={defaultPasteName}
              onChange={(e) => setPasteName(e.target.value)}
            />
          </div>
          <div className="code-input-row">
            <textarea
              id="paste-content"
              type="text"
              className="code-input"
              placeholder="Enter your paste here"
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateView;
