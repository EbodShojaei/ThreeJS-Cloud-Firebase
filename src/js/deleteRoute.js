const deleteRoute = (router, routePath) => {
    // Find the route in the router stack
    const route = router.stack.find(layer => {
        return layer.route && layer.route.path === routePath;
    });

    if (route) {
        // Remove the route from the router stack
        router.stack.splice(router.stack.indexOf(route), 1);
    }
}

module.exports = deleteRoute;