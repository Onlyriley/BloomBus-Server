import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import './App.scss';

import ProtectedRoute from './components/ProtectedRoute';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import FirebaseAuthProvider from './components/FirebaseAuthContext';

class App extends Component {
  render() {
    return (
      // eslint-disable-next-line react/jsx-filename-extension
      <FirebaseAuthProvider>
        <Router>
          <Switch>
            <ProtectedRoute path="/admin-dashboard" component={AdminDashboard} />
            <Route exact path="/login" component={LoginScreen} />
            <Redirect to="/admin-dashboard" />
          </Switch>
        </Router>
      </FirebaseAuthProvider>
    );
  }
}

export default App;
