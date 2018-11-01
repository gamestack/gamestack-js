


/**
 * Takes array of image-src (string) and returns MultiSource

 * @param   {number} x the x coordinate
 * @param   {number} y the y coordinate
 * @param   {number} z the z coordinate
 * @returns {MultiSourceImage} a MultiSourceImage object
 */

class MultiSourceImage {

    constructor(sources, maxWidth, maxHeight) {

        var ctload = 0;

        var sprites = [];

        var canvas = document.createElement('CANVAS');

        this.canvas  = canvas;

        this.canvas.width = maxWidth || 14000;

        this.canvas.height = maxHeight || 14000;

        this.ctx = this.canvas.getContext('2d');

        this.sources = [];

        var __inst = this;

        this.animation = {};

        Gamestack.Canvas.allowOffscreen(10000);

        function getMax(objList, key1, key2)
        {
            var max = 0;

            for(var x in objList)
            {

                if(objList[x][key1][key2] > max)
                {

                    max = objList[x][key1][key2];
                }

            }

            return max;
        };

        for(var x = 0; x < sources.length; x++)
        {
            if(sources[x] instanceof File)
            {
                handleFile(URL.createObjectURL(sources[x]));
            }
            else
            {
                handleFile(sources[x]);
            }

            function handleFile(source)
            {
                __inst.sources.push(source);

                sprites.push(new Gamestack.Sprite(source));

                var sprite = sprites[sprites.length - 1];

                sprite.__imageIx = x;

                sprite.noScroll = true;


                function load(){

                    ctload += 1;

                    if(ctload >= sources.length) {

                        __inst.ctx = __inst.canvas.getContext('2d');


                        var greatestWidth = greatestWidth || 0, greatestHeight = greatestHeight || 0;

                        __inst.xfactor = 0;

                        __inst.yfactor = 0;

                        Gamestack.each(sprites, function (ix, s) {

                            s.size = new Gamestack.Vector( s.image.domElement.width,  s.image.domElement.height);

                            __inst.frameSize = s.size;

                            s.xfactor = Math.floor(__inst.canvas.width / s.size.x);

                            s.yfactor = Math.floor(s.__imageIx / s.xfactor);

                            if(s.xfactor > __inst.xfactor)
                            {
                                __inst.xfactor = s.xfactor;
                            }

                            if(s.yfactor > __inst.yfactor)
                            {
                                __inst.yfactor = s.yfactor;
                            }

                            var posX = (s.__imageIx % s.xfactor) * s.size.x,

                                posY = Math.floor(s.__imageIx / s.xfactor) * s.size.y;

                            //TEST MODE Using first gameWindow

                            s.position = new Gamestack.Vector(posX, posY);


                        });

                        greatestHeight = getMax(sprites, 'position', 'y') + sprites[0].size.y;

                        greatestWidth = getMax(sprites, 'position', 'x') + sprites[0].size.x;

                        __inst.width = greatestWidth;

                        __inst.height = greatestHeight;

                        __inst.canvas.width = greatestWidth;

                        __inst.canvas.height = greatestHeight;


                        Gamestack.each(sprites, function (ix, s) {

                            Gamestack.Canvas.draw(s, __inst.ctx);

                        });

                        if (__inst.load) {

                            __inst.load(__inst);

                        }

                    }

                }

                sprite.afterLoad(function(spr){

                    load();

                });
            };


        }
    }

    onLoad(callback)
    {

        this.load = callback;

    }
}



Gamestack.MultiSourceImage = MultiSourceImage;

Gamestack.MultiSource = MultiSourceImage;
