require('dotenv').config();
const router = require('express').Router();
const Joi = require('@hapi/joi');
const bcrypt = require('bcrypt');
const connection = require('../db_connection');
const { authenticateWithJsonWebToken, createToken } = require('../services/jwt');
const salt = process.env.BCRYPT_SALT;

const schema = Joi.object({
    name: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'fr', 'eu'] } }).required(),
    password: Joi.string().min(8).max(20).required(),
}).with('email', 'password');

const validationData = (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
        res.status(401).json({ errorMessage: error.details[0].message });
    } else {
        next();
    }
};

// Enregistrement d'un admin
// router.post('/register', authenticateWithJsonWebToken, validationData, (req, res) => {
    router.post('/register',  (req, res) => {
    const { name, email, password } = req.body;
    let sql = 'SELECT * FROM admin WHERE email=?';
    // res.sendStatus(200);
    connection.query(sql, email, (errOne, resultsOne) => {
        if (errOne) {
            res.status(500).json({ errorMessage: errOne.message });
        } else if (resultsOne.length > 0) {
            res.status(401).json({ errorMessage: 'Cet email est déjà utilisé' });
        } else {
            bcrypt.hash(password, salt, (errThree, encrypted) => {
                if (errThree) {
                    res.status(500).json({ errorMessage: errThree.message });
                } else {
                    const hashedPassword = encrypted;
                    sql = 'INSERT INTO admin SET ?';
                    connection.query(sql, { name, email, password: hashedPassword }, (err, results) => {
                        if (err) {
                            res.status(500).json({ errorMessage: err.message });
                        } else {
                            console.log('id: ', results.insertId);
                            sql = 'SELECT * FROM admin WHERE id = ?';
                            connection.query(sql, results.insertId, (errTwo, user) => {
                                if (errTwo) {
                                    res.status(500).json({ errorMessage: errTwo.message });
                                } else {
                                    const { password: _, ...newUser } = user[0];
                                    res.status(201).json(newUser);
                                }
                            });
                        }
                    });
                }
            });
        }
    });
});

//Connexion d'un admin
router.post('/login', validationData, (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM admin WHERE email=?';
    connection.query(sql, email, (errOne, resultsOne) => {
        if (errOne) {
            res.status(500).json({ errorMessage: errOne.message });
        } else if (resultsOne.length === 0) {
            res.status(404).json({ errorMessage: 'Email ou Mot de passe incorrect'});
        } else {
            const hashedPassword = resultsOne[0].password;
            bcrypt.compare(password, hashedPassword, (errTwo, same) => {
                if (errTwo || !same) {
                    res.status(401).json({ errorMessage: 'Erreur lors de la saisie du mot de passe'})
                } else {
                    const token = createToken(resultsOne);
                    res.status(200).json({ token });
                }
            });
        }
    });
});

// Afficher tous les admins
router.get('/', (req, res) => {
    const sql = 'SELECT id, name, email FROM admin';
    connection.query(sql, (err, results) => {
        if (err) {
            res.status(500).json({ errorMessage: err.message });
        } else {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Expose-Headers', 'X-Total-Count');
            res.setHeader('X-Total-Count', results.length);
            console.log(results.length);
            res.status(200).json(results);
        }
    });
});
  
  // Afficher un admin
  router.get('/:id', (req, res) => {
    const idAdmin = req.params.id;
    const sql = 'SELECT id, name, email FROM admin WHERE id = ?';
    connection.query(sql, [idAdmin], (err, results) => {
      if (err) {
        res.status(500).json({ errorMessage: err.message });
      } else {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(results);
      }
    });
  });
  
  // Modifier un admin
  router.put('/:id', authenticateWithJsonWebToken, validationData, (req, res) => {
    const formData = req.body;
    const idAdmin = req.params.id;
    connection.query(
      'UPDATE admin SET ? WHERE id = ?',
      [formData, idAdmin],
      (err) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send(`Erreur lors de la modification de l'administrateur: ${err.message}`);
        } else {
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.sendStatus(200);
        }
      },
    );
  });
  
  // Supprimer un admin
  router.delete('/:id', authenticateWithJsonWebToken, (req, res) => {
    const idAdmin = req.params.id;
    connection.query('DELETE FROM admin WHERE id = ?', [idAdmin], (err) => {
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