import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreateView from './CreateView';
import PasteView from './PasteView';
import NotFoundView from './NotFoundView';

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
