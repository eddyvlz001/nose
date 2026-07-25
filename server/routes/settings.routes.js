const express = require('express');
const requireAuth = require('../middleware/requireAuth');
const { get, update } = require('../controllers/settings.controller');

const router = express.Router();

router.get('/', get);
router.put('/', requireAuth, update);

module.exports = router;
