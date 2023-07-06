import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreateView from './CreateView.js';
import PasteView from './PasteView.js';
import NotFoundView from './NotFoundView.js';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PasteView />} />
        <Route path="/create/" element={<CreateView />} />
        <Route path="*" element={<NotFoundView />} />
      </Routes>
    </Router>
  );
};

export default App;
