
define(['jquery', 'sprites', 'tint', 'gradient', 'color'],
    function ($, sprites, tint, gradient, color) {
        var featureTypes = {
            mountain: {
                name: 'Mountain',
                color: { r: 98, g: 83, b: 126 },
                full:
                { spriteName: '/mountains/full/1', offsetX: 0, offsetY: -8 },
                half:
                { spriteName: '/mountains/half/1', offsetX: 1, offsetY: -6 },
                quarter:
                { spriteName: '/mountains/quarter/1', offsetX: 1, offsetY: -2 }
            },
            forestS: {
                color: { r: 54, g: 173, b: 67 },
                full: { spriteName: '/plants/forest/s1', offsetX: -3, offsetY: -6 }
            },
            forestM: {
                color: { r: 34, g: 149, b: 46 },
                full: { spriteName: '/plants/forest/m1', offsetX: 0, offsetY: -11 }
            },
            forestL: {
                color: { r: 22, g: 134, b: 20 },
                full: { spriteName: '/plants/forest/l1', offsetX: 0, offsetY: -14 }
            },
            taigaS: {
                color: { r: 50, g: 185, b: 149 },
                full: { spriteName: '/plants/pine/s1', offsetX: -4, offsetY: -11 }
            },
            taigaM: {
                color: { r: 49, g: 172, b: 140 },
                full: { spriteName: '/plants/pine/m1', offsetX: 0, offsetY: -14 }
            },
            taigaL: {
                color: { r: 49, g: 158, b: 131 },
                full: { spriteName: '/plants/pine/l1', offsetX: 1, offsetY: -16 }//-5,-28
            },
            taigaSnowS: {
                color: { r: 136, g: 217, b: 195 },
                full: { spriteName: '/plants/pineSnow/s1', offsetX: -4, offsetY: -11 }
            },
            taigaSnowM: {
                color: { r: 125, g: 188, b: 171 },
                full: { spriteName: '/plants/pineSnow/m1', offsetX: 0, offsetY: -14 }
            },
            taigaSnowL: {
                color: { r: 112, g: 162, b: 149 },
                full: { spriteName: '/plants/pineSnow/l1', offsetX: 1, offsetY: -16 }
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
                color: { r: 212, g: 251, b: 240 }
            },
            tundra: {
                spriteName: '/tiles/full/tundra',
                color: { r: 76, g: 200, b: 178 }
            },
            grassland: {
                spriteName: '/tiles/full/grassland',
                color: { r: 59, g: 191, b: 87 }
            },
            semiarid: {
                spriteName: '/tiles/full/semiarid',
                color: { r: 217, g: 154, b: 107 }
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
                color: { r: 114, g: 167, b: 0 }
            },
            swamp: {
                spriteName: '/tiles/full/swamp',
                color: { r: 0, g: 160, b: 113 }
            },
            swampPlant: {
                spriteName: '/tiles/full/swampPlant',
                color: { r: 255, g: 255, b: 255 }
            },
            savanna: {
                spriteName: '/tiles/full/savanna',
                color: { r: 204, g: 227, b: 98 }
            },
            savannaTree: {
                spriteName: '/tiles/full/savannaTree',
                color: { r: 189, g: 212, b: 36 }
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
                            tileTypes[t].gradCanvas = document.createElement('canvas');
                            tileTypes[t].gradCtx = tileTypes[t].gradCanvas.getContext('2d');
                            tileTypes[t].gradCanvas.width = tileTypes[t].sprite.w * tileTypes[t].colorList.length;
                            tileTypes[t].gradCanvas.height = tileTypes[t].sprite.h;
                            for (let c in tileTypes[t].colorList) {
                                let color = tileTypes[t].colorList[c];
                                tileTypes[t].tintedSprite.setTint(color.r, color.g, color.b);
                                tileTypes[t].tintedSprite.draw(tileTypes[t].gradCtx,
                                    tileTypes[t].sprite.w * c,
                                    0,
                                    tileTypes[t].sprite.w,
                                    tileTypes[t].sprite.h);
                            }
                        }
                        if (tileTypes[t].color === undefined) {
                            throw Error('tile "' + tileTypes[t].name + '" has no color attribute');
                        }
                        tileTypes[t].colorHex = color.rgbToHex(
                            tileTypes[t].color.r,
                            tileTypes[t].color.g,
                            tileTypes[t].color.b);
                    }
                    console.log('tiles loaded');
                    deferred.resolve();
                });
            return deferred.promise();
        }
        function loadFeatures() {
            var deferred = $.Deferred();
            sprites.addSpriteList('feature.sprites')
                .then(() => {
                    for (let f in featureTypes) {
                        featureTypes[f].name = f;
                        featureTypes[f].full.sprite = sprites.getSprite('feature', featureTypes[f].full.spriteName);
                        if (featureTypes[f].color === undefined) {
                            throw Error('feature "' + featureTypes[f].name + '" has no color attribute');
                        }
                        featureTypes[f].colorHex = color.rgbToHex(
                            featureTypes[f].color.r,
                            featureTypes[f].color.g,
                            featureTypes[f].color.b);
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