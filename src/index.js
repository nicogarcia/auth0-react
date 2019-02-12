import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import auth0Config from "./auth0/config.json";
import AuthService from "./auth0/service";
import SampleAppWithAuth from "./auth0/SampleAppWithAuth";

// Initialize Auth0 using configuration file, you may want to add logic for development/production config
const authService = new AuthService(
  process.env.NODE_ENV === "production"
    ? auth0Config.production
    : auth0Config.development
);

ReactDOM.render(
  <SampleAppWithAuth authService={authService} />,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
