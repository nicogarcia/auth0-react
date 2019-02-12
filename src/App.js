import React from 'react';
import PropTypes from 'prop-types';

// Import the SDK to validate the prop type
import Auth0 from "@auth0/auth0-login";

import APICaller from './APICaller';

class App extends React.Component {
  static propTypes = {
    // Receive Auth0 SDK instance
    auth0: PropTypes.instanceOf(Auth0),

    // Receive the API calling function for protected endpoints
    callAPIWithToken: PropTypes.func.isRequired,

    // Receive the API calling function for public endpoints
    callAPIWithoutToken: PropTypes.func.isRequired,
  };

  // Keep track of the user profile and possible errors
  state = { user: null, error: null };

  async componentDidMount() {
    // Initialize app state with auth information
    await this.initializeAuth();
  }

  // Initializes the Auth0 SDK instance and loads user info
  initializeAuth = async () => {
    // Get the Auth0 SDK instance
    const { auth0 } = this.props;

    try {
      // Initialize the auth0 instance
      // (required to check if user is already logged in)
      await auth0.init();

      // Update the user in state
      await this.updateUser(auth0);
    } catch (error) {
      // Handle possible errors
      this.setState({ user: null, error });
    }
  }

  // Read the user profile from the Auth0 SDK instance and update state.
  // The profile includes email, name, user id, etc.
  updateUser = async (auth0) => {
    const user = await auth0.getUser();

    this.setState({ user, error: null });
  };

  handleLoginClick = async () => {
    const { auth0 } = this.props;

    try {
      // Start login process using popup mode
      await auth0.loginWithPopup();
      
      // Update user
      await this.updateUser(auth0);
    } catch (error) {
      // Handle possible login errors
      this.setState({ error, user: null });
    }
  };
  
  handleLogoutClick = async () => this.props.auth0.logout(/* params */);

  render() {
    const { callAPIWithToken, callAPIWithoutToken } = this.props;
    const { error, user } = this.state;

    return (
      <div>
        {user ?

          <div>
            {/* Logged in section */}
            <h2>Logged in as {user.email}</h2>

            {/* Logout button */}
            <button onClick={this.handleLogoutClick}>Logout</button>

            {/* User profile in JSON format */}
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>

          :

          <div>
            {/* Logged out section */}

            {/* Login button */}
            <button onClick={this.handleLoginClick}>Login</button>

            {error &&
              <div>
                {/* Authentication errors */}
                <h4>Error</h4>

                {/* Error description in JSON format */}
                <pre>{JSON.stringify(error, null, 2)}</pre>
              </div>
            }
          </div>
        } 
        
        {/* API Calling section */}
        <APICaller
          callAPIWithToken={callAPIWithToken}
          callAPIWithoutToken={callAPIWithoutToken}
        />
      </div>
    );
  }
}

export default App;
