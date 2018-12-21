import React from "react";
import PropTypes from "prop-types";
import AuthService from "./service";

class Auth0 extends React.Component {
  static propTypes = {
    // AuthService instance
    authService: PropTypes.instanceOf(AuthService).isRequired,

    // Callback run when the tokens renewal finishes either successfully or unsuccessfully
    onSessionRenewed: PropTypes.func.isRequired
  };

  async componentDidMount() {
    const { authService, onSessionRenewed } = this.props;

    let authResult = null;

    try {
      authResult = await authService.renewSession();
    } catch (error) {
      onSessionRenewed({ error, authResult: null });
    }

    // Run callback with authentication information
    onSessionRenewed({ error: null, authResult });
  }

  render() {
    return null;
  }
}

export default Auth0;
