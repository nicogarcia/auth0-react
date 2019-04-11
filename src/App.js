import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

// Import the SDK to validate the prop type
import Auth0 from "@auth0/auth0-spa-js";

function App({ auth0, auth0Config, apiBaseURL }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [apiResponse, setAPIResponse] = useState(null);
  const [apiError, setAPIError] = useState(null);

  // const [auth0, setAuth0] = useState(null);

  // Initialize Auth0 SDK
  useEffect(() => {
    if (auth0 === null) {
      return;
    }
    const init = async () => {
      try {
        setLoading(true);
        // const auth0 = await configureClient();
        console.log('Auth0Client in App: ', auth0);
        //setAuth0(auth0);
        const user = await auth0.getUser();
        console.log('auth0.getUser(): ', user);
        setUser(user);
        setError(null);
      } catch (error) {
        console.log('Error: ', error);
        setUser(null);
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [auth0]);

  async function handleLoginClick() {
    const { redirect_uri } = auth0Config;

    // Start login flow using redirect mode
    await auth0.loginWithRedirect({ redirect_uri });
  }

  async function handleLogoutClick() {
    auth0.logout();
  }

  async function callPrivateEndpoint() {
    let headers = {};
    try {
      // Get the access_token from Auth0 SDK
      const accessToken = await auth0.getTokenSilently();

      // Set up Authorization header using access_token
      headers = { Authorization: "Bearer " + accessToken };
    } catch (error) {
      console.log("could not get an access token");
    }

    try {
      // Make the HTTP GET call to the API private endpoint using the access_token
      const response = await fetch(`${apiBaseURL}/api/private`, { headers });

      const body = await response.json();
      setAPIResponse(body);
      setAPIError(null);
    } catch (error) {
      setAPIError(error);
      setAPIResponse(null);
    }
  }

  async function callPublicEndpoint() {
    try {
      // Make the HTTP GET call to the API public endpoint
      const response = await fetch(`${apiBaseURL}/api/public`);

      const body = await response.json();
      setAPIResponse(body);
      setAPIError(null);
    } catch (error) {
      setAPIError(error);
      setAPIResponse(null);
    }
  }

  return loading ? (
    "Loading..."
  ) : (
    <>
      {user ? (
        <>
          {/* Logged in section */}

          <p>
            Logged in as <strong>{user.email}</strong>
            <button onClick={handleLogoutClick}>Logout</button>
          </p>

          {/* User profile in JSON format */}
          <h2>Raw Profile</h2>
          <pre>{JSON.stringify(user, null, 2)}</pre>
        </>
      ) : (
        <>
          {/* Logged out section */}
          <p>
            <strong>Not logged in</strong>
            <button onClick={handleLoginClick}>Login</button>
          </p>

          {/* Authentication errors */}
          {error && (
            <>
              <h4>Error</h4>

              {/* Error description in JSON format */}
              <pre>{JSON.stringify(error, null, 2)}</pre>
            </>
          )}
        </>
      )}

      <h2>API calls</h2>

      <button onClick={callPrivateEndpoint}>Call Private endpoint</button>
      <button onClick={callPublicEndpoint}>Call Public endpoint</button>

      {apiResponse && (
        <>
          {/* API response in JSON format */}
          <h3>Response</h3>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </>
      )}

      {apiError && (
        <>
          {/* API error in JSON format */}
          <h3>Error</h3>
          <pre>{JSON.stringify(apiError, null, 2)}</pre>
        </>
      )}
    </>
  );
}

App.propTypes = {
  // Receive Auth0 SDK instance
  configureClient: PropTypes.func.isRequired,
  apiBaseURL: PropTypes.string.isRequired,
  auth0Config: PropTypes.shape({
    redirect_uri: PropTypes.string.isRequired
  })
};

export default App;
