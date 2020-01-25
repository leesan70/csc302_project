import { AlertConstants } from "Constants";

function success(msg){
    return { type: AlertConstants.SUCCESS, msg };
}

function error(msg){
    return { type: AlertConstants.ERROR, msg };
}

function clear(){
    return { type: AlertConstants.CLEAR };
}

export const AlertActions = {
    success,
    error,
    clear
};

