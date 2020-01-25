import { FormConstants } from 'Constants';

export function form(state = {}, action) {
    switch (action.type) {
        case FormConstants.GET_FORM_LIST_REQUEST:
            return {
                ...state,
                loading: true,                
            };
        case FormConstants.GET_FORM_LIST_SUCCESS:
            return {
                ...state,
                forms: action.forms,
                loading: false,                
            };
        case FormConstants.GET_FORM_LIST_FAILURE:
            return { 
                ...state,
                loading: false,
                error: action.error,                
            };
        case FormConstants.GET_FORM_QUERY_REQUEST:
            return {
                ...state,
                loading: true,                
            };
        case FormConstants.GET_FORM_QUERY_SUCCESS:
            return {
                ...state,
                formQuery: action.formQuery,
                loading: false,                
            };
        case FormConstants.GET_FORM_QUERY_FAILURE:
            return { 
                ...state,
                loading: false,
                error: action.error,                
            };
        case FormConstants.GET_FORM_RESPONSE_LIST_REQUEST:
            return {
                ...state,
                loading: true,                
            };
        case FormConstants.GET_FORM_RESPONSE_LIST_SUCCESS:
            return {
                ...state,
                formResponses: action.formResponses,
                loading: false,                
            };
        case FormConstants.GET_FORM_RESPONSE_LIST_FAILURE:
            return { 
                ...state,
                loading: false,
                error: action.error,                
            };
        case FormConstants.GET_FORM_REQUEST:
            return {
                ...state,
                loading: true,                
            };
        case FormConstants.GET_FORM_SUCCESS:
            return {
                ...state,
                loading: false,
                loadedForm: action.loadedForm
            };
        case FormConstants.GET_FORM_FAILURE:
            return {
                ...state,
                loading: false,                
            };
        case FormConstants.GET_RESPONSE_REQUEST:
            return {
                ...state,
                loading: true,                
            };
        case FormConstants.GET_RESPONSE_SUCCESS:
            return { 
                ...state,
                loading: false,
                response: action.response,
            };
        case FormConstants.GET_RESPONSE_FAILURE:
            return { 
                ...state,
                loading: false,
            }
        case FormConstants.GET_RESPONSE_ANSWER_REQUEST:
            return {
                ...state,
                loading: true,
            }
        case FormConstants.GET_RESPONSE_ANSWER_SUCCESS:
            return {
                ...state,
                loading: false,
                response: action.response,
            }
        case FormConstants.GET_RESPONSE_ANSWER_FAILURE:
            return {
                ...state,
                loading: false,
            }
        case FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_SUCCESS:
            return {
                ...state,
                loading: false,
                response: action.response,
            };
        case FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_FAILURE:
            return {
                ...state,
                loading: false,
                loadedForm: action.loadedForm,
            };
        case FormConstants.PUT_FORM_RESPONSE_REQUEST:
            return {
                ...state,
                loading: true,
            };
        case FormConstants.PUT_FORM_RESPONSE_SUCCESS:
            return {
                ...state,
                loading: false,
                persistentFormLink: action.persistentFormLink,
            };
        case FormConstants.PUT_FORM_RESPONSE_FAILURE:
            // TODO: Add appropriate reducer here
            return {
                ...state,
                loading: false,
                persistentFormLink: action.persistentFormLink,
            };
        default:
            return state;
    }
}