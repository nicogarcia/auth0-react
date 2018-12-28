import axios from "axios";

/**
 * Creates an axios (http client library) client with defaults to work with Auth0.
 * The most important default is the Authorization header.
 *
 * @param baseURL API base url. Eg. your-api.com
 * @param accessToken Access token to use in the Authorization header
 * @param timeout Client timeout
 *
 * @return {AxiosInstance}
 */
export const newAPIClient = (baseURL, accessToken = null, timeout = 2000) =>
  axios.create({
    baseURL,
    timeout,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
  });
