
define(['jquery', 'sprites', 'pixi', 'window', 'anim'],
    function ($, SPRITES, PIXI, WINDOW, ANIM) {
        var SITE = {};
        SITE.siteTypes = {
            humanCity: {
                name: 'Human City',
                animListName: 'castle',
                animName: 'castle'
            }
        };
        SITE.loadSites = function () {
            for (let s in SITE.siteTypes) {
                if (SITE.siteTypes[s].animListName && SITE.siteTypes[s].animName) {
                    SITE.siteTypes[s].anim = SPRITES.animLists[SITE.siteTypes[s].animListName][SITE.siteTypes[s].animName];
                    if (SITE.siteTypes[s].anim === undefined) {
                        throw Error('could not find animation "' + SITE.siteTypes[s].animName + '" in anim file "' + SITE.siteTypes[s].animListName + '"');
                    }
                }
            }
            console.log('sites loaded');
        }
        SITE.get = function (typeName) {
            if (SITE.siteTypes[typeName] === undefined) {
                throw Error('tried to access nonexistent site type "' + typeName + '"');
            }
            return SITE.siteTypes[typeName];
        }
        SITE.Site = function (type) {
            this.name = 'a site';
            this.type = type;
            this.pos = { x: 0, y: 0 };
            this.anim = null;
            this.sprite = null;
            if (this.type.anim) {
                this.anim = new ANIM.Anim(this.type.anim);
                this.sprite = this.anim.spriteContainer;
            }
        };
        return SITE;
    }
);