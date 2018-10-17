var express = require('express');
var router = express.Router();
var db = require('../db');
const uuidv1 = require('uuid/v1');


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
var tabla="Usuario";
var idTabla="idUsuario";
/**
 * obtener todos los usuario
 */
router.get('/', function (req, res, next) {
  let sesion = req.body.sesion;
  confirmarSesion(sesion, (respuesta) => {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      let id = req.params.id;
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) new Error('Missing database connection.');
        pool.query('SELECT * FROM '+tabla, function (err, rows) {
          if (err) return console.log(err);
          res.send({ data: rows });
        });
      });
    } else {
      res.status(404).send({ msg: "sesion incorrecta" });
      // res.send({ success: false });
    }
  });
});

/**
 * obtener un usuario
 */
router.get("/:id", (req, res, next) => {
  let sesion = req.body.sesion;
  confirmarSesion(sesion, (respuesta) => {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      let id = req.params.id;
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) new Error('Missing database connection.');
        pool.query('SELECT * FROM Usuario WHERE '+idTabla+' = ?', id, function (err, rows) {
          if (err) console.log(err);
          res.send({ data: rows });
        });
      });
    } else {
      res.status(404).send({ msg: "sesion incorrecta" });
      // res.send({ success: false });
    }
  });
});

/**
 * actualizar usuario
 */
router.put("/:id", (req, res, next) => {
  let id = req.params.id;
  let objeto = req.body.objeto;
  objeto.idUsuario=id; // no modificar idUsuario
  let sesion = req.body.sesion;
  confirmarSesion(sesion, (respuesta) => {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) { new Error('Missing database connection.'); } else {
          pool.query('UPDATE '+tabla+' SET ? WHERE '+idTabla+' = ?', [objeto, id], function (err, result) {
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
    } else {
      res.status(404).send({ msg: "sesion incorrecta" });
     // res.send({ success: false });
    }
  });
});
/**
 * aliminar usuario
 */
router.delete("/:id", function (req, res, next) {
  let id = req.params.id;
  let sesion = req.body.sesion;
  confirmarSesion(sesion, (respuesta) => {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) { new Error('Missing database connection.'); } else {
          pool.query("DELETE FROM " + tabla + " WHERE " + idTabla + " = ?", [id], (err, result) => {
            if (err) res.status(500).send({ err: err });
            else {
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
    } else {
      res.status(404).send({ msg: "sesion incorrecta" });
      // res.send({ success: false });
    }
  });
});

/**
 * agregar usuario
 */
router.post("/", (req, res, next) => {
  let objeto = req.body.objeto;
  let sesion = req.body.sesion;
  confirmarSesion(sesion, (respuesta) => {
    console.log("confirmarSesion devuelto: ", respuesta);
    if (respuesta) {
      db.connect(db.MODE_PRODUCTION, function () {
        let pool = db.get();
        if (!pool) new Error('Missing database connection.');
        pool.query("INSERT INTO "+tabla+" SET ?", objeto, (err, result) => {
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
  let usuario = req.body.usuario;
  let clave;
  if(req.body.clave){
    console.log("clave: ",clave);
    clave = req.body.clave;
  }else{
    console.log("codigo: ",req.body.codigo);
    clave = req.body.codigo;
  }
  let codigoInstitucion = req.body.codigoInstitucion;
  let correo = req.body.correo;
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) new Error('Missing database connection.');
    pool.query("SELECT * FROM " + tabla + " WHERE usuario = ? AND clave = ?", [usuario, clave], (err, results) => {
      if (err) {
        res.send({ success: false });
      } else {
        if (results.length > 0) {
          let usr = results[0];
          delete usr.clave;
          delete usr.usuario;
          usr.codigoSesion = uuidv1();
          fechaCad = new Date();
          usr.fechaCaducidad = fechaCad;
          
          usr.utc = fechaCad.toLocaleString();
          //Encriptar CryptoJS
          //Para crear token de sesion es JSONToken
          res.send({ sucess: true, usuario: usr });
        } else {
          res.send({ success: false });
        }
      }
    });
  });

});


router.post("/login", (req, res, next) => {
  let body = req.body;
  db.connect(db.MODE_PRODUCTION, function () {
    let pool = db.get();
    if (!pool) new Error('Missing database connection.');
    pool.query("SELECT * FROM " + tabla + " WHERE usuario = ? AND clave = ?", [body.usuario, body.clave], (err, results) => {
      if (err) {
        res.send({ success: false });
      } else {
        if (results.length > 0) {
          let usr = results[0];
          delete usr.clave;
          delete usr.usuario;
          usr.codigoSesion = uuidv1();
          fechaCad = new Date();
          usr.fechaCaducidad = fechaCad;
          
          usr.utc = fechaCad.toLocaleString();
          //Encriptar CryptoJS
          //Para crear token de sesion es JSONToken
          res.send({ sucess: true, usuario: usr });
        } else {
          res.send({ success: false });
        }
      }
    });
  });
});

module.exports = router;
