const Review = require('../models/review');

const createReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        review.calculateTotalScore();
        await review.save();
        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        res.status(400).json({ message: 'Error creating review', error });
    }
};

// Obtener todas las valoraciones
const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};

// Obtener una valoración por ID
const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching review', error });
    }
};

const getReviewsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        // Busca las reviews asociadas a un ID de orden de compra
        const reviews = await Review.find({ ordenCompra: orderId });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No reviews found for this order ID' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reviews', error });
    }
};


// Actualizar una valoración
const updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        review.calculateTotalScore();
        await review.save();
        res.status(200).json({ message: 'Review updated successfully', review });
    } catch (error) {
        res.status(400).json({ message: 'Error updating review', error });
    }
};

// Eliminar una valoración
const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }
        res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting review', error });
    }
};

module.exports = {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview,
    getReviewsByOrderId
};