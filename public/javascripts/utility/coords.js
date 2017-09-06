define(function () {
    var coords = {};
    coords.cartToPolar = function (cart) {
        let polar = {};
        polar.x = Math.sqrt(cart.x * cart.x + cart.y * cart.y);
        polar.y = Math.atan2(cart.y, cart.x);
        return polar;
    }
    coords.polarToCart = function (polar) {
        let cart = {};
        cart.x = polar.x * Math.cos(polar.y);
        cart.y = polar.x * Math.sin(polar.y);
        return cart;
    }
    // get the coordinates at point t along a cubic bezier curve defined by points
    // 0.0 <= t <= 1.0
    coords.curveCubic = function (points, t) {
        let t2 = t * t;
        let t3 = t2 * t;
        let mt = 1 - t;
        let mt2 = mt * mt;
        let mt3 = mt2 * mt;
        let result = {};
        result.x = points[0].x * mt3 + 3 * points[1].x * mt2 * t + 3 * points[2].x * mt * t2 + points[3].x * t3;
        result.y = points[0].y * mt3 + 3 * points[1].y * mt2 * t + 3 * points[2].y * mt * t2 + points[3].y * t3;
        return result;
    }
    // approximate the length of a cubic curve
    coords.lengthCubic = function (points) {
        // http://www.lemoda.net/maths/bezier-length/index.html
        let t = 0;
        let i = 0;
        let steps = 10;
        let dot;
        let previousDot;
        let length = 0;
        for (i = 0; i <= steps; i++) {
            t = i / steps;
            dot = curveCubic(points, t);
            if (i > 0) {
                let diff = { x: dot.x - previousDot.x, y: dot.y - previousDot.y };
                length += sqrt(diff.x * diff.x + diff.y * diff.y);
            }
            previousDot = dot;
        }
        return length;
    }
    return coords;
});