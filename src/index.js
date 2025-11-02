import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import App from './App';
import SendMessage from './pages/SendMessage';
import ShareView from './components/ShareView';
import PublicMessageView from './components/PublicMessageView';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/send/:username" element={<SendMessage />} />
        <Route path="/share" element={<ShareView />} />
        <Route path="/to/:username" element={<PublicMessageView />} />
      </Routes>
    </Router>
  </React.StrictMode>
);