const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { list, create, update, remove } = require('../controllers/projects.controller');

const router = express.Router();

router.get('/', list);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);
router.delete('/:id', requireAuth, remove);

module.exports = router;
