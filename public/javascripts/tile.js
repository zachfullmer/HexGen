
define(['jquery', 'sprites', 'tint', 'gradient', 'color'],
    function ($, sprites, tint, gradient, color) {
        var featureTypes = {
            mountain: {
                name: 'Mountain',
                full:
                { spriteName: '/mountains/full/1', offsetX: 1, offsetY: -14 },
                half:
                { spriteName: '/mountains/half/1', offsetX: 1, offsetY: -6 },
                quarter:
                { spriteName: '/mountains/quarter/1', offsetX: 1, offsetY: -2 }
            },
            forestS: {
                name: 'Forest S',
                full: { spriteName: '/plants/forest/s1', offsetX: -5, offsetY: -4 }
            },
            forestM: {
                name: 'Forest M',
                full: { spriteName: '/plants/forest/m1', offsetX: -3, offsetY: -17 }
            },
            forestL: {
                name: 'Forest L',
                full: { spriteName: '/plants/forest/l1', offsetX: -3, offsetY: -20 }
            },
            taigaS: {
                name: 'Taiga S',
                full: { spriteName: '/plants/pine/s1', offsetX: -8, offsetY: -15 }
            },
            taigaM: {
                name: 'Taiga M',
                full: { spriteName: '/plants/pine/m1', offsetX: -6, offsetY: -18 }
            },
            taigaL: {
                name: 'Taiga L',
                full: { spriteName: '/plants/pine/l1', offsetX: 1, offsetY: -16 }//-5,-28
            },
            taigaSnowS: {
                name: 'Taiga S',
                full: { spriteName: '/plants/pineSnow/s1', offsetX: -8, offsetY: -15 }
            },
            taigaSnowM: {
                name: 'Taiga M',
                full: { spriteName: '/plants/pineSnow/m1', offsetX: -6, offsetY: -18 }
            },
            taigaSnowL: {
                name: 'Taiga L',
                full: { spriteName: '/plants/pineSnow/l1', offsetX: -5, offsetY: -28 }
            }
        }
        var tileTypes = {
            blank: {
                spriteName: '/tiles/full/blank',
                color: { r: 255, g: 255, b: 255 }
            },
            ocean: {
                spriteName: '/tiles/full/ocean',
                color: { r: 255, g: 255, b: 255 },
                tinted: true,
                gradient: {
                    type: 'height',
                    keys: [
                        { value: 30, color: { r: 0, g: 42, b: 179 } },
                        { value: 100, color: { r: 58, g: 146, b: 255 } }
                    ]
                }
            },
            tundraSnow: {
                spriteName: '/tiles/full/tundraSnow',
                color: { r: 255, g: 255, b: 255 }
            },
            tundra: {
                spriteName: '/tiles/full/tundra',
                color: { r: 255, g: 255, b: 255 }
            },
            grassland: {
                spriteName: '/tiles/full/grassland',
                color: { r: 255, g: 255, b: 255 }
            },
            semiarid: {
                spriteName: '/tiles/full/semiarid',
                color: { r: 255, g: 255, b: 255 }
            },
            desert: {
                spriteName: '/tiles/full/desert',
                color: { r: 240, g: 213, b: 148 }
            },
            forest: {
                feature: featureTypes.forest,
                spriteName: '/tiles/full/forest',
                color: { r: 255, g: 255, b: 255 }
            },
            taiga: {
                feature: featureTypes.taigaL,
                spriteName: '/tiles/full/taiga',
                color: { r: 255, g: 255, b: 255 }
            },
            jungle: {
                spriteName: '/tiles/full/jungle',
                color: { r: 255, g: 255, b: 255 }
            },
            swamp: {
                spriteName: '/tiles/full/swamp',
                color: { r: 255, g: 255, b: 255 }
            },
            swampPlant: {
                spriteName: '/tiles/full/swampPlant',
                color: { r: 255, g: 255, b: 255 }
            },
            savanna: {
                spriteName: '/tiles/full/savanna',
                color: { r: 255, g: 255, b: 255 }
            },
            savannaTree: {
                spriteName: '/tiles/full/savannaTree',
                color: { r: 255, g: 255, b: 255 }
            },
            taigaSnow: {
                feature: featureTypes.taigaSnow,
                spriteName: '/tiles/full/taigaSnow',
                color: { r: 255, g: 255, b: 255 }
            }
        };
        function loadTiles() {
            var deferred = $.Deferred();
            sprites.addSpriteList('terrain.sprites')
                .then(() => {
                    var sheet = $('#terrainSpriteSheet')[0];
                    for (let t in tileTypes) {
                        tileTypes[t].name = t;
                        tileTypes[t].sprite = sprites.getSprite('terrain', tileTypes[t].spriteName);
                        if (tileTypes[t].tinted !== undefined) {
                            tileTypes[t].tintedSprite = new tint.TintedSprite(sheet, tileTypes[t].sprite);
                        }
                        if (tileTypes[t].gradient !== undefined) {
                            let grad = tileTypes[t].gradient;
                            let indexOffset = grad.keys[0].value;
                            let colors = [], keys = [];
                            for (let k in grad.keys) {
                                colors.push(grad.keys[k].color);
                                keys.push(grad.keys[k].value - indexOffset);
                            }
                            tileTypes[t].colorList = gradient.createGradientMap(colors, keys);
                            console.log(tileTypes[t]);
                        }
                        if (tileTypes[t].color === undefined) {
                            throw Error('tile "' + tileTypes[t].name + '" has no color attribute');
                        }
                        tileTypes[t].colorHex = color.rgbToHex(
                            tileTypes[t].color.r,
                            tileTypes[t].color.g,
                            tileTypes[t].color.b);
                    }
                    deferred.resolve();
                });
            return deferred.promise();
        }
        function loadFeatures() {
            var deferred = $.Deferred();
            sprites.addSpriteList('feature.sprites')
                .then(() => {
                    for (let f in featureTypes) {
                        featureTypes[f].full.sprite = sprites.getSprite('feature', featureTypes[f].full.spriteName);
                    }
                    deferred.resolve();
                });
            return deferred.promise();
        }
        return {
            featureTypes: featureTypes,
            loadFeatures: loadFeatures,
            loadTiles: loadTiles,
            tileTypes: tileTypes
        };
    }
);