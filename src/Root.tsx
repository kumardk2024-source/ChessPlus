import React from 'react';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import './index.css';

export default function Root() {
  return (
    <ThemeProvider>
      <App />
    </ThemeProvider>
  );
}
