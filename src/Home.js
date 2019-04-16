import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "./App";

function Home() {
  const [loading, setLoading] = useState(true);
  const { auth0, auth0Config, apiBaseURL } = useContext(AppContext);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [apiResponse, setAPIResponse] = useState(null);
  const [apiError, setAPIError] = useState(null);

  const publicApiEndpoint = "/api/public";
  const privateApiEndpoint = "/api/private";

  useEffect(
    () => {
      if (!auth0) return;

      const init = async () => {
        try {
          const user = await auth0.getUser();
          setUser(user);
          setError(null);
        } catch (error) {
          setUser(null);
          setError(error.toString());
        } finally {
          setLoading(false);
        }
      };

      init();
    },
    [auth0]
  );

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
      const response = await fetch(apiBaseURL + privateApiEndpoint, {
        headers
      });

      const body = await response.json();
      setAPIResponse(body);
      setAPIError(null);
    } catch (error) {
      setAPIError(error.toString());
      setAPIResponse(null);
    }
  }

  async function callPublicEndpoint() {
    try {
      // Make the HTTP GET call to the API public endpoint
      const response = await fetch(apiBaseURL + publicApiEndpoint);

      const body = await response.json();
      setAPIResponse(body);
      setAPIError(null);
    } catch (error) {
      setAPIError(error.toString());
      setAPIResponse(null);
    }
  }

  return loading ? (
    <>Loading...</>
  ) : (
    <>
      <h1>SPA protected with Auth0</h1>

      <p>
        Using tenant <strong>{auth0Config.domain}</strong>
      </p>

      <section>
        <h2>Login</h2>

        {user ? (
          <>
            {/* Logged in section */}

            <p>
              Logged in as <strong>{user.email}</strong>
              <button onClick={handleLogoutClick}>Logout</button>
            </p>

            {/* User profile in JSON format */}
            <h4>Raw Profile</h4>
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
      </section>

      <section>
        <h2>Call your API</h2>

        <p>
          <strong>API URL: </strong>
          {apiBaseURL}
        </p>

        <p>
          <strong>Private endpoint: </strong>
          {privateApiEndpoint}
          <button onClick={callPrivateEndpoint}>Call it!</button>
        </p>

        <p>
          <strong>Public endpoint: </strong>
          {publicApiEndpoint}
          <button onClick={callPublicEndpoint}>Call it!</button>
        </p>

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
      </section>
    </>
  );
}

export default Home;
