
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
                if (UNIT.unitTypes[u].animListName && UNIT.unitTypes[u].animName) {
                    UNIT.unitTypes[u].anim = SPRITES.animLists[UNIT.unitTypes[u].animListName][UNIT.unitTypes[u].animName];
                    if (UNIT.unitTypes[u].anim === undefined) {
                        throw Error('could not find animation "' + UNIT.unitTypes[u].animName + '" in anim file "' + UNIT.unitTypes[u].animListName + '"');
                    }
                }
            }
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
            if (this.type.anim) {
                this.anim = new ANIM.Anim(this.type.anim);
                this.sprite = this.anim.spriteContainer;
            }
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