define(['jquery', 'sprites', 'pixi'],
    function ($, SPRITES, PIXI) {
        function Anim(animData, onFinish = null) {
            var aData = animData;
            var frameProgress = 0;
            var currentCell = aData.cells[0];
            var currentCellIndex = 0;
            var completedLoops = 0;
            var img = aData.spriteList.sheet;
            var sprites = [];
            this.onFinish = onFinish;
            this.spriteContainer = new PIXI.Container();
            for (let c in aData.cells) {
                while (aData.cells[c].sprites.length > sprites.length) {
                    let sprite = new PIXI.Sprite();
                    sprites.push(sprite);
                    this.spriteContainer.addChild(sprite);
                }
            }
            this.update = function (deltaTime) {
                frameProgress += deltaTime;
                while (frameProgress >= (currentCell.delay)) {
                    frameProgress -= (currentCell.delay);
                    currentCellIndex += 1;
                    currentCell = aData.cells[currentCellIndex];
                    if (currentCellIndex >= aData.cells.length) {
                        currentCellIndex = 0;
                        currentCell = aData.cells[0];
                        completedLoops++;
                        if (aData.loops > 0 && completedLoops >= aData.loops && this.onFinish) {
                            this.onFinish(this);
                            this.onFinish = null;
                        }
                    }
                }
                for (let s in currentCell.sprites) {
                    sprites[s].setTexture(currentCell.sprites[s].spriteData);
                    sprites[s].position.set(currentCell.sprites[s].x, currentCell.sprites[s].y);
                    sprites[s].anchor.set(Math.floor(sprites[s].width / 2) / sprites[s].width, Math.floor(sprites[s].height / 2) / sprites[s].height);
                    sprites[s].visible = true;
                }
                for (let s = currentCell.sprites.length; s < sprites.length; s++) {
                    sprites[s].visible = false;
                }
            };
        }
        return {
            Anim: Anim
        };
    }
);