
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
                while (frameProgress >= (currentCell.delay * 100)) {
                    frameProgress -= (currentCell.delay * 100);
                    currentCellIndex += 1;
                    currentCell = aData.cells[currentCellIndex];
                    if (currentCellIndex >= aData.cells.length) {
                        currentCellIndex = 0;
                        currentCell = aData.cells[0];
                    }
                }
            };
            this.draw = function () {
                // animCtx.clearRect(0, 0, this.animCanvas.width, this.animCanvas.height);
                animCtx.beginPath();
                animCtx.fillStyle = 'darkred';
                animCtx.rect(0, 0, this.animCanvas.width, this.animCanvas.height);
                animCtx.fill();
                animCtx.closePath();
                var sd = currentCell.sprites[0].spriteData;
                animCtx.drawImage(this.img, sd.x, sd.y, sd.w, sd.h, currentCell.sprites[0].x, currentCell.sprites[0].y, sd.w, sd.h);
            };
        }
        return {
            Anim: Anim
        };
    }
);