const { getDashboard, getClientSavings, verifySaving } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboard);
router.get('/client/:id/savings', getClientSavings);
router.put('/verify-saving/:id', verifySaving);

module.exports = router;
