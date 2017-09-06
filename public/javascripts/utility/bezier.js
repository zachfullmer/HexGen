define(function () {
    // get the coordinates at point t along a cubic bezier curve defined by points
    // 0.0 <= t <= 1.0
    bezier.curveCubic = function (points, t) {
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
    return bezier;
});