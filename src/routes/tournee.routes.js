require('dotenv').config();
const router = require('express').Router();
const connection = require('../db_connection');
const Joi = require('@hapi/joi');

const schema = Joi.object({
    city: Joi.string(),
    theater: Joi.string(),
    dateShow: Joi.date(),
});

// Afficher toutes les dates
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM tour';
    connection.query(sql, (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        res.setHeader('X-Total-Count', results.length);
        console.log(results.length);
        // Possible de juste mettre res.header(header).res.status
        res.status(200).json(results);
      }
    });
});

//afficher une date
router.get('/:id', (req, res) => {
    const idMedia = req.params.id;
    const sql = 'SELECT * FROM tour WHERE id = ?';
    connection.query(sql, [idMedia], (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(results);
      }
    });
});

// Ajouter une date
router.post('/', (req, res) => {
    const { city, theater, dateShow } = req.body;
    let sql = 'SELECT * FROM tour WHERE dateShow=?';
    connection.query(sql, dateShow, (errOne, resultsOne) => {
      if (errOne) {
        res.status(500).json({ errorMessage: errOne.message });
      } else if (resultsOne.length > 0) {
        res.status(401).json({ errorMessage: 'Cette date est déjà utilisée' });
      } else {
        sql = 'INSERT INTO tour SET ?';
        connection.query( sql, { city, theater, dateShow }, (err, results) => {
            if (err) {
              res.status(500).json({ errorMessage: err.message });
            } else {
              console.log('id: ', results.insertId);
              sql = 'SELECT * FROM tour WHERE id = ?';
              connection.query(sql, results.insertId, (errTwo, tour) => {
                if (errTwo) {
                  res.status(500).json({ errorMessage: errTwo.message });
                } else {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.status(201).json(tour);
                }
              });
            }
          },
        );
      }
    });
});

module.exports = router;