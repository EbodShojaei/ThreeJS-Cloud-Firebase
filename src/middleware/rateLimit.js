const { rateLimit } = require('@config/dependencies');

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 30, // 30 requests per minute
    handler: (req, res) => {
        console.log('Too many requests.');
        return res.status(429).redirect('/') // Too many requests
    }
});

module.exports = limiter;