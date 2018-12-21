import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter as Router } from "react-router-dom";
import auth0Config from "./auth0/config/development.json";
import AuthService from "./auth0/service";
import SampleAppWithAuth from "./auth0/SampleAppWithAuth";

// Initialize Auth0 using configuration file, you may want to add logic for development/production config
const authService = new AuthService(auth0Config);

ReactDOM.render(
  <Router>
    <SampleAppWithAuth authService={authService} />
  </Router>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
