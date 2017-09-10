define(function () {
    var color = {};
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    color.rgbToHexInt = function (r, g, b) {
        let hexString = componentToHex(Math.round(r)) + componentToHex(Math.round(g)) + componentToHex(Math.round(b));
        return parseInt(hexString, 16);
    }
    return color;
});