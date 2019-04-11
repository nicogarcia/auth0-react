import React, { useEffect, useState } from "react";
import { withRouter } from "react-router";

function Callback({ history, auth0 }) {
  const [error, setError] = useState(null);

  // Handle callback (only runs once)
  useEffect(() => {
    async function handleCallback() {
      //const auth0 = await configureClient();
      console.log('Auth0Client in callback: ', auth0);

      try {
        await auth0.handleRedirectCallback();
        goHome();
      } catch (error) {
        setError(error);
        console.log(error);
      }
    }

    handleCallback();
  }, []);

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
