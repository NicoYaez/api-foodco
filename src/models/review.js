const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const reviewSchema = new Schema({
    foodQuality: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    menuVariety: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    deliveryTime: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    staffFriendliness: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    cleanliness: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    specialRequests: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    valueForMoney: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    easeOfContact: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    creativity: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    overallSatisfaction: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    totalScore: {
        type: Number
    },
    ordenCompra: {
        type: Schema.Types.ObjectId,
        ref: 'OrdenCompra',
        required: true
    },
    comentario: { type: String },
}, {
    timestamps: true,
    versionKey: false
});

reviewSchema.methods.calculateTotalScore = function () {
    const weights = {
        foodQuality: 0.2,
        menuVariety: 0.1,
        deliveryTime: 0.15,
        staffFriendliness: 0.1,
        cleanliness: 0.15,
        specialRequests: 0.1,
        valueForMoney: 0.1,
        easeOfContact: 0.05,
        creativity: 0.05,
        overallSatisfaction: 0.2,
    };

    this.totalScore = (
        this.foodQuality * weights.foodQuality +
        this.menuVariety * weights.menuVariety +
        this.deliveryTime * weights.deliveryTime +
        this.staffFriendliness * weights.staffFriendliness +
        this.cleanliness * weights.cleanliness +
        this.specialRequests * weights.specialRequests +
        this.valueForMoney * weights.valueForMoney +
        this.easeOfContact * weights.easeOfContact +
        this.creativity * weights.creativity +
        this.overallSatisfaction * weights.overallSatisfaction
    ).toFixed(2);
};

const Review = model('Review', reviewSchema);

module.exports = Review;
