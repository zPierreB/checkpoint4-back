require('dotenv').config();
const router = require('express').Router();
const Joi = require('@hapi/joi');
const connection = require('../db_connection');

const schema = Joi.object({
    name: Joi.string(),
    fileLocation: Joi.string(),
    mediaType: Joi.string(),
});

const validationData = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(401).json({ errorMessage: error.details[0].message});
    } else {
        next();
    }
};

// Afficher toutes les pictures
router.get('/', (req, res) => {
    const sql = 'SELECT * FROM picture';
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

router.get('/:id', (req, res) => {
    const idMedia = req.params.id;
    const sql = 'SELECT * FROM picture WHERE id = ?';
    connection.query(sql, [idMedia], (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(results);
      }
    });
});

// Ajouter une picture
router.post('/', validationData, (req, res) => {
    const { name, fileLocation, mediaType } = req.body;
    let sql = 'SELECT * FROM picture WHERE name=?';
    connection.query(sql, name, (errOne, resultsOne) => {
      if (errOne) {
        res.status(500).json({ errorMessage: errOne.message });
      } else if (resultsOne.length > 0) {
        res.status(401).json({ errorMessage: 'Ce nom de fichier est déjà utilisé' });
      } else {
        sql = 'INSERT INTO picture SET ?';
        connection.query( sql, { name, fileLocation, mediaType }, (err, results) => {
            if (err) {
              res.status(500).json({ errorMessage: err.message });
            } else {
              console.log('id: ', results.insertId);
              sql = 'SELECT * FROM picture WHERE id = ?';
              connection.query(sql, results.insertId, (errTwo, picture) => {
                if (errTwo) {
                  res.status(500).json({ errorMessage: errTwo.message });
                } else {
                  res.setHeader('Access-Control-Allow-Origin', '*');
                  res.status(201).json(picture);
                }
              });
            }
          },
        );
      }
    });
});

// Modifier une picture
router.put('/:id', validationData, (req, res) => {
    const formData = req.body;
    const idMedia = req.params.id;
    connection.query(
      'UPDATE media SET ? WHERE id = ?',
      [formData, idMedia],
      (err) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send(`Erreur lors de la modification du média : ${err.message}`);
        } else {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.sendStatus(200);
        }
      },
    );
});

// Supprimer une picture
router.delete('/:id', (req, res) => {
    const idMedia = req.params.id;
    connection.query('DELETE FROM media WHERE id = ?', [idMedia], (err) => {
      if (err) {
        res
          .status(500)
          .send(`Erreur lors de la supression des données(${err.message})`);
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.sendStatus(200);
      }
    });
});

module.exports = router;