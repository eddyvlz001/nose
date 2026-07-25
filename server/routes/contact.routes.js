const express = require('express');
const { send } = require('../controllers/contact.controller');

const router = express.Router();

router.post('/', send);

module.exports = router;
