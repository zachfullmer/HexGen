define(function () {
    var gradient = {};
    function interpolate(x1, x2, t) {
        return x1 + ((x2 - x1) * t);
    }
    gradient.lerpColor = function (col1, col2, t) {
        var result = {
            r: interpolate(col1.r, col2.r, t),
            g: interpolate(col1.g, col2.g, t),
            b: interpolate(col1.b, col2.b, t)
        }
        return result;
    }
    // generate a list of colors, interpolated between the values in colorList
    // colorList:   a list of colors to be interpolated between
    // keyList:     a list of color stops, specifying where each key color lies on the produced gradient
    gradient.createGradientMap = function (colorList, keyList) {
        if (keyList[0] != 0) {
            throw Error('first index in keyList must be zero');
        }
        if (colorList.length < 2) {
            throw Error('the color list must contain at least two colors');
        }
        if (colorList.length != keyList.length) {
            throw Error('the color and key lists must have the same length');
        }
        let lerpList = [];
        for (let c1 = 0, c2 = 1; c2 < colorList.length; c1++ , c2++) {
            for (let k = keyList[c1]; k < keyList[c2]; k++) {
                let index = k - keyList[c1];
                let end = keyList[c2] - keyList[c1];
                lerpList.push(gradient.lerpColor(colorList[c1], colorList[c2], index / end));
            }
        }
        lerpList.push(colorList[colorList.length - 1]);
        return lerpList;
    }
    return gradient;
});