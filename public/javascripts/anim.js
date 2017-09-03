
define(['jquery', 'sprites'],
    function ($, sprites) {
        function Anim(animData) {
            var aData = animData;
            var frameProgress = 0;
            var currentCell = aData.cells[0];
            var currentCellIndex = 0;
            this.img = $(aData.spriteList.sheet)[0];
            this.animCanvas = document.createElement('canvas');
            this.animCanvas.width = aData.extents.x2 - aData.extents.x1;
            this.animCanvas.height = aData.extents.y2 - aData.extents.y1;
            var animCtx = this.animCanvas.getContext('2d');
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
            this.draw = function () {
                animCtx.clearRect(0, 0, this.animCanvas.width, this.animCanvas.height);
                for (let s in currentCell.sprites) {
                    if (currentCell.sprites[s].flipH) {
                        animCtx.scale(-1, 1);
                    }
                    var sd = currentCell.sprites[s].spriteData;
                    animCtx.drawImage(this.img, sd.x, sd.y, sd.w, sd.h, currentCell.sprites[s].x, currentCell.sprites[s].y, sd.w, sd.h);
                    animCtx.setTransform(1, 0, 0, 1, 0, 0);
                }
            };
        }
        return {
            Anim: Anim
        };
    }
);