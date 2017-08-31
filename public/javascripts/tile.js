
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
        function loadSprites() {
            var deferred = $.Deferred();
            $.getJSON('data/terrain.json', function (json) {
                for (let t in tileTypes) {
                    tileTypes[t].sprite = json[tileTypes[t].sprite_name];
                }
                deferred.resolve();
                console.log('loaded sprites');
            });
            return deferred.promise();
        }
        return {
            loadSprites: loadSprites,
            tileTypes: tileTypes
        };
    }
);