const router = require('express').Router();
const adminRouter = require('./admins.routes');
const contentRouter = require('./content.routes');
const pictureRouter = require('./picture.routes');
const tourneeRouter = require('./tournee.routes');

router.use('/admins', adminRouter);
router.use('/content', contentRouter);
router.use('/picture', pictureRouter);
router.use('/tournee', tourneeRouter);

module.exports = router;