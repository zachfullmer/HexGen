
define(['jquery', 'sprites', 'pixi', 'window', 'anim'],
    function ($, SPRITES, PIXI, WINDOW, ANIM) {
        var UNIT = {};
        UNIT.unitTypes = {
            army: {
                name: 'Army',
                animListName: 'monsters',
                animName: 'Bowser'
            }
        };
        UNIT.loadUnits = function () {
            for (let u in UNIT.unitTypes) {
                SPRITES.getEntityTypeGraphics(UNIT.unitTypes[u]);
            }
            console.log(SPRITES.spriteLists);
            console.log('units loaded');
        }
        UNIT.get = function (typeName) {
            if (UNIT.unitTypes[typeName] === undefined) {
                throw Error('tried to access nonexistent unit type "' + typeName + '"');
            }
            return UNIT.unitTypes[typeName];
        }
        UNIT.Unit = function (type) {
            this.type = type;
            this.pos = { x: 0, y: 0 };
            this.path = [];
            this.anim = null;
            this.sprite = null;
            SPRITES.createEntityGraphics(this);
            this.canPass = function (tile) {
                if (!this.type.canPassWater && tile.terrain.water) {
                    return false;
                }
                return true;
            }
        };
        return UNIT;
    }
);