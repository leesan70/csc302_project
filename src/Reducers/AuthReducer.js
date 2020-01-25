  
import { UserConstants } from 'Constants';

let user = JSON.parse(localStorage.getItem('user'));
const initialState = user ? { loggedIn: true, user } : {};

export function authentication(state = initialState, action) {
  switch (action.type) {
    case UserConstants.LOGIN_REQUEST:
      return {
        loggingIn: true,
        user: action.user
      };
    case UserConstants.LOGIN_SUCCESS:
      return {
        loggedIn: true,
        user: action.user
      };
    case UserConstants.LOGIN_FAILURE:
      return {};
    case UserConstants.LOGOUT:
      return {};
    default:
      return state;
  }
}