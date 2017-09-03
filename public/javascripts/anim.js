
define(['jquery', 'sprites'],
    function ($, sprites) {
        function Anim(animData) {
            var aData = animData;
            var frameProgress = 0;
            var currentCell = aData.cells[0];
            var currentCellIndex = 0;
            var img = aData.spriteList.sheet;
            var animCanvas = document.createElement('canvas');
            animCanvas.width = aData.extents.x2 - aData.extents.x1;
            animCanvas.height = aData.extents.y2 - aData.extents.y1;
            var animCtx = animCanvas.getContext('2d');
            this.update = function (deltaTime) {
                frameProgress += deltaTime;
                while (frameProgress >= (currentCell.delay)) {
                    frameProgress -= (currentCell.delay);
                    currentCellIndex += 1;
                    currentCell = aData.cells[currentCellIndex];
                    if (currentCellIndex >= aData.cells.length) {
                        currentCellIndex = 0;
                        currentCell = aData.cells[0];
                    }
                }
            };
            this.renderFrame = function () {
                animCtx.clearRect(0, 0, animCanvas.width, animCanvas.height);
                for (let s in currentCell.sprites) {
                    var sprite = currentCell.sprites[s];
                    var sd = sprite.spriteData;
                    if (sprite.flipH || sprite.flipV) {
                        animCtx.scale(sprite.flipH ? -1 : 1, sprite.flipV ? -1 : 1);
                    }
                    animCtx.drawImage(img, sd.x, sd.y, sd.w, sd.h, sprite.x, sprite.y, sd.w, sd.h);
                    animCtx.setTransform(1, 0, 0, 1, 0, 0);
                }
            };
            this.draw = function (ctx, x, y) {
                ctx.drawImage(animCanvas, 0, 0, animCanvas.width, animCanvas.height,
                    x + aData.offset.x,
                    y + aData.offset.y,
                    animCanvas.width,
                    animCanvas.height);
            };
        }
        return {
            Anim: Anim
        };
    }
);