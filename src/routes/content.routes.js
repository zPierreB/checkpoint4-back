require('dotenv').config();
const router = require('express').Router();
const Joi = require('@hapi/joi');
const connection = require('../db_connection');

const schema = Joi.object({
    title: Joi.string(),
    text: Joi.string(),
    pictureID: Joi.number(),
});

const validationData = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(401).json({ errorMessage: error.details[0].message });
    } else {
        next();
    }
};

// Afficher tous les content
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM content JOIN picture ON content.pictureID = picture.id';
    connection.query(sql, (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
        res.setHeader('X-Total-Count', results.length);
        res.status(200).json(results);
      }
    });
});

// Afficher un content
router.get('/:id', (req, res) => {
    const idcontent = req.params.id;
    const sql = 'SELECT * FROM content JOIN picture ON content.pictureID = picture.id WHERE content.id = ?';
    connection.query(sql, [idcontent], (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(results);
      }
    });
});

// Ajouter d'un content
router.post('/', validationData, (req, res) => {
    const {
      title, text, pictureID,
    } = req.body;
    let sql = 'SELECT * FROM content WHERE title=?';
    connection.query(sql, title, (errOne, resultsOne) => {
      if (errOne) {
        res.status(500).json({ errorMessage: errOne.message });
      } else if (resultsOne.length > 0) {
        res.status(401).json({ errorMessage: 'Ce titre est déjà utilisé' });
      } else {
        sql = 'INSERT INTO content SET ?';
        connection.query( sql, { title, text, pictureID }, (err, results) => {
            if (err) {
              res.status(500).json({ errorMessage: err.message });
            } else {
              console.log('id: ', results.insertId);
              sql = 'SELECT * FROM content WHERE id = ?';
              connection.query(sql, results.insertId, (errTwo, content) => {
                if (errTwo) {
                  res.status(500).json({ errorMessage: errTwo.message });
                } else {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.status(201).json(content);
                }
              });
            }
          },
        );
      }
    });
});

module.exports = router;