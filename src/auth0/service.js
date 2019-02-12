import auth0 from "auth0-js";

export default class AuthService {
  static defaultScope = "openid";
  static defaultResponseType = "token id_token";

  static isLoggedInStorageKey = "isLoggedIn";

  accessToken;
  idToken;
  expiresAt;
  userProfile;
  webAuth;
  clientID;
  logoutRedirectUri;

  constructor({
    domain,
    clientID,
    redirectUri,
    logoutRedirectUri,
    responseType = AuthService.defaultResponseType,
    scope = AuthService.defaultScope
  }) {
    this.webAuth = new auth0.WebAuth({
      domain,
      clientID,
      redirectUri,
      responseType,
      scope
    });

    this.clientID = clientID;
    this.logoutRedirectUri = logoutRedirectUri;
  }

  login = () => {
    this.webAuth.authorize();
  };

  getUserProfile = () => this.userProfile;

  setUserProfile = userProfile => {
    this.userProfile = userProfile;
  };

  handleAuthentication = async () =>
    new Promise((resolve, reject) =>
      this.webAuth.parseHash((err, authResult) => {
        window.history.replaceState(
          "",
          document.title,
          window.location.pathname + window.location.search
        );

        if (err) {
          return reject(err);
        }

        if (authResult && authResult.accessToken && authResult.idToken) {
          this.setSession(authResult);
          return resolve(authResult);
        }

        return reject(
          new Error("AuthService#handleAuthentication: unknown error")
        );
      })
    );

  getAccessToken = () => {
    return this.accessToken;
  };

  getIdToken = () => {
    return this.idToken;
  };

  setSession = authResult => {
    // Set isLoggedIn flag in localStorage
    localStorage.setItem(AuthService.isLoggedInStorageKey, "true");

    // Set the time that the access token will expire at
    let expiresAt = authResult.expiresIn * 1000 + new Date().getTime();
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = expiresAt;

    // Set user profile
    this.setUserProfile(authResult.idTokenPayload);
  };

  clearSession = () => {
    // Remove tokens and expiry time
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = 0;

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem(AuthService.isLoggedInStorageKey);

    // Clear user profile
    this.userProfile = null;
  };

  hasLoggedInFlagSet = () =>
    localStorage.getItem(AuthService.isLoggedInStorageKey) === "true";

  renewSession = async () => {
    // Check if the user previously had a session
    if (this.hasLoggedInFlagSet()) {
      return new Promise((resolve, reject) =>
        this.webAuth.checkSession({}, (err, authResult) => {
          if (err) {
            if (err.error === "login_required") {
              // TODO: Very important step that is not in current Quickstarts code! (is shown as Troubleshooting)
              // TODO: Improve messaging
              err.explanation =
                "You must use your own social authentication keys for social login to work correctly. " +
                "More info: https://auth0.com/docs/connections/social/devkeys";
            } else if (err.error === "consent_required") {
              // TODO: Very important step that is not in current Quickstarts code! (happens at least on scope addition)
              err.explanation =
                "User must re-authorize application, please, run login again. You may want to do this automatically " +
                "or add a login button when this `consent_required` error happens.";
            }

            // TODO: If loggedIn in localstorage is changed by hand then it'll hang until timeout

            return reject(err);
          }

          if (authResult && authResult.accessToken && authResult.idToken) {
            this.setSession(authResult);
            return resolve(authResult);
          }

          return reject(new Error("AuthService#renewSession: unknown error"));
        })
      );
    }
  };

  logout = () => {
    this.clearSession();

    this.webAuth.logout({
      returnTo: this.logoutRedirectUri,
      clientID: this.clientID
    });
  };

  isAuthenticated = () => {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = this.expiresAt;
    return new Date().getTime() < expiresAt;
  };
}
