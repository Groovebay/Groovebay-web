const express = require('express');
const myparcelWebhooks = require('./myparcel');

const webhooksRouter = express.Router();

// MyParcel sends JSON payloads for webhook notifications
webhooksRouter.post('/myparcel', express.json({ type: '*/*' }), myparcelWebhooks);
module.exports = webhooksRouter;
