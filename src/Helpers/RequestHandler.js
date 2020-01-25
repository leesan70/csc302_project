import * as axios from 'axios';

import { authHeader, getApiUrl } from 'Helpers';

export const Axios = axios.create({
    baseURL: getApiUrl(),
    headers: {
        'Content-Type': 'application/json',
        'Authorization' : authHeader(),
        'Access-Control-Allow-Origin' : '*',
    }
});