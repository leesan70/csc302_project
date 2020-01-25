const {transports, createLogger, format} = require('winston');

/*const levels = { 
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};*/

const formatter = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}] : ${message}`;
});

var tran = [
	new transports.File({ filename: './logs/error.log', level: 'error'}),
	new transports.File({ filename: './logs/combined.log' })
]

// Dont want errors going to console during test runs
if(process.env.NODE_ENV && process.env.NODE_ENV.localeCompare("test") != 0) {
	tran.push(new transports.Console({'timestamp': true}))
}

var logger = createLogger({
	level: 'info',
	format: format.combine(
		format.timestamp(),
		formatter
		),
	transports:tran
})

function logError(message) {
	logger.log({level: 'error', message:message})
}

function logInfo(message) {
	logger.log({level: 'info', message:message})
}

export default {
	logger,
	error:logError,
	info:logInfo,
}