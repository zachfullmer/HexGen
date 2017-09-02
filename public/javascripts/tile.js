
define(['jquery', 'sprites'],
    function ($, sprites) {
        var tileTypes = {
            blank: {
            },
            ocean: {
            },
            tundraSnow: {
            },
            tundra: {
            },
            grassland: {
            },
            semiarid: {
            },
            desert: {
            },
            forest: {
            },
            taiga: {
            },
            jungle: {
            },
            swamp: {
            },
            swampPlant: {
            },
            savanna: {
            },
            savannaTree: {
            },
            taigaSnow: {
            },
        };
        function loadTiles() {
            var deferred = $.Deferred();
            sprites.addSpriteList('terrain.sprites')
                .then(() => {
                    tileTypes.blank.sprite = sprites.getSprite('terrain', '/tiles/full/blank');
                    tileTypes.ocean.sprite = sprites.getSprite('terrain', '/tiles/full/ocean');
                    tileTypes.tundraSnow.sprite = sprites.getSprite('terrain', '/tiles/full/tundraSnow');
                    tileTypes.tundra.sprite = sprites.getSprite('terrain', '/tiles/full/tundra');
                    tileTypes.grassland.sprite = sprites.getSprite('terrain', '/tiles/full/grassland');
                    tileTypes.semiarid.sprite = sprites.getSprite('terrain', '/tiles/full/semiarid');
                    tileTypes.desert.sprite = sprites.getSprite('terrain', '/tiles/full/desert');
                    tileTypes.forest.sprite = sprites.getSprite('terrain', '/tiles/full/forest');
                    tileTypes.taiga.sprite = sprites.getSprite('terrain', '/tiles/full/taiga');
                    tileTypes.jungle.sprite = sprites.getSprite('terrain', '/tiles/full/jungle');
                    tileTypes.swamp.sprite = sprites.getSprite('terrain', '/tiles/full/swamp');
                    tileTypes.swampPlant.sprite = sprites.getSprite('terrain', '/tiles/full/swampPlant');
                    tileTypes.savanna.sprite = sprites.getSprite('terrain', '/tiles/full/savanna');
                    tileTypes.savannaTree.sprite = sprites.getSprite('terrain', '/tiles/full/savannaTree');
                    tileTypes.taigaSnow.sprite = sprites.getSprite('terrain', '/tiles/full/taigaSnow');
                    deferred.resolve();
                });
            return deferred.promise();
        }
        return {
            tileTypes: tileTypes,
            loadTiles: loadTiles
        };
    }
);