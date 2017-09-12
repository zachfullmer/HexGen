
define(['jquery', 'sprites', 'pixi'],
    function ($, SPRITES, PIXI) {
        function Anim(animData, onFinish = null) {
            var _aData = animData;
            var _frameProgress = 0;
            var _currentCell = _aData.cells[0];
            var _currentCellIndex = 0;
            var _completedLoops = 0;
            var _img = _aData.spriteList.sheet;
            var _sprites = [];
            var _spriteContainer = new PIXI.Container();
            _spriteContainer.position.set(-_aData.extents.x1, -_aData.extents.y1);
            var _renderTexture = PIXI.RenderTexture.create(_aData.extents.x2 - _aData.extents.x1, _aData.extents.y2 - _aData.extents.y1);
            this.onFinish = onFinish;
            for (let c in _aData.cells) {
                while (_aData.cells[c].sprites.length > _sprites.length) {
                    let sprite = new PIXI.Sprite();
                    _sprites.push(sprite);
                    _spriteContainer.addChild(sprite);
                }
            }
            this.update = function (deltaTime, renderer) {
                _frameProgress += deltaTime;
                while (_frameProgress >= (_currentCell.delay)) {
                    _frameProgress -= (_currentCell.delay);
                    _currentCellIndex += 1;
                    _currentCell = _aData.cells[_currentCellIndex];
                    if (_currentCellIndex >= _aData.cells.length) {
                        _currentCellIndex = 0;
                        _currentCell = _aData.cells[0];
                        _completedLoops++;
                        if (_aData.loops > 0 && _completedLoops >= _aData.loops && this.onFinish) {
                            this.onFinish(this);
                            this.onFinish = null;
                        }
                    }
                }
                for (let s in _currentCell.sprites) {
                    _sprites[s].setTexture(_currentCell.sprites[s].spriteData);
                    _sprites[s].position.set(_currentCell.sprites[s].x, _currentCell.sprites[s].y);
                    _sprites[s].anchor.set(Math.floor(_sprites[s].width / 2) / _sprites[s].width, Math.floor(_sprites[s].height / 2) / _sprites[s].height);
                    _sprites[s].visible = true;
                }
                for (let s = _currentCell.sprites.length; s < _sprites.length; s++) {
                    _sprites[s].visible = false;
                }
                renderer.render(_spriteContainer, _renderTexture);
            };
            this.createSprite = function () {
                let sprite = new PIXI.Sprite(_renderTexture);
                sprite.anchor.set(-_aData.extents.x1 / sprite.width, -_aData.extents.y1 / sprite.height);
                return sprite;
            }
        }
        return {
            Anim: Anim
        };
    }
);