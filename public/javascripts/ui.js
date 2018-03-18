
define([],
    function () {
        var UI = {};
        UI.selectedOffset = {
            x: 0,
            y: 0
        }
        UI.init = function () {

        }
        function hexCorner(center, size, i) {
            var angleDeg = 60 * i + 30
            var angleRad = Math.PI / 180 * angleDeg
            return {
                x: center.x + size * Math.cos(angleRad),
                y: center.y + size * Math.sin(angleRad)
            }
        }
        UI.drawCursor = function (pixiGraphics, hexMap, hexIntColor) {
            pixiGraphics.lineStyle(5, hexIntColor);
            for (let i = 0; i <= 6; i++) {
                let cornerPos = hexCorner({ x: 0, y: 0 }, hexMap.tileHeightInPixels / 2, i % 6);
                if (i == 0) {
                    pixiGraphics.moveTo(cornerPos.x, cornerPos.y);
                }
                else {
                    pixiGraphics.lineTo(cornerPos.x, cornerPos.y);
                }
            }
        }
        return UI;
    }
);