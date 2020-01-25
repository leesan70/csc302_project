import logger from './logger'

function isTestMode(){
	return process.env.NODE_ENV == 'test';
}

// route middleware to make sure a user is logged in
function isLoggedIn(req, res) {
	return new Promise((resolve, reject) => {
		// if user is authenticated in the session, carry on 
		if (req.isAuthenticated() && getUser(req) != null) {
			resolve()
			return
		}

		// if they aren't redirect them to the home page
		if (res) {
			res.redirect('/login');
		}
	})
}

function getUser(req) {
	if (req.session && req.session.passport && req.session.passport.user)
		return req.session.passport.user
	else
		return null
}

function errorMessage(res, err, message, code = 500) {
	var messages = []
	if (err)
		messages.push(err)
	if (message)
		messages.push(message)

	logger.error(messages.join(','))

	var response = ''
	switch(code) {
		case 404:
		response = 'not found'
		break;
		case 500:
		response = 'internal server error'
		break;
	}
	res.status(code).json({
		success: false,
		error: response
	})
}

function authenticate(req, res) {
	return new Promise((resolve, reject) => {
		isLoggedIn(req, res)
			.then(() => {
				var user = getUser(req)
				resolve({
					config: defaultConfig,
					userID: user
				})
			})
	})
}

function copyObj(obj) {
	return JSON.parse(JSON.stringify(obj))
}

function timestamp(format = '', language = 'en-US') {
    var dt = new Date();
    var model = "YYYYMMDD-HHmmSS-mss";
    if (format !== '') {
        model = format;
    }
    model = model.replace("YYYY", dt.getFullYear());
    model = model.replace("MM", (dt.getMonth() + 1).toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("DD", dt.getDate().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("HH", dt.getHours().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("mm", dt.getMinutes().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("SS", dt.getSeconds().toLocaleString(language, { minimumIntegerDigits: 2, useGrouping: false }));
    model = model.replace("mss", dt.getMilliseconds().toLocaleString(language, { minimumIntegerDigits: 3, useGrouping: false }));
    return model;
}

function uniqueID(len = 8) {
	var id = new Array(len+1).join('x')
    return id.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

export default {
	isTestMode,
	isLoggedIn,
	errorMessage,
	authenticate,
	copyObj,
	timestamp,
	uniqueID
}