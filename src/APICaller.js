import React from 'react';
import PropTypes from 'prop-types';

class APICaller extends React.Component {
  static propTypes = {
    // Receive the API calling function for protected endpoints
    callAPIWithToken: PropTypes.func.isRequired,

    // Receive the API calling function for public endpoints
    callAPIWithoutToken: PropTypes.func.isRequired,
  };

  // Keep track of the API response and possible errors
  state = { response: null, error: null}

  handleCallAPIWithTokenClick = async () => {
    const { callAPIWithToken } = this.props;

    await this.doCallAPI(callAPIWithToken);
  };

  handleCallAPIWithoutTokenClick = async () => {
    const { callAPIWithoutToken } = this.props;

    await this.doCallAPI(callAPIWithoutToken);
  };

  doCallAPI = async (callingFunction) => {
    try {
      // Make the API call using the received function
      const response = await callingFunction();

      // Update response in state
      this.setState({ response, error: null });
    } catch (error) {
      // Update error in state
      this.setState({ response: null, error });
    }
  }

  render() {
    const { response, error } = this.state;

    return (
      <div>
        <h2>API call</h2>

        {/* Button to call API's protected endpoints */}
        <button onClick={this.handleCallAPIWithTokenClick}>Call protected endpoint</button>

        {/* Button to call API's public endpoints */}
        <button onClick={this.handleCallAPIWithoutTokenClick}>Call public endpoint</button>

        {response &&
          /* Show response in JSON format */
          <div>
            <h4>Success</h4>

            <pre>{JSON.stringify(response, null, 2)}</pre>
          </div>
        }

        {error &&
          /* Show error in JSON format */
          <div>
            <h4>Error</h4>

            <pre>{JSON.stringify(error, null, 2)}</pre>
          </div>
        }
      </div>
    );
  }
}

export default APICaller;
