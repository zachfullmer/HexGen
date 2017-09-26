
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
                SPRITES.getEntityTypeGraphics(SITE.siteTypes[s]);
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
            SPRITES.createEntityGraphics(this);
        };
        return SITE;
    }
);