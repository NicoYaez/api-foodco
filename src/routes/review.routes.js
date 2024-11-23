const express = require('express');
const router = express.Router();

const reviewController = require('../controllers/review.controller');

router.post('/create', reviewController.createReview);

router.get('/list', reviewController.getReviews);

router.get('/orden-compra/:orderId', reviewController.getReviewsByOrderId);
 

module.exports = router;
