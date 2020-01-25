/* globals process __dirname*/

// Main packages
import express from 'express';
import webpack from 'webpack';
import cors from 'cors';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';

import SDCPersistentLink from './models/SDCPersistentLink'
import SDCForm from './models/SDCForm'
import persistent from './persistent'

if(util.isTestMode()) {
    require('dotenv').config({path: path.resolve(__dirname, '..', '.env.server.test')});
}

// Other packages
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import { serve, setup } from 'swagger-ui-express';
import { safeLoad } from 'js-yaml';
import { readFileSync } from 'fs';
import db from './db';

// Auth
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';

// Config
import configPP from './config/passport.js';
configPP(passport);

import util from './util';
import logger from './logger';

//file upload module
import multiparty  from 'connect-multiparty';
import fs from 'fs';


// Needed for Hot Module Replacement
if(typeof(module.hot) !== 'undefined') { // eslint-disable-line no-undef  
    module.hot.accept(); // eslint-disable-line no-undef  
}

var port = process.env.PORT || 3001,
    app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors());

if (process.env.NODE_ENV === 'development') {
    const configWP = require('../webpack.dev.config');
    const compiler = webpack(configWP);
    app.use(webpackDevMiddleware(compiler, {publicPath: configWP.output.publicPath}));
    app.use(webpackHotMiddleware(compiler));
    app.use(morgan('dev'));
}

const multipartyMiddleWare = multiparty();
app.use(multipartyMiddleWare);

// Auth
app.use(session({ secret: 'supercalifragilisticexpialidocious' }));
app.use(passport.initialize());
app.use(passport.session());
require('./config/passport')(passport);

app.use(flash());
app.set('view engine', 'ejs');
app.set('views', __dirname);

app.use('/docs', serve, 
    setup(safeLoad(readFileSync(path.resolve(__dirname, 'docs', 'openapi.yaml')))));

// Authentication
import user from './routes/user';
app.use('/auth',
    ((passport) => {
        let router = express.Router();
        router.use(user(passport));
        return router;
    })(passport)
);

// Routing
import routes from './routes';
app.use('/api', routes(passport));

app.get('/persistent/:persistentID', (req, res) => {
    SDCPersistentLink.findOne({link: req.params.persistentID}, (err, link) => {
        if(err) {
            util.errorMessage(res, err, "retrieving SDCPersistentLink")
        } else if(!link) {
            res.sendStatus(404);
        } else {
            SDCForm.findOne({diagnosticProcedureID: link.response.diagnosticProcedureID.toString(), version:parseInt(link.response.formVersion)}, (err, form) => {
                if(err)
                    util.errorMessage(res, err, "getting form")
                else if(!form) {
                    util.errorMessage(res, 'no form for persistent link')
                }
                else
                    res.send(persistent.renderResponse(req, link, form))
            })
        }
    }) 
});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'public')));
}

app.get('/*', (req, res)=>{
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

function getCookie(req, key) {
    if(key in req.cookies)
        return req.cookies[key];
    return '';
}

logger.info(`Server Mode : ${process.env.NODE_ENV}`);

// Initialize connection
var db_ = db.connect(db.getMongoUri(), db.getMongoConnectOptions());
logger.info(`Server is connecting to database ${db.getMongoUri()}`);
db_.on('open', function() {
    app.listen(port, () => {
        logger.info(`CSC302 CCO App listening online on port ${port}!`);
        if(util.isTestMode()) app.emit("app_started");        
    });
});

db_.on('error', function(err) {
    logger.error(`Error connecting to url ${db.getMongoUri()}`, err);
});

export default app;