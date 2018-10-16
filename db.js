
var mysql = require('mysql');
var async = require('async');

var PRODUCTION_DB = 'sql10260937'
// var PRODUCTION_DB = 'interpro'
  , TEST_DB = 'app_test_database'

exports.MODE_TEST = 'mode_test'
exports.MODE_PRODUCTION = 'mode_production'

var state = {
  pool: null,
  mode: null
}

exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
      host: 'sql10.freemysqlhosting.net',
      user: 'sql10260937',
      password: 'm2JrRwG2uy',
      // host: '127.0.0.1',
      // user: 'interpro',
      // password: 'interpro',
      database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
    });
  
    state.mode = mode;
    done();
  }
  
  exports.get = function() {
    return state.pool;
  }
  
  exports.fixtures = function(data,done) {
    var pool = state.pool
    if (!pool) return done(new Error('Missing database connection.'))
  
    var names = Object.keys(data.tables);
    async.each(names, function(name, cb) {
      async.each(data.tables[name], function(row, cb) {
        var keys = Object.keys(row)
          , values = keys.map(function(key) { return "'" + row[key] + "'" })
  
        pool.query('INSERT INTO ' + name + ' (' + keys.join(',') + ') VALUES (' + values.join(',') + ')', cb)
      }, cb)
    }, done)
  }
  
  exports.drop = function(tables, done) {
    var pool = state.pool
    if (!pool) return done(new Error('Missing database connection.'))
  
    async.each(tables, function(name, cb) {
      pool.query('DELETE * FROM ' + name, cb)
    }, done)
  }

  exports.selectAll = function(userId, done) {
    var pool = state.pool
    if (!pool) return done(null,new Error('Missing database connection.'))
    
    pool.query("SELECT * FROM Usuario", function(res){
      done(res);
    }) 
  }

  exports.getAll = function(done) {
    var pool = state.pool
    if (!pool) return done(null,new Error('Missing database connection.'))
    pool.query('SELECT * FROM Persona', function (err, rows) {
      if (err) return done(err)
      done(null, rows)
    })
  }
