import mongoose from 'mongoose';

var state = {
  db: null,
}

/** 
 * Connect to the db
 */
function connect(url) {
  if (state.db){
    return state.db;
  }
  mongoose.connect(url, getMongoConnectOptions());
  const db = mongoose.connection;
  state.db = db;
  return state.db;
}


/** 
 * Return a connected db instance or connect if no connection exists.
 */
const get = function() {
  if (!state.db){
    mongoose.connect(getMongoUri(), getMongoConnectOptions());
    const db = mongoose.connection;
    state.db = db;
    return state.db;
  }
  return state.db;
}


/** 
 * Close db connection
 */
const close = function(done) {
  if (state.db) {
    state.db.close(function(err, result) {
      state.db = null
      state.mode = null
      done(err)
    })
  }
}

/** 
 * Return db url
 */
const getMongoUri = function(){
  return `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`;  
}

/** 
 * Return db connection options
 */
const getMongoConnectOptions = function(){
  return {
    user : process.env.DB_USER && process.env.DB_USER.indexOf(':') != -1 ? process.env.DB_USER.split(':')[0] : null,
    pass : process.env.DB_USER && process.env.DB_USER.indexOf(':') != -1 ? process.env.DB_USER.split(':')[1] : null,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
}

export default {
  connect,
  get,
  close,
  getMongoUri,
  getMongoConnectOptions
}