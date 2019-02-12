// Creates a generic api caller function using `fetch`
export const createAPICaller = (apiURL) =>
  // Returns the caller function with predefined apiURL
  async (endpoint = "/", options = {}) => {
    // Make the HTTP GET call to the API's `/` endpoint using the access_token
    const response = await fetch(`${apiURL}${endpoint}`, options);

    return response.json();
  };

// Creates a caller function from auth0 instance and a generic caller function
export const createAuthedAPICaller = (auth0, apiCaller) =>
  // Returns the caller function with predefined apiURL
  // and auth0 SDK instance to add token to headers
  async (endpoint = "/") => {
    // Get the access_token that was already available from the auth response
    const accessToken = await auth0.getToken();

    // Set up Authorization header using access_token
    const headers = { Authorization: "Bearer " + accessToken };

    return apiCaller(endpoint, { headers });
  };
