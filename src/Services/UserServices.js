/* globals Promise */

import {authHeader, Axios, getApiUrl} from 'Helpers';

async function login(username, password) {
    return await Axios.post('/auth/login', {
        username,
        password
    }).then(handleResponse).then(user => {
        localStorage.setItem('user', JSON.stringify(user));

        return user;
    });
}

function logout() {
    // remove user from local storage to log user out
    localStorage.removeItem('user');
}

async function getAll() {
    return await Axios.get('/users').then(handleResponse);
}

async function getById(id) {
    return await Axios.get(`/users/${id}`).then(handleResponse);
}

async function register(user) {
    return await Axios.post('/auth/register', user).then(handleResponse);
}

async function update(user) {
    return await Axios.put(`/users/${user.id}`, user).then(handleResponse);
}

// prefixed function name with underscore because delete is a reserved word in javascript
async function _delete(id) {
    return await Axios.delete(`/users/${id}`).then(handleResponse);
}

async function handleResponse(response) {
    const data = response.data;
    if (response.statusText !== "OK"){
        if (response.status === 401) {
            // auto logout if 401 response returned from api
            logout();
            location.reload(true);
        }

        throw (data && data.message) || response.statusText;
    }
    return data;
}

export const UserServices = {
    login,
    logout,
    register,
    getAll,
    getById,
    update,
    delete: _delete
};