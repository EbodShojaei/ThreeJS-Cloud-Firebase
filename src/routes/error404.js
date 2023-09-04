const { router } = require('@config/dependencies');

router.get("*", (req, res) => {
    res.status(404);
    return res.render('error', { statusCode: 404, errorMessage: 'Page not found.' });
});

module.exports = router;
