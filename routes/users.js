var express = require('express');
var router = express.Router();
var db = require('../db');


var data = {
  tables: {
    persona: [
     {id: 1, name: "John", age: 32},
     {id: 2, name: "Peter", age: 29},
    ],
    carro: [
      {id: 1, brand: "Jeep", model: "Cherokee", owner_id: 2},
      {id: 2, brand: "BMW", model: "X5", owner_id: 2},
      {id: 3, brand: "Volkswagen", model: "Polo", owner_id: 1},
    ],
  },
}
/*
db.connect(db.MODE_PRODUCTION, function() {
  db.fixtures(data, function(err) {
    if (err) return console.log(err)
    console.log('Data has been loaded...')
  })
})*/


//////
// router.use((req, res, next) => {
//   req.collection = req.db.collection("users");
//   next();
// });


/* GET users listing. */
router.get('/', function (req, res, next) {
  let id = req.params.id;
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) new Error('Missing database connection.');
    pool.query('SELECT * FROM Usuario', function (err, rows) {
      if (err) return console.log(err);
      res.send({ data: rows});
    });
  });
});

router.get("/:id", (req, res, next) => {
  let id = req.params.id;
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) new Error('Missing database connection.');
    pool.query('SELECT * FROM Usuario WHERE idUsuario = ?', id, function (err, rows) {
      if (err) console.log(err);
      res.send({ data: rows });
    });
  });
});

router.put("/:id", (req, res, next) => {
  let id = req.params.id;
  let body = req.body;
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) { new Error('Missing database connection.'); } else{
      pool.query('UPDATE Usuario SET ? WHERE idUsuario = ?', [body, id], function (err, result) {
        if (err) {
          res.send({ success: false });
        } else {
          console.log("result: " + JSON.stringify(result));
          if (result.affectedRows > 0) {
            res.send({ success: true });
          } else {
            res.send({ success: false });
          }
        }
      });
    }
  });
});

router.post("/", (req, res, next) => {
  let objeto = req.body.objeto;
  let sesion = req.body.sesion;
  confirmarSesion(sesion, function (respuesta) {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) new Error('Missing database connection.');
        pool.query("INSERT INTO Usuario SET ?", objeto, (err, result) => {
          if (err) {
            res.send({ success: false });
          } else {
            console.log("result: " + JSON.stringify(result));
            res.send({ success: true });
          }
        });
      });
    } else {
      res.status(404).send({ msg: "sesion incorrecta" });
      //res.send({ success: false });
    }
  });
});

function confirmarSesion(sesion, done){
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) new Error('Missing database connection.');
    pool.query('SELECT codigoSesion FROM Usuario WHERE codigoSesion = ? ', sesion, function (err, rows) {
      if (err) return console.log(err);
      done(rows[0]);
    });
  });
}

router.post("/signin", (req, res, next) => {
  let user = req.body;
  req.collection.findOne({ username: user.username }).then(doc => {
    if (doc) {
      res.send({ success: false, exist: true });
    } else {
      req.collection.insert(req.body).then(result => {
        res.send({ success: true });
      }).catch(err => {
        res.send({ success: false });
      });
    }
  }).catch(err => {
    res.send({ success: false });
  });


});

module.exports = router;
