(function () {
    console.log('Sprite class... creating');

    /**
     * Gamestack.Sprite: Takes an object of arguments and returns Sprite() object. Sprite() is a container for multiple Animations, Motions, and Sounds. Sprites have several behavioral functions for 2d-Game-Objects.

     * @param   {Object} args object of arguments
     * @param   {string} args.name optional
     * @param   {string} args.description optional

     * @param   {string} args.src the source file for the GameImage:Sprite.image :: use a string / file-path

     * @param   {Gamestack.Vector} args.size the size of the Gamestack.Sprite
     * @param   {Gamestack.Vector} args.position the position of the Gamestack.Sprite
     * @param   {Gamestack.Vector} args.padding the 'float-type' Vector of x and y padding to use when processing collision on the Gamestack.Sprite. A padding of new Vector(0.2, 0.2) will result in 1/5 of Gamestack.Sprite size for padding

     * @param   {Gamestack.Animation} args.selected_animation the selected_animation of the Gamestack.Sprite:: pass during creation or use Gamestack.Sprite.setAnimation after created
     *
     * @returns {Gamestack.Sprite} a Gamestack.Sprite object
     */


    class Sprite {
        constructor(args = {}, arg2, arg3) {

            var a = {};

            if (args instanceof Gamestack.Animation) //instantiate from animation
            {
                args = {selected_animation: args, size: new Gamestack.Vector(args.frameSize)};
            }

            else if (typeof(args) == 'string')//load with image 'src' argument
            {
                //apply image from string 'src'

                this.image = new Gamestack.GameImage(args);


                var __inst = this;

                var img = this.image.domElement;

                img.onload = function () {

                    __inst.singleFrame();

                    if (__inst.after_load) {
                        __inst.after_load();
                    }
                };

                if (typeof(arg2) == 'number') //image plus 'scale' argument
                {
                    this.scale = arg2;

                    var img = this.image.domElement;

                    this.image.domElement.onload = function () {
                        __inst.size = new Gamestack.Vector(Math.round(img.width * scale), Math.round((img.width / img.height) * scale));

                    };

                }

                if (typeof(arg2) == 'object' && arg2.hasOwnProperty('x') && arg2.hasOwnProperty('y')) //image plus 'size' argument
                {

                    this.size = arg2;

                }
            }


            if (typeof(arg2) == 'object' && arg2.hasOwnProperty('x')) {
                this.size = arg2;
            }

            Gamestack.Extendors.spatial(this);

            this.active = true; //active sprites are visible

            if (typeof(args) == 'object') {

                this.apply_args(args);
            }
            else {
                this.apply_args(a);
            }


        }

        afterLoad(f) {
            this.after_load = f;
        }

        apply_args(args = {}) {

            for (var x in args) {
                this[x] = args[x];
            }

            this.name = args.name || "__blankName";

            this.life = args.life || 999999999999;

            this.description = args.description || "__spriteDesc";

            this.id = Gamestack.getArg(args, 'id', this.create_id());

            this.animations = Gamestack.getArg(args, 'animations', []);

            this.motions = Gamestack.getArg(args, 'motions', []);

            this.particles = Gamestack.getArg(args, 'particles', []);

            this.shots = Gamestack.getArg(args, 'shots', []);

            this.sounds = Gamestack.getArg(args, 'sounds', []);

            this.__initializers = Gamestack.getArg(args, '__initializers', []);

            this.type = Gamestack.getArg(args, 'type', 'basic');

            this.scrollFactor = args.scrollFactor || 1.0;

            this.speed = Gamestack.getArg(args, 'speed', new Gamestack.Vector(0, 0, 0));

            this.size = new Gamestack.Vector(Gamestack.getArg(args, 'size', new Gamestack.Vector(0, 0)));

            this.position = new Gamestack.Vector(Gamestack.getArg(args, 'position', new Gamestack.Vector(0, 0, 0)));

            this.collision_bounds = Gamestack.getArg(args, 'collision_bounds', new Gamestack.VectorBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0)));

            this.rotation = new Gamestack.Vector(Gamestack.getArg(args, 'rotation', new Gamestack.Vector(0, 0, 0)));


            this.acceleration = Gamestack.getArg(args, 'acceleration', new Gamestack.Vector(0, 0, 0));

            this.rot_speed = Gamestack.getArg(args, 'rot_speed', new Gamestack.Vector(0, 0, 0));

            this.rot_accel = Gamestack.getArg(args, 'rot_accel', new Gamestack.Vector(0, 0, 0));

            this.padding = Gamestack.getArg(args, 'padding', new Gamestack.Vector(0, 0, 0));


            var __inst = this;

            if (args.src) {
                this.src = args.src;
                console.log('image src:' + args.src);
                this.image = new Gamestack.GameImage(args.src);
            }
            else if (args.image instanceof Gamestack.GameImage) {
                this.image = args.image;
            }

            else if (args.image && args.image.domElement && args.image.domElement.src) {
                this.image = new Gamestack.GameImage(args.image.domElement.src);
            }


            //Apply / instantiate Sound(), Gamestack.Motion(), and Gamestack.Animation() args...


            GameStack.each(this.shots, function (ix, item) {

                __inst.shots[ix] = new Gamestack.Shot(item);

            });

            GameStack.each(this.sounds, function (ix, item) {

                __inst.sounds[ix] = new Gamestack.Sound(item);

            });

            GameStack.each(this.motions, function (ix, item) {

                __inst.motions[ix] = new Gamestack.TweenMotion(item);

            });

            GameStack.each(this.animations, function (ix, item) {

                __inst.animations[ix] = new Gamestack.Animation(item);


            });

            GameStack.each(this.particles, function (ix, item) {

                __inst.particles[ix] = new Gamestack.GSProton(item);

            });

            //Apply initializers:

            GameStack.each(this.__initializers, function (ix, item) {

                __inst.onInit(item);

            });

            Gamestack.ChainSet.informable(this);

            if (args.selected_animation)
                this.selected_animation = new Gamestack.Animation(args.selected_animation);


        }

        singleFrame() {
            var __inst = this;

            if (!__inst.selected_animation) {

                console.log('setting Animation with :' + this.image.domElement.src);

                __inst.setAnimation(new Gamestack.Animation({

                    image: __inst.image,

                    frameSize: new Gamestack.Vector(__inst.image.domElement.width, __inst.image.domElement.height),

                    frameBounds: new Gamestack.VectorFrameBounds(new Gamestack.Vector(), new Gamestack.Vector())


                }));

            }

            if (__inst.size.x == 0 && __inst.size.y == 0) {
                //take size of image
                __inst.size = new Gamestack.Vector(__inst.image.domElement.width, __inst.image.domElement.height);

            }

            return this;
        }

        /**
         * This function adds objects to the Gamestack.Sprite. Objects of Gamestack.Animation(), Projectile().
         *
         * @function
         * @memberof Sprite
         **********/

        add(obj) {

            switch (obj.constructor.name) {

                case "Shot":

                    this.shots.push(obj);

                    break;


                case "Animation":

                    this.animations.push(obj);

                    break;

                case "GSProton":

                    obj.parent = this;

                    this.particles.push(obj);

                    break;

                case "TweenMotion":

                    this.motions.push(obj);

                    break;

                case "Sound":

                    this.sounds.push(obj);

                    break;

            }


        }

        /**
         * This function initializes sprites. Call to trigger all functions previously passed to onInit().
         *
         * @function
         * @memberof Sprite
         **********/

        init() {


        }

        /**
         * This function extends the init() function. Takes single function() argument OR single string argument
         * @function
         * @memberof Sprite
         * @param {function} fun the function to be passed into the init() event of the Sprite()
         **********/

        onInit(fun) {

            if (typeof fun == 'string') {

                if (this.__initializers.indexOf(fun) < 0) {

                    this.__initializers.push(fun)
                }
                ;

                var __inst = this;

                var keys = fun.split('.');

                console.log('finding init from string:' + fun);

                if (!keys.length >= 2) {
                    return console.error('need min 2 string keys separated by "."');
                }

                var f = GameStack.options.SpriteInitializers[keys[0]][keys[1]];

                if (typeof(f) == 'function') {

                    var __inst = this;

                    var f_init = this.init;

                    this.init = function () {

                        f_init(__inst);

                        f(__inst);

                    };

                }


            }

            else if (typeof fun == 'function') {

                console.log('extending init:');


                var f_init = this.init;
                var __inst = this;

                this.init = function () {

                    f_init(__inst);

                    fun(__inst);

                };


            }

            else if (typeof fun == 'object') {

                console.log('extending init:');

                console.info('Quick2D does not yet implement onInit() from arg of object type');

            }

        }

        /*****************************
         * Getters
         ***************************/

        /**
         * This function gets the 'id' of the Sprite()
         * @function
         * @memberof Sprite
         * @returns {string}
         **********/

        get_id() {
            return this.id;
        }

        to_map_object(size, framesize) {

            this.__mapSize = new Gamestack.Vector(size || this.size);

            this.frameSize = new Gamestack.Vector(framesize || this.size);

            return this;

        }

        /*****************************
         * Setters and Creators
         ***************************/

        /**
         * This function creates the 'id' of the Sprite():Called automatically on constructor()
         * @function
         * @memberof Sprite
         * @returns {string}
         **********/

        create_id() {

            return Gamestack.create_id();

        }


        /**
         * This function sets the size of the Sprite()
         * @function
         * @memberof Sprite
         **********/

        setSize(size) {

            this.size = new Gamestack.Vector(size.x, size.y, size.z);

        }

        /**
         * This function sets the position of the Sprite()
         * @function
         * @memberof Sprite
         **********/

        setPos(pos) {
            this.position = new Gamestack.Vector(pos.x, pos.y, pos.z || 0);

        }

        /**
         * This function sizes the Sprite according to minimum dimensions and existing w/h ratios
         * @param {number} mx the maximum size.x for the resize
         * @param {number} my the maximum size.y for the resize
         * @function
         * @memberof Sprite
         **********/

        getSizeByMax(mx, my) {

            var size = new Gamestack.Vector(this.size);

            var wth = size.y / size.x;

            var htw = size.x / size.y;

            if (size.x > mx) {
                size.x = mx;

                size.y = size.x * wth;

            }

            if (size.y > my) {
                size.y = my;

                size.x = size.y * htw;

            }

            return size;

        }

        /*****************************
         *  assertSpeed()
         *  -assert the existence of a speed{} object
         ***************************/

        assertSpeed() {
            if (!this.speed) {

                this.speed = new Gamestack.Vector(0, 0, 0);

            }

        }

        /*****************************
         *  setAnimation(anime)
         *  -set the select_animation of this sprite
         ***************************/

        /**
         * This function sets the 'selected_animation' property of the Sprite():: *all Sprites must have a 'selected_animation'
         * @function
         * @memberof Sprite
         * @param {Animation}
         **********/

        setAnimation(anime) {

            if (anime instanceof Gamestack.Animation && this.animations.indexOf(anime) < 0) {
                this.animations.push(anime);
            }

            this.selected_animation = anime;

            Gamestack.log('set the animation');

            return this;

        }


        /**
         * This function sets the 'selected_animation' property to a single-frame --the source image of the sprite
         * @function
         * @memberof Sprite
         * @param {Animation}
         **********/

        setToSingleFrame() {

            this.selected_animation = new Gamestack.Animation({
                image: this.image,
                frameSize: new Gamestack.Vector(this.image.domElement.width, this.image.domElement.height)
            });

            var __inst = this;

            this.selected_animation.image.domElement.onload = function () {

                __inst.size = new Gamestack.Vector(__inst.selected_animation.image.domElement.width, __inst.selected_animation.image.domElement.height);

            };


            Gamestack.log('set single-frame animation');

            return this;

        }


        /**
         * This function indicates if this Sprite is onScreen within the Gamestack.WIDTH && Gamestack.HEIGHT dimensions, OR any w & h passed as arguments
         * @function
         * @memberof Sprite
         * @param {number} w optional WIDTH argument, defaults to Gamestack.WIDTH
         * @param {number} h optional HEIGHT argument, defaults to Gamestack.HEIGHT
         **********/

        LifeSpan(value) {
            this.life = value;
        }

        Life(value) //same as LifeSpan
        {
            this.life = value;
        }

        isDead(gw) {

            gw = gw || Gamestack.game_windows[0];

            return this.hasOwnProperty('life') && this.life <= 0;
        }

        die(gw) {

       this.life = 0;

       return this;

        }

        onScreen(w, h, gw) {

            w = w || Gamestack.WIDTH;

            h = h || Gamestack.HEIGHT;

            gw = gw || Gamestack.game_windows[0];

            var camera = gw.camera || Gamestack.camera || {position: new Gamestack.Vector(0, 0, 0)},
                scrollFactor = this.noScroll ? 0 : this.scrollFactor;

            var camPos = new Gamestack.Vector(camera.position).mult(scrollFactor);

            var p = new Gamestack.Vector(this.position.x - camPos.x, this.position.y - camPos.y, this.position.z - camPos.z);

            return p.x + this.size.x > -1000 - w && p.x < w + 1000
                && p.y + this.size.y > 0 - 1000 - h && p.y < h + 1000;

        }

        /*****************************
         * Updates
         ***************************/

        /*****************************
         * update()
         * -starts empty:: is used by Quick2d.js as the main sprite update
         ***************************/

        /**
         * This function is the main update() function for the Sprite
         * @function
         * @memberof Sprite
         **********/


        update(sprite) {
        }

        /*****************************
         * def_update()
         * -applies speed and other default factors of movement::
         * -is used by Quick2d.js as the system def_update (default update)
         ***************************/

        /**
         * This function updates various speed and rotational-speed properties for the Sprite()
         * @function
         * @memberof Sprite
         **********/

        def_update(sprite) {

            if (this.hasOwnProperty('life') && !isNaN(this.life)) {

                this.life -= 1;

            }
            ;

            for (var x in this.speed) {

                if (this.speed[x] > 0 || this.speed[x] < 0) {

                    this.position[x] += this.speed[x];

                }

            }

            for (var x in this.acceleration) {

                if (this.acceleration[x] > 0 || this.acceleration[x] < 0) {

                    this.speed[x] += this.acceleration[x];

                }

            }

            for (var x in this.rot_speed) {

                if (this.rot_speed[x] > 0 || this.rot_speed[x] < 0) {

                    this.rotation[x] += this.rot_speed[x];

                }


            }

            for (var x in this.rot_accel) {


                if (this.rot_accel[x] > 0 || this.rot_accel[x] < 0) {

                    this.rot_speed[x] += this.rot_accel[x];

                }
            }
        }

        /**
         * This function resolves a function nested in an object, from a string-key, and it is applied by Gamestack.js for persistence of data and Sprite() behaviors
         * @function
         * @memberof Sprite
         **********/

        resolveFunctionFromDoubleKeys(keyString1, keyString2, obj, callback) {

            callback(typeof obj[keyString1][keyString2] == 'function' ? obj[keyString1][keyString2] : {});

        }

        /**
         * This function extends an existing function, and is applied by Gamestack in onInit();
         * @function
         * @memberof Sprite
         **********/

        extendFunc(fun, extendedFunc) {

            console.log('extending func');

            var ef = extendedFunc;

            var __inst = this;

            return function () {


                ef(__inst);

                //any new function comes after

                fun(__inst);


            };

        }


        /*****************************
         *  onUpdate(fun)
         * -args: 1 function(sprite){ } //the self-instance/sprite is passed into the function()
         * -overrides and maintains existing code for update(){} function
         ***************************/


        /**
         * Extends the update() of this sprite with a new function to be called during update()
         * @function
         * @memberof Sprite
         * @param {function} the function to apply to the Sprite:update()
         **********/


        onUpdate(fun) {
            fun = fun || function () {
                };

            let update = this.update;

            let __inst = this;

            this.update = function (__inst) {
                update(__inst);
                fun(__inst);
            };

        }

        /*****************************
         *  travelLineTwoWay()
         *  -sprite travels line: any Line() or object with property of line
         ***************************/

        travelLineTwoWay(lineObject, speed, curveKey, offset) {

            speed = speed || 1;

            var motionCurveOptions = ["linear", "quadratic", "cubic"];

            curveKey = curveKey || "linear";

            var line = lineObject;

            if (lineObject.line) {
                line = lineObject.line;
            }

            this.__crtLineIx = this.__crtLineIx || 0;

            var __inst = this,

                pctFloat = __inst.__crtLineIx % ((line.points.length - 1) / 2) / ((line.points.length - 1) / 2);

            if (__inst.__crtLineIx >= ((line.points.length - 1) / 2)) {
                pctFloat = 1.0 - pctFloat;

            }

            var ixChange = Gamestack.Curves.InOut[curveKey](pctFloat) * speed * 0.5;

            if (curveKey == 'linear') {
                ixChange = speed;
            }

            ixChange = Math.round(ixChange);

            if (ixChange < 1) {
                ixChange = 1;
            }

            __inst.position = new Gamestack.Vector(line.points[__inst.__crtLineIx]);

            console.log(ixChange);

            __inst.__crtLineIx += ixChange;

            if (__inst.__crtLineIx >= line.points.length) {

                line.points = line.points.reverse();
                __inst.__crtLineIx = 0;
            }

            if (offset instanceof Gamestack.Vector) {
                this.position = this.position.add(offset);
            }


        }


        /*****************************
         *  travelLineTwoWay()
         *  -sprite travels line: any Line() or object with property of line
         ***************************/

        travelLineOnLoop(lineObject, speed, curveKey, offset) {

            speed = speed || 1;

            var motionCurveOptions = ["linear", "quadratic", "cubic"];

            curveKey = curveKey || "linear";

            var line = lineObject;

            if (lineObject.line) {
                line = lineObject.line;
            }

            this.__crtLineIx = this.__crtLineIx || 0;

            var __inst = this,

                pctFloat = __inst.__crtLineIx % ((line.points.length - 1) / 2) / ((line.points.length - 1) / 2);

            if (__inst.__crtLineIx >= ((line.points.length - 1) / 2)) {
                pctFloat = 1.0 - pctFloat;

            }

            var ixChange = Gamestack.Curves.InOut[curveKey](pctFloat) * speed * 0.5;

            if (curveKey == 'linear') {
                ixChange = speed;
            }

            ixChange = Math.round(ixChange);

            if (ixChange < 1) {
                ixChange = 1;
            }

            __inst.position = new Gamestack.Vector(line.points[__inst.__crtLineIx]);

            console.log(ixChange);

            __inst.__crtLineIx += ixChange;

            if (__inst.__crtLineIx >= line.points.length) {
                __inst.__crtLineIx = 0;
            }

            if (offset instanceof Gamestack.Vector) {
                this.position = this.position.add(offset);
            }


        }


        /**
         *
         * <ul>
         *     <li>A rectangular style position</li>
         *      <li>Takes another sprite as argument</li>
         *       <li>Returns basic true || false during runtime</li>
         * </ul>
         * @function
         * @memberof Sprite
         * @param {sprite}
         **********/


        /**
         * Get the true || false results of a Collision between two Sprites(), based on their position Vectors and Sizes
         * @function
         * @memberof Sprite
         * @param {Sprite} sprite the alternate Sprite to process collision with
         **********/


        collidesRectangular(sprite) {

            return Gamestack.Collision.spriteRectanglesCollide(this, sprite);

        }


        /*****************************
         *  shoot(sprite)
         *  -fire a shot from the sprite:: as in a firing gun or spaceship
         *  -takes options{} for number of shots anglePerShot etc...
         *  -TODO: complete and test this code
         ***************************/

        /**
         * Sprite fires a particle object
         * <ul>
         *     <li>Easy instantiator for bullets and propelled objects in GameStack</li>
         *     <li>*TODO: This function is not-yet implemented in GameStack</li>
         * </ul>
         * @function
         * @memberof Sprite
         * @param {options} *numerous args
         **********/


        /**
         * fire a projectile-sub Sprite from the Sprite
         * @function
         * @memberof Sprite
         * @param {Object} options an object of arguments
         * @param {Gamestack.Animation} animation the animation to fire from the Sprite
         * @param {number} speed the speed of the shot that is projected
         * @param {Gamestack.Vector} position the initial position of the shot: defaults to current Sprite position
         * @param {Gamestack.Vector} size the Vector size of the shot
         * @param {Gamestack.Vector} rot_offset the rotational offset to apply: controls direction of the shot
         **********/

        shoot(options, gw) {
            //character shoots an animation

            gw = gw || Gamestack.game_windows[0];

            this.prep_key = 'shoot';

            let animation = options.bullet || options.animation || options.anime || new Gamestack.Animation();

            let speed = options.speed || options.velocity || 1;


            let size = options.size || new Gamestack.Vector(10, 10, 0);

            let position = new Gamestack.Vector(options.position) || new Gamestack.Vector(this.position);


            let rot_offset = options.rot_offset || options.rotation || 0;

            let total = options.total || 1;

            let rot_disp = options.rot_disp || 0;//the full rotational-dispersion of the bullets

            let curve = options.curve, curve_size = options.curve_size, curve_growth = options.curve_growth || 1.0;

            let curve_key = options.curve_key || 'quintic';

            let life = options.life || 900;

            var shots = [];

            for (var x = 0; x < total; x++) {

                var __playerInst = this;

                if (__gameInstance.isAtPlay) {

                    var bx = position.x, by = position.y, bw = size.x, bh = size.y;

                    var shot = new Gamestack.Sprite({

                        active: true,

                        position: new Gamestack.Vector(position),

                        size: new Gamestack.Vector(size),

                        speed: speed,

                        image: animation.image,

                        rotation: new Gamestack.Vector(0, 0, 0),

                        flipX: false,

                        life: options.life

                    });

                    shot.noScroll = true;

                    shot.setAnimation(animation);

                    rot_offset = new Gamestack.Vector(rot_offset, 0, 0);

                    shot.position.x = bx, shot.position.y = by;

                    //Danger On this line: annoying math --dispersing rotation of bullets by rot_disp

                    var div = rot_disp / total;

                    var rotPlus = div * x + div / 2 - rot_disp / 2;

                    shot.rotation.x = rot_offset.x + rotPlus;

                    shot.origin = new Gamestack.Vector(position);

                    shot.speed = new Gamestack.Vector(Math.cos((shot.rotation.x) * 3.14 / 180) * speed, Math.sin((shot.rotation.x) * 3.14 / 180) * speed);


                    shots.push(shot);

                    if (!curve) {

                        shot.onUpdate(function (spr) {
                            // console.log('update:rotation:' + shot.rotation.x);


                        });
                    }
                    else {

                        shot.ticker = 0;

                        var r = shot.rotation.x + 0;

                        shot.line = new Gamestack.CurvedLine().Pos(position)
                            .Curve(curve_key).SegmentSize(curve_size)
                            .MaxSize(2000).Growth(1.5).Rotate(r).Fill();

                        shot.onUpdate(function (spr) {

                            spr.ticker += 1;

                            if (spr.ticker < spr.line.points.length)
                                spr.position = new Gamestack.Vector(spr.line.points[spr.ticker]);

                        });
                    }

                    gw.add(shot);

                }

            }

            return shots;

        }

        /**
         * create a subsprite of Sprite belonging to the current Sprite
         * @function
         * @memberof Sprite
         * @param {Object} options an object of arguments
         * @param {Animation} animation the animation to fire from the Sprite
         * @param {number} speed the speed of the shot that is projected
         * @param {Gamestack.Vector} position the initial position of the shot: defaults to current Sprite position
         * @param {Vector} size the Vector size of the shot
         * @param {Vector} offset the positional offset to apply
         **********/

        subsprite(options, gw) {

            gw = gw || Gamestack.game_windows[0];

            let animation = options.animation || new Gamestack.Animation();

            let position = options.position || new Gamestack.Vector(this.position);

            let offset = options.offset || new Gamestack.Vector(0, 0, 0);

            let size = new Gamestack.Vector(options.size || this.size);

            if (__gameInstance.isAtPlay) {

                var subsprite = gw.add(new Gamestack.Sprite({

                    active: true,

                    position: position,

                    size: size,

                    offset: offset,

                    image: animation.image,

                    rotation: new Gamestack.Vector(0, 0, 0),

                    flipX: false,

                    scrollFactor: this.scrollFactor,

                    noScroll: this.noScroll

                }));

                subsprite.setAnimation(animation);

                return subsprite;

            }
            else {
                alert('No subsprite when not at play');

            }

        }


        /**
         * animate Sprite.selected_animation  by one frame
         * @function
         * @memberof Sprite
         * @param {Animation} animation to use, defaults to Sprite.selected_animation
         **********/

        animate(animation) {

            if (__gameInstance.isAtPlay) {

                if (animation) {
                    this.setAnimation(animation)
                }

                this.selected_animation.animate();

            }

        }

        /**
         * run a function when the Sprite.selected_animation is complete
         *
         * @function
         * @memberof Sprite
         * @param {Function} fun the function to call when the animation is complete
         *
         **********/

        onAnimationComplete(fun) {
            this.selected_animation.onComplete(fun);

        }

        /*****************************
         *  accelY
         *  -accelerate on Y-Axis with 'accel' and 'max' (speed) arguments
         *  -example-use: gravitation of sprite || up / down movement
         ***************************/

        /**
         * accelerate speed on the Y-Axis
         *
         * @function
         * @memberof Sprite
         * @param {number} accel the increment of acceleration
         * @param {number} max the maximum for speed
         *
         **********/

        accelY(accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {y: max};

            }

            this.assertSpeed();

            let diff = max.y - this.speed.y;

            if (diff > 0) {
                this.speed.y += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                this.speed.y -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  accelX
         *  -accelerate on X-Axis with 'accel' and 'max' (speed) arguments
         *  -example-use: running of sprite || left / right movement
         ***************************/


        /**
         * accelerate speed on the X-Axis
         *
         * @function
         * @memberof Sprite
         * @param {number} accel the increment of acceleration
         * @param {number} max the maximum for speed
         *
         **********/


        accelX(accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {x: max};

            }

            this.assertSpeed();

            let diff = max.x - this.speed.x;

            if (diff > 0) {
                this.speed.x += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                this.speed.x -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  accel
         *  -accelerate any acceleration -key
         ***************************/


        /**
         * accelerate toward a max value on any object-property:: intended for self-use
         *
         * @function
         * @memberof Sprite
         * @param {Object} prop The object to control
         * @param {string} key the property-key for targeted property of prop argument
         *
         * @param {number} accel the increment of acceleration
         *
         * @param {number} max the max value to accelerate towards
         *
         *
         **********/

        accel(prop, key, accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {x: max};

            }

            let speed = prop[key];

            // this.assertSpeed();

            let diff = max.x - prop[key];

            if (diff > 0) {
                prop[key] += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                prop[key] -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  decel
         *  -deceleration -key
         ***************************/

        /**
         * decelerate toward a max value on any object-property:: intended for self-use
         *
         * @function
         * @memberof Sprite
         * @param {Object} prop The object to control
         * @param {string} key the property-key for targeted property of prop argument
         *
         * @param {number} decel the increment of deceleration
         *
         * @param {number} max the max value to decelerate towards
         *
         *
         **********/

        decel(prop, key, rate) {
            if (typeof(rate) == 'object') {

                rate = rate.rate;

            }

            rate = Math.abs(rate);

            if (Math.abs(prop[key]) <= rate) {
                prop[key] = 0;
            }

            else if (prop[key] > 0) {
                prop[key] -= rate;

            }
            else if (prop[key] < 0) {
                prop[key] += rate;

            }
            else {

                prop[key] = 0;

            }
        }


        /*****************************
         *  decelY
         *  -decelerate on the Y axis
         *  -args: 1 float:amt
         ***************************/


        /**
         * decelerate speed on the Y-Axis, toward zero
         *
         * @function
         * @memberof Sprite
         * @param {number} amt the increment of deceleration, negatives ignored
         *
         **********/

        decelY(amt) {

            amt = Math.abs(amt);

            if (Math.abs(this.speed.y) <= amt) {
                this.speed.y = 0;

            }
            else if (this.speed.y > amt) {

                this.speed.y -= amt;
            }
            else if (this.speed.y < amt * -1) {

                this.speed.y += amt;
            }

        }

        /*****************************
         *  decelX
         *  -decelerate on the X axis
         *  -args: 1 float:amt
         ***************************/


        /**
         * decelerate speed on the X-Axis, toward zero
         *
         * @function
         * @memberof Sprite
         * @param {number} amt the increment of deceleration, negatives ignored
         *
         **********/

        decelX(amt) {

            amt = Math.abs(amt);


            if (this.speed.x > amt) {

                this.speed.x -= amt;
            }
            else if (this.speed.x < amt * -1) {

                this.speed.x += amt;
            }

            if (Math.abs(this.speed.x) <= amt) {

                this.speed.x = 0;

            }

        }


        shortest_stop(item, callback) {
            var diff_min_y = item.min ? item.min.y : Math.abs(item.position.y - this.position.y + this.size.y);

            var diff_min_x = item.min ? item.min.x : Math.abs(item.position.x - this.position.x + this.size.x);

            var diff_max_y = item.max ? item.max.y : Math.abs(item.position.y + item.size.y - this.position.y);

            var diff_max_x = item.max ? item.max.x : Math.abs(item.position.x + item.size.x - this.position.y);

            var dimens = {top: diff_min_y, left: diff_min_x, bottom: diff_max_y, right: diff_max_x};

            var minkey = "", min = 10000000;

            for (var x in dimens) {
                if (dimens[x] < min) {
                    min = dimens[x];
                    minkey = x; // a key of top left bottom or right

                }
            }

            callback(minkey);

        }


        /**
         * get the center of a Sprite
         *
         * @function
         * @memberof Sprite
         *
         * @returns (Vector)
         *
         **********/

        center() {


            return new Gamestack.Vector(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, 0);

        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * determine if Sprite overlaps on X axis with another Sprite
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         * @param {number} padding the 0-1.0 float value of padding to use on self when testing overlap
         * @returns {var} a true || false var
         *
         **********/

        overlap_x(item, padding) {
            if (!padding) {
                padding = 0;
            }

            var paddingX = Math.round(padding * this.size.x),

                paddingY = Math.round(padding * this.size.y), left = this.position.x + paddingX,
                right = this.position.x + this.size.x - paddingX,

                top = this.position.y + paddingY, bottom = this.position.y + this.size.y - paddingY;

            return right > item.position.x && left < item.position.x + item.size.x;


        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * determine if Sprite overlaps on Y axis with another Sprite
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         * @param {number} padding the 0-1.0 float value of padding to use on self when testing overlap
         * @returns (true || false}
         *
         **********/

        overlap_y(item, padding) {
            if (!padding) {
                padding = 0;
            }

            var paddingX = Math.round(padding * this.size.x),

                paddingY = Math.round(padding * this.size.y), left = this.position.x + paddingX,
                right = this.position.x + this.size.x - paddingX,

                top = this.position.y + paddingY, bottom = this.position.y + this.size.y - paddingY;

            return bottom > item.position.y && top < item.position.y + item.size.y;

        }


        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/



        collide_stop_x(item) {

            var apart = false;

            var ct = 10000;

            while (!apart && ct > 0) {

                ct--;

                var diffX = this.center().sub(item.center()).x;

                var distX = Math.abs(this.size.x / 2 + item.size.x / 2 - Math.round(this.size.x * this.padding.x));

                if (Math.abs(diffX) < distX) {

                    this.position.x -= diffX > 0 ? -1 : 1;


                }
                else {

                    this.speed.x = 0;

                    apart = true;


                }


            }


        }

        Life(v) {
            this.life = v;

            return this;

        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * cause a fourway collision-stop between this and another Sprite :: objects will behave clastically and resist passing through one another
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         *
         **********/

        collide_stop(item) {

            if (this.id == item.id) {
                return false;

            }

            // this.position = this.position.sub(this.speed);

            if (this.collidesRectangular(item)) {

                var diff = this.center().sub(item.center());

                if (this.overlap_x(item, this.padding.x + 0.1) && Math.abs(diff.x) < Math.abs(diff.y)) {

                    var apart = false;

                    var ct = 10000;

                    while (!apart && ct > 0) {

                        ct--;

                        var diffY = this.center().sub(item.center()).y;

                        var distY = Math.abs(this.size.y / 2 + item.size.y / 2 - Math.round(this.size.y * this.padding.y));

                        if (Math.abs(diffY) < distY) {

                            this.position.y -= diffY > 0 ? -1 : diffY < 0 ? 1 : 0;

                            this.position.y = Math.round(this.position.y);

                        }

                        else {

                            if (diffY <= 0) {
                                this.__inAir = false;
                            }
                            ;

                            this.speed.y = 0;

                            return apart = true;


                        }


                    }


                }


                if (this.overlap_y(item, this.padding.y) && Math.abs(diff.y) < Math.abs(diff.x)) {

                    this.collide_stop_x(item);

                }


            }


        }


        collide_stop_top(item) {


            if (this.id == item.id) {
                return false;

            }

            if (this.overlap_x(item, this.padding.x + 0.1)) {

                console.log('OVERLAP_X');

                var paddingY = this.padding.y * this.size.y;

                if (this.position.y + this.size.y - paddingY <= item.position.y) {

                    this.groundMaxY = item.position.y - this.size.y + paddingY;

                }

            }

        }


        /**
         * Restore a sprite from saved .json data
         *
         * @function
         * @memberof Sprite
         *
         * @returns (Sprite)
         **********/

        restoreFrom(data) {
            data.image = new GameImage(data.src || data.image.src);

            return new Gamestack.Sprite(data);

        }


        /*****************************
         *  fromFile(file_path)
         *  -TODO : complete this function based on code to load Sprite() from file, located in the spritemaker.html file
         *  -TODO: test this function
         ***************************/

        fromFile(file_path) {

            if (typeof file_path == 'string') {

                var __inst = this;

                $.getJSON(file_path, function (data) {

                    __inst = new Gamestack.Sprite(data);

                });
            }
        }

        toJSONString() {
            for (var x = 0; x < this.motions.length; x++) {
                this.motions[x].parent = false;
            }

            return jstr(this);
        }

    }
    ;

    /****************
     * TODO : Complete SpritePresetsOptions::
     *  Use these as options for Sprite Control, etc...
     ****************/

    Gamestack.Sprite = Sprite;

    let SpriteInitializersOptions = {

        Clastics: {

            top_collideable: function (sprite) {

                for (var x in Gamestack.__gameWindow.forces) {
                    var force = Gamestack.__gameWindow.forces[x];

                    force.topClastics.push(sprite);

                }


                sprite.onUpdate(function () {


                });

            },

            fourside_collideable: function (sprite) {

                for (var x in Gamestack.__gameWindow.forces) {
                    var force = Gamestack.__gameWindow.forces[x];

                    force.clasticObjects.push(sprite);

                }

                sprite.onUpdate(function () {


                });


            }
        },

        MainGravity: {

            very_light: function (sprite, gw) {

                gw = gw || Gamestack.game_windows[0];
                //Add a gravity to the game

                var gravity = gw.add(new Gamestack.Force({
                    name: "very_light_grav",
                    accel: 0.05,
                    max: new Gamestack.Vector(0, 3.5, 0),
                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));

                sprite.onUpdate(function () {


                });

            },

            light: function (sprite, gw) {

                gw = gw || Gamestack.game_windows[0];

                var gravity = gw.add(new Gamestack.Force({
                    name: "light_grav",
                    accel: 0.1,
                    max: new Gamestack.Vector(0, 4.5, 0),
                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));


                sprite.onUpdate(function () {


                });

            },

            medium: function (sprite, gw) {

                gw = gw || Gamestack.game_windows[0];

                var gravity = gw.add(new Gamestack.Force({
                    name: "medium_grav",
                    accel: 0.2,
                    max: new Gamestack.Vector(0, 7.5, 0),
                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));


                sprite.onUpdate(function () {


                });

            },


            strong: function (sprite, gw) {

                gw = gw || Gamestack.game_windows[0];

                var gravity = gw.add(new Gamestack.Force({
                    name: "strong_grav",
                    accel: 0.4,
                    max: new Gamestack.Vector(0, 10.5, 0),
                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));

                sprite.onUpdate(function () {


                });

            },

            very_strong: function (sprite, gw) {

                gw = gw || Gamestack.game_windows[0];

                var gravity = gw.add(new Gamestack.Force({
                    name: "strong_grav",
                    accel: 0.5,
                    max: new Gamestack.Vector(0, 12.5, 0),
                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));

                sprite.onUpdate(function () {


                });

            },

        },


        ControllerStickMotion: {

            player_move_x: function (sprite) {

                alert('applying initializer');

                console.log('side_scroll_player_run:init-ing');

                let __lib = Gamestack || Quick2d;

                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                    console.log('stick-x:' + x);

                    if (Math.abs(x) < 0.2) {
                        return 0;
                    }

                    var accel = 0.2; //todo : options for accel
                    var max = 7;

                    sprite.accelX(accel, x * max);

                    if (x < -0.2) {
                        sprite.flipX = true;

                    }
                    else if (x > 0.2) {
                        sprite.flipX = false;

                    }

                });

                sprite.onUpdate(function (spr) {

                    spr.decelX(0.1);

                    if (!spr.__falling) {
                        spr.decelY(0.2)
                    }
                    ;

                });


            },

            player_move_xy: function (sprite) {

                alert('applying initializer');

                console.log('side_scroll_player_run:init-ing');

                let __lib = Gamestack || Quick2d;

                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                    console.log('stick-x:' + x);

                    if (Math.abs(x) < 0.2) {
                        x = 0;
                    }

                    if (Math.abs(y) < 0.2) {
                        y = 0;
                    }

                    var accel = 0.2; //todo : options for accel
                    var max = 7;

                    sprite.accelX(accel, x * max);

                    sprite.accelY(accel, y * max);

                    if (x < -0.2) {
                        sprite.flipX = true;

                    }
                    else if (x > 0.2) {
                        sprite.flipX = false;

                    }

                });

                sprite.onUpdate(function (spr) {

                    sprite.decel(sprite.speed, 'x', 0.1);

                    sprite.decel(sprite.speed, 'y', 0.1);

                });


            },

            player_rotate_x: function (sprite) {

                let __lib = Gamestack || Quick2d;

                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                    console.log('stick-x:' + x);

                    if (Math.abs(x) < 0.2) {
                        return 0;
                    }

                    var accel = 0.25; //todo : options for accel
                    var max = 7;

                    sprite.accel(sprite.rot_speed, 'x', accel, x * max);

                    if (x < -0.2) {
                        sprite.flipX = true;

                    }
                    else if (x > 0.2) {
                        sprite.flipX = false;

                    }

                });

                sprite.onUpdate(function (spr) {

                    sprite.decel(sprite.rot_speed, 'x', 0.1);

                    if (!spr.__falling) {
                        spr.decelY(0.2)
                    }
                    ;

                });


            }


        }

    };


    Gamestack.Sprite = Sprite;


    Gamestack.options = Gamestack.options || {};

    Gamestack.options.SpriteInitializers = SpriteInitializersOptions;


})();
