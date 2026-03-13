const express = require('express');
const {
  getClients,
  deactivateClient,
  getClientReceipts,
  getClientStatement
} = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/clients', getClients);
router.put('/clients/:clientId/deactivate', deactivateClient);
router.get('/clients/:clientId/receipts', getClientReceipts);
router.get('/clients/:clientId/statement', getClientStatement);

module.exports = router;
