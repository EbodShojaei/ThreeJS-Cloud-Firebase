const checkSession = (req, res, next) => {
    if (!req.session.init) {
        const isHome = req.originalUrl === '/' || req.path === '/';
        console.log('originalUrl: ' + req.originalUrl);
        console.log('path: ' + req.path);

        if (isHome) {
            console.log('Generating session...');
            next();
        } else {
            // console.log('Invalid session');
            return res.render('error', { statusCode: 403, errorMessage: 'Forbidden. Invalid session.' });
        }
    } else {
        // console.log('Valid session');
        next();
    }
};

module.exports = checkSession;
