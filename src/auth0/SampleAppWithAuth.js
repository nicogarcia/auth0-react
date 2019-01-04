import React from "react";
import PropTypes from "prop-types";
import AuthService from "./service";
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

  async componentDidMount() {
    const { authService } = this.props;

    let authResult = null;

    try {
      authResult = await authService.handleAuthentication();

      this.handleSessionRenewal({ error: null, authResult });
    } catch (error) {
      try {
        authResult = await authService.renewSession();
        this.handleSessionRenewal({ error: null, authResult });
      } catch (error) {
        this.handleSessionRenewal({ error, authResult: null });
      }
    }
  }

  handleLogin = () => {
    const { authService } = this.props;

    authService.login();
  };

  handleLogout = () => {
    const { authService } = this.props;

    authService.logout();

    // Update authentication status
    this.setState({ isAuthenticated: authService.isAuthenticated() });
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
        {/* IMPORTANT: It's not necessary to block the whole UI from rendering while checking the session.*/}
        {loadingAuth ? (
          "Loading authentication status..."
        ) : (
          <SampleHome
            authError={authError}
            authService={authService}
            apiClient={apiClient}
            // This sample home page shows a different message according to whether you're authenticated or not
            isAuthenticated={isAuthenticated}
            onLogin={this.handleLogin}
            // This function is executed when the home page's logout button is clicked
            onLogout={this.handleLogout}
          />
        )}
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
  onLogin,
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

      <button onClick={onLogin}>Login</button>

      {authError && (
        <div>
          <h2>Authentication error</h2>

          <pre>{JSON.stringify(authError, null, 2)}</pre>
        </div>
      )}

      <hr />

      <APICaller apiClient={apiClient} />

      <hr />
    </div>
  );

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

export default SampleAppWithAuth;
