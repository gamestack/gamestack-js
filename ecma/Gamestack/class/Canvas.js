

/**
 * instantiates Gamestack.js Canvas (CanvasLib) controller

 @description
 This Canvas library handles the low-level drawing of Sprite() objects on HTML5Canvas.
 -draws Sprites(), handling their rotation, size, and other parameters.
 * @returns {CanvasLib} a CanvasLib object
 */

(function(){
    console.log('CanvasStack class... creating');

class CanvasStack {

    constructor() {

        return {

            __levelMaker: false,

            __OFFSCREEN:false,

            allowOffscreen:function(duration)
            {

                this.__OFFSCREEN = true;

                var __inst = this;

                if(duration) {

                    window.setTimeout(function () {

                        __inst.__OFFSCREEN = false;

                    }, duration || 10000); //in 10 seconds set __OFFSCREEN to false

                }

            },

            draw: function (sprite, ctx, camera) {

                camera = camera || Gamestack.game_windows[0].camera || {position:new Gamestack.Vector(0, 0, 0)};

                if (sprite.active && sprite.onScreen(__gameStack.WIDTH, __gameStack.HEIGHT)) {


                    this.drawPortion(sprite, ctx, camera);

                }

            },
            drawFrameWithRotation: function (img, fx, fy, fw, fh, x, y, width, height, deg, canvasContextObj, flipX, flipY) {

                canvasContextObj.save();
                deg = Math.round(deg);
                deg = deg % 360;
                var rad = deg * Math.PI / 180;
                //Set the origin to the center of the image
                canvasContextObj.translate(x, y);
                canvasContextObj.rotate(rad);
                //Rotate the canvas around the origin

                canvasContextObj.translate(0, canvasContextObj.width);

                if (flipX) {

                    canvasContextObj.scale(-1, 1);
                } else {

                }

                if (flipY) {

                    canvasContextObj.scale(1, -1);
                } else {

                }

                //draw the image
                canvasContextObj.drawImage(img, fx, fy, fw, fh, width / 2 * (-1), height / 2 * (-1), width, height);
                //reset the canvas

                canvasContextObj.restore();
            },



            drawData:function(x, y, w, h, data, ctx){

                ctx.putImageData(data, x, y, 0, 0, w, h);

            },


            /*
             * drawPortion:
             *
             *   expects: (sprite{selected_animation{selected_frame{frameSize, framePos } offset?, gameSize? }  })
             *
             *
             * */

            drawPortion: function (sprite, ctx, camera) {

                var frame;

                if (sprite.active) {

                    if (sprite.selected_animation instanceof Object && sprite.selected_animation.hasOwnProperty('selected_frame')) {

                        frame = sprite.selected_animation.selected_frame;

                    }
                    else {

                       // console.error('Sprite is missing arguments');
                        //delay the draw

                        return;

                    }

                    var p = sprite.position;

                    var camera_pos = camera.position || {x: 0, y: 0, z: 0};

                    if(!sprite.hasOwnProperty('scrollFactor'))
                    {
                        sprite.scrollFactor = 1.0;
                    }

                    var x = p.x, y = p.y, scrollFactor = sprite.scrollFactor >= 0 && sprite.scrollFactor <= 1.0 ? sprite.scrollFactor : 1.0;

                    if(sprite.noScroll)
                    {
                        scrollFactor = 0;
                    }


                    x -= camera_pos.x * scrollFactor || 0;
                    y -= camera_pos.y * scrollFactor || 0;
                    //optional animation : gameSize

                    var targetSize = sprite.size || sprite.selected_animation.size;

                    var realWidth = targetSize.x;
                    var realHeight = targetSize.y;

                    //optional animation : offset

                    if (sprite.selected_animation && sprite.selected_animation.hasOwnProperty('offset')) {
                        x += sprite.selected_animation.offset.x;

                        y += sprite.selected_animation.offset.y;

                    }

                    var rotation;

                    if (typeof(sprite.rotation) == 'object') {

                        rotation = sprite.rotation.x;


                    }
                    else {
                        rotation = sprite.rotation;

                    }

                    var frame = sprite.selected_animation.selected_frame;

                    if (frame && frame.image && frame.image.data) {

                        ctx.putImageData(frame.image.data, x, y, 0, 0, sprite.size.x, sprite.size.y);

                    }
                    else {

                        if(sprite.selected_animation.image.domElement instanceof HTMLImageElement) {

                            this.drawFrameWithRotation(sprite.selected_animation.image.domElement, frame.framePos.x, frame.framePos.y, frame.frameSize.x, frame.frameSize.y, Math.round(x + (realWidth / 2)), Math.round(y + (realHeight / 2)), realWidth, realHeight, rotation % 360, ctx, sprite.flipX,  sprite.flipY);

                        }

                    }

                }

            }

        }

    }

}

    Gamestack.Canvas = new CanvasStack();

    Gamestack.CanvasStack = CanvasStack;
})();




