import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Callback from "./Callback";
import createAuth0Client from "@auth0/auth0-spa-js";
import Home from "./Home";

export const AppContext = React.createContext({});

function App({ auth0Config, apiBaseURL }) {
  const [auth0, setAuth0] = React.useState(null);

  React.useEffect(() => {
    async function init() {
      setAuth0(await createAuth0Client(auth0Config));
    }
    init();
  }, []);

  return (
    <AppContext.Provider value={{ auth0, auth0Config, apiBaseURL }}>
      <Router>
        <Route exact path="/callback" render={() => <Callback />} />
        <Route exact path="/" render={() => <Home />} />
      </Router>
    </AppContext.Provider>
  );
}

export default App;
