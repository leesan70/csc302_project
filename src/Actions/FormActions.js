import { FormConstants } from 'Constants';
import { FormServices } from 'Services';

function getFormList() {
    return async dispatch => {
        dispatch(request());

        await FormServices.getFormList()
            .then(
                forms => dispatch(success(forms)),
                error => dispatch(failure(error.toString()))
            );

    };

    function request() { return { type: FormConstants.GET_FORM_LIST_REQUEST } }
    function success(forms) { return { type: FormConstants.GET_FORM_LIST_SUCCESS, forms } }
    function failure(error) { return { type: FormConstants.GET_FORM_LIST_FAILURE, error } }
}

function getRecentlyAccessedList(formFillerID) {
    return async dispatch => {
        dispatch(request(formFillerID));

        await FormServices.getRecentlyAccessedList(formFillerID)
            .then(
                formResponses => dispatch(success(formResponses)),
                error => dispatch(failure(error.toString()))
            );

    };

    function request(formFillerID) { 
        return { type: FormConstants.GET_FORM_RESPONSE_LIST_REQUEST, formFillerID } 
    }
    function success(formResponses) { return { type: FormConstants.GET_FORM_RESPONSE_LIST_SUCCESS, formResponses } }
    function failure(error) { return { type: FormConstants.GET_FORM_RESPONSE_LIST_FAILURE, error } }
}

function getForm(diagnosticProcedureID) {
    return async dispatch => {
        dispatch(request(diagnosticProcedureID));

        await FormServices.getForm(diagnosticProcedureID)
            .then(
                loadedForm => dispatch(success(loadedForm)),
                error => dispatch(failure(error.toString()))
            );

    };

    function request(diagnosticProcedureID) {
        return { type: FormConstants.GET_FORM_REQUEST, diagnosticProcedureID }
    }
    function success(loadedForm) { return { type: FormConstants.GET_FORM_SUCCESS, loadedForm } }
    function failure(error) { return { type: FormConstants.GET_FORM_FAILURE, error } }
}

function getResponseByFormResponse(formResponseID) {
    return async dispatch => {
        dispatch(request(formResponseID));

        await FormServices.getResponseByFormResponseID(formResponseID)
            .then(
                response => dispatch(success(response)),
                error => dispatch(failure(error.toString()))
            )
    }

    function request(diagnosticProcedureID){
        return { type: FormConstants.GET_RESPONSE_REQUEST, diagnosticProcedureID }
    }
    function success(response) { return { type: FormConstants.GET_RESPONSE_SUCCESS, response} }
    function failure(error) { return { type: FormConstants.GET_RESPONSE_FAILURE, error } }
}

function getResponse(diagnosticProcedureID, formVersion, patientID, formFillerID){
    return async dispatch => {
        dispatch(request(diagnosticProcedureID, diagnosticProcedureID, formVersion, patientID, formFillerID));

        await FormServices.getResponse(diagnosticProcedureID, formVersion, patientID, formFillerID)
            .then(
                response => dispatch(success(response)),
                error => dispatch(failure(error.toString()))
            )
    }

    function request(diagnosticProcedureID){
        return { type: FormConstants.GET_RESPONSE_REQUEST, diagnosticProcedureID, formVersion, patientID, formFillerID }
    }
    function success(response) { return { type: FormConstants.GET_RESPONSE_SUCCESS, response} }
    function failure(error) { return { type: FormConstants.GET_RESPONSE_FAILURE, error } }
}

function addResponse(diagnosticProcedureID, formFillerID, patientID){
    return async dispatch => {
        dispatch(request(diagnosticProcedureID, formFillerID, patientID));        

        await FormServices.addResponse(diagnosticProcedureID, formFillerID, patientID)
            .then(
                response => dispatch(success(response)),
                error => dispatch(failure(error.toString()))
            );
    };

    function request(diagnosticProcedureID, formFillerID, patientID){
        return { 
            type: FormConstants.ADD_FORM_RESPONSE_REQUEST, 
            diagnosticProcedureID, 
            formFillerID, 
            patientID 
        };
    }
    function success(response) { return { type: FormConstants.ADD_FORM_RESPONSE_SUCCESS, response }; }
    function failure(error) { return { type: FormConstants.ADD_FORM_RESPONSE_FAILURE, error }; }
}

function getAnswer(responseID) {
    return async dispatch => {
        dispatch(request(responseID));

        await FormServices.getAnswers(responseID).then(
            response => dispatch(success(response)),
            error => dispatch(failure(error.toString()))
        );
    };

    function request(responseID){
        return {
            type: FormConstants.GET_RESPONSE_ANSWER_REQUEST,
        };
    }
    function success(response) { return { type: FormConstants.GET_RESPONSE_ANSWER_SUCCESS, response }; }
    function failure(error) { return { type: FormConstants.GET_RESPONSE_ANSWER_FAILURE, error }; }
}

function addChoiceAnswer(responseID, nodeID, choiceID, yesNo, maxSelection){
    return async dispatch => {
        dispatch(request());        
    }

    function request(){
        return {
            type: FormConstants.ADD_FORM_RESPONSE_CHOICE_ANSWER_REQUEST,            
        }
    }

    function success() { return { type: FormConstants.ADD_FORM_RESPONSE_CHOICE_ANSWER_SUCCESS } }
    function failure(error) { return { type: FormConstants.ADD_FORM_RESPONSE_CHOICE_ANSWER_FAILURE, error } }
}

function addFieldAnswer(response, nodeID, answerType, answerVal, choices=null, maxSelection = null){
    return async dispatch => {
        dispatch(request());

        let answer = {
            responseID: response._id,
            nodeID: nodeID
        };
    
        if (answerType == 'integer' || answerType == 'decimal') answerType = 'numberValue';
        else if (answerType == 'string') answerType = 'stringValue';
    
        if(choices != null) {
            answer.choices = choices;//[{choiceID: choiceID, field:{}}]
            // answer.choices[0].field[answerType] = answerVal
        } else {
            answer.field = {}
            answer.field[answerType] = answerVal
        }

        try {
            // TODO: Should await for the response in reality but...
            if (answerVal == "" && choices == null) {
                FormServices.deleteResponseAnswer(answer);
            } else {
                var body = {answer}
                if(maxSelection != null)
                    body.maxSelection = maxSelection
                FormServices.addResponseAnswer(body);
            }
        } catch (error){
            console.error(error);
            dispatch(failure(error));
        }

        let answers = response.answers;
        if (answers) {
            if (answerVal === "" && choices === null){
                // delete
                answers = answers.filter(answer => answer.nodeID !== nodeID);
            } else {
                let answer;
                let filtered = answers.filter(answer => answer.nodeID === nodeID);
                if (filtered.length === 0) {
                    answer = {
                        nodeID: nodeID,
                        responseID: response._id,
                    };
                } else {
                    answer = filtered[0];
                    answers = answers.filter(answer => answer.nodeID !== nodeID);
                }
                if (answerVal !== undefined && answerVal !== ""){
                    answer.field = {

                    };
                    answer.field[answerType] = answerVal;
                } else {
                    answer.choices = choices;
                }
                answers.push(answer);
            }
        }
        response.answers = answers;
        dispatch(success(response));
    };

    function request(){
        return {
            type: FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_REQUEST,
        }
    }

    function success(response){ return { type: FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_SUCCESS, response } }
    function failure(error) { return { type: FormConstants.ADD_FORM_RESPONSE_FIELD_ANSWER_FAILURE, error } }
}

function deleteAnswer(responseID, nodeID, choiceID){
    return async dispatch => {
        dispatch(request());

        await FormServices.deleteResponseAnswer( responseID, nodeID, choiceID );
    }

    function request(){
        return {
            
        }
    }

    function success(){ return; }
    function failure(error){ return;}
}

function getFormQuery(query) {
    return async dispatch => {
        dispatch(request());

        await FormServices.getFormQuery(query)
            .then(
                formQuery => dispatch(success(formQuery)),
                error => dispatch(failure(error.toString()))
            );

    };

    function request() { return { type: FormConstants.GET_FORM_QUERY_REQUEST } }
    function success(formQuery) { return { type: FormConstants.GET_FORM_QUERY_SUCCESS, formQuery } }
    function failure(error) { return { type: FormConstants.GET_FORM_QUERY_FAILURE, error } }
}

function getFormESQuery(query) {
    return async dispatch => {
        dispatch(request());

        await FormServices.getFormESQuery(query)
            .then(
                formQuery => dispatch(success(formQuery)),
                error => dispatch(failure(error.toString()))
            );

    };

    function request() { return { type: FormConstants.GET_FORM_QUERY_REQUEST } }
    function success(formQuery) { return { type: FormConstants.GET_FORM_QUERY_SUCCESS, formQuery } }
    function failure(error) { return { type: FormConstants.GET_FORM_QUERY_FAILURE, error } }
}

function submitResponse(response) {
    return async dispatch => {
        dispatch(request());
        try {
            let persistentFormLink = await FormServices.submitResponse(response);
            dispatch(success(persistentFormLink));
        } catch (error) {
            dispatch(failure(error.toString()));
        }
    }

    function request() {
        return {
            type: FormConstants.PUT_FORM_RESPONSE_REQUEST,
        }
    }
    function success(persistentFormLink) {return { type : FormConstants.PUT_FORM_RESPONSE_SUCCESS, persistentFormLink } }
    function failure(error) {return { type : FormConstants.PUT_FORM_RESPONSE_ERROR, error } }
}

export const FormActions = {
    getFormList,
    getForm,
    getResponse,
    getResponseByFormResponse,
    getAnswer,
    addResponse,
    addChoiceAnswer,
    addFieldAnswer,
    getRecentlyAccessedList,
    getFormQuery,
    getFormESQuery,
    submitResponse
};