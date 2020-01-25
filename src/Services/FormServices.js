import { Axios } from 'Helpers';

async function getFormList() {
    let response = {};

    try {        
        response = await Axios.get(`/api/form`);
    } catch (e) {
        return response;
    }
    
    return response.data;
}

async function getRecentlyAccessedList(formFillerID) {
    let responses = {};
    
    try {
        responses = await Axios.get(`/api/response/search?formFillerID=${formFillerID}`);
    } catch(e) {
        console.log(e);
        return responses;
    }

    return responses.data;
}

async function getResponseByFormResponse(formResponseID) {
    let response = {};
    
    try {
        await Axios.get(`/api/response/${formResponseID}`);
    } catch(e) {
        console.error(e);
        return response
    }
    
    return response.data
}

async function getForm(diagnosticProcedureID) {
    let response = {};
    
    try {        
        response = await Axios.get(`/api/form/${diagnosticProcedureID}?force=1&fullData=1`);

        let data = response.data;
        let metadata = await getMetadata(data);    
        let nodes = await getNodes(data);
        let roots = await getRoots(nodes);
        let nodeMap = await constructNodeMap(nodes);
        let getChildrenFn = await getChildrenFunction(nodeMap);
        return {
            nodes: nodes,
            metadata: metadata,
            roots: roots,
            getChildrenFn: getChildrenFn
        };
    } catch (error) {
        console.error(error);
        return response;
    }
}

async function getResponseByFormResponseID(formResponseID) {
    let response = {};

    try {
        let response = await Axios.get(`/api/response/${formResponseID}`);
        return response.data
    } catch(e) {
        console.error(e);
        return response;
    }
    //return response.data;
}

async function getResponse(diagnosticProcedureID, formVersion, patientID, formFillerID){
    let response = {};
    let options = {
        diagnosticProcedureID,
        formVersion,
        patientID,
        formFillerID
    };

    try {
        response = await Axios.post(`/api/response`, options);
    } catch (e) {
        console.error(e);
        return response;
    }

    return response.data;
}

async function addResponse(diagnosticProcedureID, formFillerID = 0, patientID = 0){
    let response = {};
    let option = {
        diagnosticProcedureID,
        formFillerID,
        patientID
    };
    try {
        response = await Axios.post(`/api/response`, option);
    } catch (error) {
        console.error(error);
        return {};
    }

    return response.data;
}

async function getAnswers(responseID) {
    let response = {};
    try {
        response = await Axios.get(`/api/response/${responseID}`);
    } catch (error) {
        console.error(error);
        return {};
    }

    return response.data;
}

function getMetadata(rawJson) {
    if (!rawJson || !rawJson['form'] || !rawJson['form']['nodes']) {
        return Promise.reject(new Error('Not a proper JSON'));
    }

    return Promise.resolve({
        title: rawJson['form']['title'],
        sections: rawJson['form']['sections'],
        diagnosticProcedureID: rawJson['form']['diagnosticProcedureID']
    });
}

function getNodes(rawJson) {
    if (!rawJson || !rawJson['form'] || !rawJson['form']['nodes']) {
        return Promise.reject(new Error('Not a proper JSON'));
    }
    return Promise.resolve(rawJson['form']['nodes']);
}

function constructNodeMap(nodes) {
    let nodeMap = new Map();
    for (let i = 0; i < nodes.length; i++) {
        nodeMap.set(nodes[i]['referenceID'], nodes[i]);
    }
    return Promise.resolve(nodeMap);
}

function getChildrenFunction(nodeMap) {
    return Promise.resolve((nodeID) => {
        return nodeMap.get(nodeID);
    });
}

function getRoots(nodes) {
    let roots = {};
    const dependents = new Set(nodes
        .filter(node => node.dependencies)
        .map(node => node.dependencies)
        .flat()
        .map(dep => dep.nodeID)
    );
    nodes.forEach((node) => {
        let section = node["section"];
        if (!dependents.has(node.referenceID)) {
            if (!roots.hasOwnProperty(section)) {
                roots[section] = [node];
            } else {
                roots[section].push(node);
            }
        }
    });
    return Promise.resolve(roots);
}

function* nodeGenerator(rawJson, nodeMap) {
    let sections = rawJson['form']['sections'];
    let nodes = rawJson['form']['nodes'];
    let dependents = new Set();
    for (let i = 0; i < nodes.length; i++) {
        if (!dependents.has(nodes[i]['referenceID'])) {
            yield nodes[i];
            if (nodes[i]['dependencies'] !== undefined) {
                yield* dependencyGenerator(nodes[i]['dependencies'], dependents, rawJson, nodeMap);
            }
        }
    }
}

function* dependencyGenerator(dependencies, dependents, rawJson, nodeMap) {
    let nodes = rawJson['form']['nodes'];
    for (let j = 0; j < dependencies.length; j++) {
        let id = dependencies[j]['nodeID'];
        dependents.add(id);
        yield nodeMap[id];
        if (nodes[j]['dependencies'] !== undefined) {
            yield* dependencyGenerator(nodes[j]['dependencies'], dependents, rawJson, nodeMap);
        }
    }
}

async function addResponseAnswer(options){
    let response = {};

    try {
        response = await Axios.post('/api/response/answer', options);
    } catch (e) {
        return response;
    }
}

async function deleteResponseAnswer(answer){
    let response = {};
    let options = {
        params : {
            responseID: answer.responseID,            
            nodeID: answer.nodeID,
            choiceID: answer.choiceID ? answer.choiceID : ''
        }
    };

    try {
        response = await Axios.delete('/api/response/answer', options);
    } catch (e) {
        return response;
    }
}

function handleResponse(response) {
    // console.log(response.text())
    return response.text().then(text => {
        const data = text && JSON.parse(text);
        if (!response.ok) {
            const error = (data && data.message) || response.statusText;
            return Promise.reject(error);
        }    
        return response.data;
    });
}

async function submitResponse(response) {
    let opt = { _id: response._id };
    try {
        let res = await Axios.put('/api/response', opt);
        return res.data.link;
    } catch (e) {
        return 'NOT FOUND';
    }
}

function buildQueryParam(param, value) {
    return value ? `&${param}=${value}` : "";
}

async function getFormQuery(query) {
    console.log(query);
    let response = {};
    try {
        let queryString = `/api/query?diagnosticProcedureID=${query.formID}`;
        queryString += buildQueryParam("nodeID", query.nodeID);
        queryString += buildQueryParam("choiceID", query.choiceID);
        queryString += buildQueryParam("type", query.type);
        queryString += buildQueryParam("operator", query.operator);
        queryString += buildQueryParam("numberValue", query.numberValue);
        queryString += buildQueryParam("stringValue", query.stringValue);
        queryString += buildQueryParam("sort", query.sortOrder)
        queryString += buildQueryParam("patientID", query.patientID);
        queryString += buildQueryParam("limit", query.limit);
        console.log(queryString);
        response = await Axios.get(queryString);
    } catch (e) {
        console.error(e);
        return response;
    }

    return response.data;
}

async function getFormESQuery(query) {
    let response = {};
    try {
        // TODO: send PUT request with query
        var body = JSON.stringify(query)
        response = await Axios.put(`/api/query/`, query);
    } catch (e) {
        console.error(e);
        return response;
    }

    return response.data;
}

export const FormServices = {
    getFormList,
    getForm,
    getResponseByFormResponse, 
    getResponseByFormResponseID,
    getResponse,
    addResponse,
    getAnswers,
    addResponseAnswer,
    deleteResponseAnswer,
    getRecentlyAccessedList,
    submitResponse,
    getFormQuery,
    getFormESQuery,
};
