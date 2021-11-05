import React from 'react';
import './App.css';
import {BrowserRouter, Switch} from 'react-router-dom';
import NavBar from './components/nav/NavBar';
import {AuthProvider} from './hooks/useAuth';
import AuthenticatedRoute from './components/authn/AuthenticatedRoute';
import UnauthenticatedOnlyRoute from './components/authn/UnauthenticatedOnlyRoute';
import LoginPage from './pages/LoginPage';

function App() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <Switch>
            <UnauthenticatedOnlyRoute path="/login">
              <LoginPage/>
            </UnauthenticatedOnlyRoute>
            <AuthenticatedRoute path="/about">
              <AboutPage/>
            </AuthenticatedRoute>
            <AuthenticatedRoute path="/">
              <HomePage/>
            </AuthenticatedRoute>
          </Switch>
        </BrowserRouter>
      </AuthProvider>
  );
}

function HomePage() {
  return (<><NavBar/><h2>Home</h2></>);
}

function AboutPage() {
  return (<><NavBar/><h2>About Page</h2></>);
}

export default App;
