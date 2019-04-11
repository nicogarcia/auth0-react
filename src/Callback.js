import React, { useEffect, useState, useContext } from "react";
import { withRouter } from "react-router";
import { AppContext } from "./App";

function Callback({ history }) {
  const [error, setError] = useState(null);
  const { auth0 } = useContext(AppContext);

  // Handle callback
  useEffect(
    () => {
      if (!auth0) return;

      async function handleCallback() {
        try {
          await auth0.handleRedirectCallback();
          goHome();
        } catch (error) {
          setError(error.toString());
        }
      }

      handleCallback();
    },
    [auth0]
  );

  function goHome() {
    history.push("/");
  }

  return error ? (
    <>
      <pre>{error.toString()}</pre>

      <button onClick={goHome}>Go Home</button>
    </>
  ) : (
    <>Logging in...</>
  );
}

export default withRouter(Callback);
