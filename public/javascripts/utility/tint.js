define(function () {
    var tint = {};
    // http://www.playmycode.com/blog/2011/06/realtime-image-tinting-on-html5-canvas/
    function generateRGBKs(img, spriteRect) {
        var rgbks = [];

        var canvas = document.createElement("canvas");
        canvas.width = spriteRect.w;
        canvas.height = spriteRect.h;

        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, spriteRect.x, spriteRect.y, spriteRect.w, spriteRect.h,
            0, 0, spriteRect.w, spriteRect.h);

        var pixels = ctx.getImageData(0, 0, spriteRect.w, spriteRect.h).data;

        // 4 is used to ask for 3 images: red, green, blue and
        // black in that order.
        for (var rgbI = 0; rgbI < 4; rgbI++) {
            var canvas = document.createElement("canvas");
            canvas.width = spriteRect.w;
            canvas.height = spriteRect.h;

            var compCtx = canvas.getContext('2d');
            compCtx.drawImage(img, spriteRect.x, spriteRect.y, spriteRect.w, spriteRect.h,
                0, 0, spriteRect.w, spriteRect.h);
            var to = compCtx.getImageData(0, 0, spriteRect.w, spriteRect.h);
            var toData = to.data;

            for (
                var i = 0, len = pixels.length;
                i < len;
                i += 4
            ) {
                toData[i] = (rgbI === 0) ? pixels[i] : 0;
                toData[i + 1] = (rgbI === 1) ? pixels[i + 1] : 0;
                toData[i + 2] = (rgbI === 2) ? pixels[i + 2] : 0;
                toData[i + 3] = pixels[i + 3];
            }

            compCtx.putImageData(to, 0, 0);

            // image is _slightly_ faster then canvas for this, so convert
            var imgComp = new Image();
            imgComp.src = canvas.toDataURL();

            rgbks.push(imgComp);
        }
        return rgbks;
    }
    tint.TintedSprite = function (sheet, spriteRect) {
        var components = generateRGBKs(sheet, spriteRect);
        var tint = { r: 1.0, g: 1.0, b: 1.0 };
        var tintCanvas = document.createElement('canvas');
        tintCanvas.width = components[0].width;
        tintCanvas.height = components[0].height;
        var tintCtx = tintCanvas.getContext('2d');
        this.setTint = function (red, green, blue) {
            if ((typeof red != 'number' || red < 0 || red > 255) ||
                (typeof green != 'number' || green < 0 || green > 255) ||
                (typeof blue != 'number' || blue < 0 || blue > 255)) {
                throw Error('tint component values must be numbers between 0 and 255');
            }
            tint.r = red / 255; tint.g = green / 255; tint.b = blue / 255;
        };
        this.draw = function (ctx, destX, destY, destW = tintCanvas.width, destH = tintCanvas.height) {
            tintCtx.clearRect(0, 0, tintCanvas.width, tintCanvas.height);
            tintCtx.globalCompositeOperation = 'source-over';
            tintCtx.globalAlpha = 1.0;
            tintCtx.drawImage(components[3], 0, 0);
            tintCtx.globalCompositeOperation = 'lighter';
            tintCtx.globalAlpha = tint.r;
            tintCtx.drawImage(components[0], 0, 0);
            tintCtx.globalAlpha = tint.g;
            tintCtx.drawImage(components[1], 0, 0);
            tintCtx.globalAlpha = tint.b;
            tintCtx.drawImage(components[2], 0, 0);
            tintCtx.globalCompositeOperation = 'source-over';
            ctx.drawImage(tintCanvas, destX, destY, destW, destH);
        };
    }
    return tint;
});