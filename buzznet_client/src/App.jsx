import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import PostGrid from './components/PostGrid';
import CreatePost from './components/CreatePost';
import Header from './components/Header';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import SearchPage from './components/SearchPage';

function App() {
  return (

    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<PostGrid />} />
        <Route path="/create" element={<CreatePost />} />
        <Route path="/posts/:id" element={<PostDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  );
}

export default App
