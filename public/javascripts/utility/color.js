define(function () {
    var color = {};
    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
    color.rgbToHexString = function (r, g, b) {
        return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
    }
    color.rgbToHexInt = function (r, g, b) {
        let hexString = componentToHex(Math.round(r)) + componentToHex(Math.round(g)) + componentToHex(Math.round(b));
        return parseInt(hexString, 16);
    }
    color.hexIntToHexString = function (hexInt) {
        let hexString = hexInt.toString(16);
        while (hexString.length < 6) hexString = '0' + hexString;
        return '#' + hexString;
    }
    return color;
});