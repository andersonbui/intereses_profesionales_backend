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
  db.connect(db.MODE_PRODUCTION, function () {
    db.getAll(function (err, resultado) {
      if (err) console.log(err);
      res.send({ data: resultado});
    })
  })
});

router.get("/:id", (req, res, next)=>{
  let id = req.params.id;
  db.connect(db.MODE_PRODUCTION, function () {
    db.getById(id, function (err, resultado) {
      if (err) console.log(err);
      res.send({ data: resultado});
    })
  });
});

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
