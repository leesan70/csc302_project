// routes/index.js
import express from 'express';
import form from './form';
import response from './response'
import dummy from './dummy'
import query from './query'

export default (passport) => {
	var router = express.Router();

	router.use('/form',
		// passport.authenticate('jwt', { session: false }),
		form(passport));
	router.use('/response',
		// passport.authenticate('jwt', { session: false }),
		response(passport));
	router.use('/dummy', dummy(passport));
	router.use('/query', query(passport));
	return router;
}
