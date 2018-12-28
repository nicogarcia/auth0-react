import React from "react";
import { Route, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import Auth0 from "./Auth0";
import AuthService from "./service";
import CallbackPage from "./CallbackPage";
import { newAPIClient } from "./helpers";

class SampleAppWithAuth extends React.Component {
  static propTypes = {
    // AuthService instance required to perform authentication operations
    authService: PropTypes.instanceOf(AuthService).isRequired
  };

  state = {
    // Whether the user is authenticated or not
    isAuthenticated: null,

    // [Optional] To handle initial async authentication progress
    loadingAuth: true,

    // [Optional] To handle authentication errors
    authError: null
  };

  handleLogout = () => {
    const { authService } = this.props;

    authService.logout();

    // Update authentication status
    this.setState({ isAuthenticated: authService.isAuthenticated() });
  };

  handleLoginFinish = ({ error }) => {
    const { history, authService } = this.props;

    // Set loading flag to false and update authentication status and error
    this.setState({
      loadingAuth: false,
      isAuthenticated: authService.isAuthenticated()
    });

    // [Optional] Check for login result and redirect or handle errors
    if (!error) {
      // Redirect to home page if no errors
      history.replace("/");
    }
  };

  handleSessionRenewal = ({ error }) => {
    const { authService } = this.props;

    // Set loading flag to false and update authentication status and error
    this.setState({
      loadingAuth: false,
      isAuthenticated: authService.isAuthenticated(),
      authError: error
    });
  };

  render() {
    const { authService, apiBaseURL } = this.props;
    const { isAuthenticated, loadingAuth, authError } = this.state;

    const apiClient = newAPIClient(apiBaseURL, authService.accessToken);

    return (
      <div>
        {/* REQUIRED: You have to mount the Auth0 component to handle the session renewal */}
        <Auth0
          authService={authService}
          onSessionRenewed={this.handleSessionRenewal}
        />

        {/* REQUIRED: You have to create a callback route to receive authentication information after logging in */}
        <Route
          exact
          // This should be the callback route (relative path) you configured your app to allow
          path="/callback"
          render={() => (
            /* REQUIRED: This is the callback page component that reads the received authentication information */
            <CallbackPage
              authService={authService}
              // This function is executed whenever the authentication information is read either with or without errors
              onFinish={this.handleLoginFinish}
              // REQUIRED: The result of this render function is rendered while reading the authentication information
              //           In this case, it's nothing (`null`) while reading and an error component if there's an error
              render={({ error }) =>
                error ? <AuthError error={error} /> : null
              }
            />
          )}
        />

        {/*
          OPTIONAL: This is the rest of your application, in this example we use the `loadingAuth` flag to show a
          loading message while renewing the session on first page load and a sample home page when the renewal is
          completed.

          IMPORTANT: It's not necessary to block the whole UI from rendering while checking the session.
        */}
        <Route
          exact
          path="/"
          render={() =>
            loadingAuth ? (
              "Loading authentication status..."
            ) : (
              <SampleHome
                authError={authError}
                authService={authService}
                apiClient={apiClient}
                // This sample home page shows a different message according to whether you're authenticated or not
                isAuthenticated={isAuthenticated}
                // This function is executed when the home page's logout button is clicked
                onLogout={this.handleLogout}
              />
            )
          }
        />
      </div>
    );
  }
}

/**
 * Sample Home component to show the user profile and login and logout buttons.
 */
const SampleHome = ({
  isAuthenticated,
  authService,
  onLogout,
  authError,
  apiClient
}) =>
  isAuthenticated ? (
    <div>
      <h3>You are authenticated</h3>
      <button onClick={onLogout}>Logout</button>

      <hr />

      <h3>User information</h3>
      <pre>{JSON.stringify(authService.getUserProfile(), null, 2)}</pre>

      <hr />

      <APICaller apiClient={apiClient} />

      <hr />
    </div>
  ) : (
    <div>
      <h3>You are not authenticated</h3>

      <button onClick={authService.login}>Login</button>

      {authError && <AuthError error={authError} />}

      <hr />

      <APICaller apiClient={apiClient} />

      <hr />
    </div>
  );

/**
 * Sample error component to show if an authentication error happens
 *
 * Uses withRouter to access history and be able to return to home page.
 */
const AuthError = withRouter(({ history, error }) => (
  <div>
    <h2>Authentication error</h2>

    <pre>{JSON.stringify(error, null, 2)}</pre>

    <button onClick={() => history.push("/")}>Go to home</button>
  </div>
));

/**
 * Sample component that calls an API
 */
class APICaller extends React.Component {
  static propTypes = {
    // Axios client to make calls to the API (implementing AxiosInstance interface)
    apiClient: PropTypes.func.isRequired
  };

  state = { loading: false, result: null, error: null };

  apiClient = null;

  constructor(props) {
    super(props);
    this.apiClient = props.apiClient;
  }

  callAPI = async () => {
    this.setState({ loading: true });

    try {
      const result = await this.apiClient.get("/private");

      this.setState({ result: result.response, error: null });
    } catch (error) {
      this.setState({ error: error.response, result: null });
    }

    this.setState({ loading: false });
  };

  render() {
    const { loading, result, error } = this.state;

    return (
      <div>
        <h3>API Caller</h3>
        <button onClick={this.callAPI}>Call API</button>

        {loading ? (
          "Calling API..."
        ) : error ? (
          <div>
            <h4>Result (HTTP Status {error.status})</h4>
            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        ) : (
          <div>
            <h4>
              Response (
              {result ? `HTTP Status: ${result.status}` : "Not called yet"}){" "}
            </h4>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(SampleAppWithAuth);
