
define(['jquery'],
    function ($) {
        var tileTypes = {
            grass: {
                sprite_name: 'med_grass'
            },
            sandDesert: {
                sprite_name: 'large_sand_desert'
            }
        };
        function loadSprites(callback) {
            $.getJSON('data/terrain.json', function (json) {
                for (let t in tileTypes) {
                    tileTypes[t].sprite = json[tileTypes[t].sprite_name];
                }
                callback();
            });
        }
        return {
            loadSprites: loadSprites,
            tileTypes: tileTypes
        };
    }
);