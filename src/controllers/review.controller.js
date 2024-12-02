const Review = require('../models/review');

const createReview = async (req, res) => {
    try {
        const review = new Review(req.body);
        review.calculateTotalScore();
        await review.save();
        res.status(201).json({ message: 'Valoración creada con éxito', review });
    } catch (error) {
        res.status(400).json({ message: 'Error al crear la Valoración', error });
    }
};

const getReviews = async (req, res) => {
    try {
        const reviews = await Review.find();
        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error en la búsqueda de Valoraciones', error });
    }
};

const getReviewById = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Valoración no encontrada' });
        }
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Error en la búsqueda de Valoraciones', error });
    }
};

const getReviewsByOrderId = async (req, res) => {
    try {
        const { orderId } = req.params;

        const reviews = await Review.find({ ordenCompra: orderId });

        if (reviews.length === 0) {
            return res.status(404).json({ message: 'No se han encontrado Valoraciones para este ID de pedido' });
        }

        res.status(200).json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Error en la búsqueda de Valoraciones', error });
    }
};

const updateReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        });
        if (!review) {
            return res.status(404).json({ message: 'Valoración no encontrada' });
        }
        review.calculateTotalScore();
        await review.save();
        res.status(200).json({ message: 'Valoración actualizada correctamente', review });
    } catch (error) {
        res.status(400).json({ message: 'Error actualizando Valoración', error });
    }
};

const deleteReview = async (req, res) => {
    try {
        const review = await Review.findByIdAndDelete(req.params.id);
        if (!review) {
            return res.status(404).json({ message: 'Valoración no encontrada' });
        }
        res.status(200).json({ message: 'Valoración eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando Valoración', error });
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