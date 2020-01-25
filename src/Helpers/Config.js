/* globals process */

import Url from 'url-parse';

export function getApiUrl(){    
    return process.env.API_URL;
}

