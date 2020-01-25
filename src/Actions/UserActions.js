import { push } from 'connected-react-router'

import { AlertActions } from 'Actions';
import { UserConstants } from 'Constants';
import { UserServices } from 'Services';
import { History } from 'Helpers';

function login(username, password) {
    return dispatch => {
        dispatch(request({ username }));

        UserServices.login(username, password)
            .then(
                user => { 
                    dispatch(success(user));
                    History.push('/formSelctor');
                    dispatch(push('/formSelector'));
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(AlertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: UserConstants.LOGIN_REQUEST, user } }
    function success(user) { return { type: UserConstants.LOGIN_SUCCESS, user } }
    function failure(error) { return { type: UserConstants.LOGIN_FAILURE, error } }
}

function logout() {
    UserServices.logout();
    return { type: UserConstants.LOGOUT };
}

function register(user) {
    return dispatch => {
        dispatch(request(user));

        UserServices.register(user)
            .then(
                user => {                    
                    dispatch(success());                     
                    dispatch(AlertActions.success('Registration successful'));
                    History.push('/login');
                    dispatch(push('/login'));                    
                },
                error => {
                    dispatch(failure(error.toString()));
                    dispatch(AlertActions.error(error.toString()));
                }
            );
    };

    function request(user) { return { type: UserConstants.REGISTER_REQUEST, user } }
    function success(user) { return { type: UserConstants.REGISTER_SUCCESS, user } }
    function failure(error) { return { type: UserConstants.REGISTER_FAILURE, error } }
}

// function getAll() {
//     return dispatch => {
//         dispatch(request());

//         UserServices.getAll()
//             .then(
//                 users => dispatch(success(users)),
//                 error => dispatch(failure(error.toString()))
//             );
//     };

//     function request() { return { type: UserConstants.GETALL_REQUEST } }
//     function success(users) { return { type: UserConstants.GETALL_SUCCESS, users } }
//     function failure(error) { return { type: UserConstants.GETALL_FAILURE, error } }
// }

// prefixed function name with underscore because delete is a reserved word in javascript
function _delete(id) {
    return dispatch => {
        dispatch(request(id));

        UserServices.delete(id)
            .then(
                user => dispatch(success(id)),
                error => dispatch(failure(id, error.toString()))
            );
    };

    function request(id) { return { type: UserConstants.DELETE_REQUEST, id } }
    function success(id) { return { type: UserConstants.DELETE_SUCCESS, id } }
    function failure(id, error) { return { type: UserConstants.DELETE_FAILURE, id, error } }
}

export const UserActions = {
    login,
    logout,
    register,
    // getAll,
    delete: _delete
};