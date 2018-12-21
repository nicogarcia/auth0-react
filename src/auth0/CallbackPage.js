import React from "react";
import PropTypes from "prop-types";
import AuthService from "./service";

class CallbackPage extends React.Component {
  static propTypes = {
    // AuthService instance to handle callback url
    authService: PropTypes.instanceOf(AuthService),

    // Render function defaults to 'Loading'
    render: PropTypes.func.isRequired,

    // Handle callback processing finished
    onFinish: PropTypes.func
  };

  static defaultProps = {
    onFinish: () => {}
  };

  state = {
    error: null
  };

  async componentDidMount() {
    const { authService, onFinish } = this.props;

    let authResult;

    try {
      authResult = await authService.handleAuthentication();
    } catch (error) {
      this.setState({ error });

      onFinish({ error, authResult });

      return;
    }

    this.setState({ error: null, authResult });

    onFinish({ error: null, authResult });
  }

  render() {
    const { render } = this.props;
    const { error, authResult } = this.state;

    const renderProps = { ...this.props, authResult, error };

    return render(renderProps);
  }
}

export default CallbackPage;
