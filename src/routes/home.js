const { router } = require('@config/dependencies');
const sendLoad = require('@routes/api/sendLoad');

router.get('/', (req, res) => {
    sendLoad();
    res.render('index');
  });

module.exports = router;