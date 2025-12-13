const express = require('express');
const getRates = require('./get-rates');
const createShipment = require('./create-shipment');
const getShipmentLabel = require('./get-shipment-label');
const { auth } = require('../../middleware');
const validateAddress = require('./validate-address');
const shippingRouter = express.Router();

// Address validation endpoint
shippingRouter.post('/rates', auth, getRates);

// Shipping label creation endpoint
shippingRouter.post('/shipments', auth, createShipment);

// Get shipment label endpoint
shippingRouter.post('/labels', auth, getShipmentLabel);

// Validate address endpoint
shippingRouter.post('/validate-address', auth, validateAddress);

module.exports = shippingRouter;
