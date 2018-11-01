
(function(){
    console.log('Animation class... creating');

    /**
     * Gamestack.Animation: Takes an object of arguments and returns Animation() object.
     * @param   {Object} args object of arguments
     * @param   {string} args.name optional
     * @param   {string} args.description optional
     * @param   {string} args.type optional
     * @param   {Vector} args.size of the Animation object, has x and y properties
     * @param   {Vector} args.frameSize the size of frames in Animation, having x and y properties
     * @param   {VectorFrameBounds} args.frameBounds the bounds of the Animation having min, max, and termPoint properties
     * @param   {number} args.delay optional, the seconds to delay before running animation when started by the start() function

     * @param   {number} args.duration how many milliseconds the animation should take to complete
     *
     * @returns {Animation} an Animation object
     */


    class Animation {

    constructor(args = {}) {

        args = args || {};

        if(typeof args == 'string')
        {

            this.image = new Gamestack.GameImage(args);
            args = {};
        }

        for (var x in this.args) {
            this[x] = args[x];

        }

        this.name = args.name || "__animationName";

        this.description = args.description || "__animationDesc";

        if(!this.image)
        {
            this.image = new Gamestack.GameImage(args.src || args.image);

        }

        var __inst = this, imgDom = this.image.domElement;

        this.frameSize = new Gamestack.Vector(args.frameSize || new Gamestack.Vector(0, 0));

        if(this.image && this.image.domElement) {

            this.image.domElement.onload = function () {
                if (__inst.frameSize.x == 0 && __inst.frameSize.y == 0) {

                    __inst.frameSize = new Gamestack.Vector(imgDom.width, imgDom.height);

                }
            }

        }

        if (args.frameBounds && args.frameBounds.min && args.frameBounds.max) {

            this.frameBounds = new Gamestack.VectorFrameBounds(args.frameBounds.min, args.frameBounds.max, args.frameBounds.termPoint);

        }
        else
        {
            this.frameBounds = new Gamestack.VectorFrameBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0))

        }

        this.frameOffset = new Gamestack.Vector(this.getArg(args, 'frameOffset', new Gamestack.Vector(0, 0, 0)));

        this.flipX = this.getArg(args, 'flipX', false);

        this.cix = 0;

        this.timer = 0;

        this.duration = args.duration || 2000;

        this.seesaw_mode = args.seesaw_mode || false;

        this.reverse_frames = args.reverse_frames || false;

        this.apply2DFrames();

        this.selected_frame = this.frames[0] || {};

        this.run_ext = args.run_ext || [];

        this.complete_ext = args.complete_ext || [];

        Gamestack.ChainSet.informable(this);

    }

    /*****
    * Overridable / Extendable functions
    * -allows stacking of external object-function calls
    ******/

    onRun(call) {

        if (this.run_ext.indexOf(call) == -1) {
            this.run_ext.push(call);
        }
    }

    onComplete(call) {

        if (this.complete_ext.indexOf(call) == -1) {
            this.complete_ext.push(call);
        }
    }

    call_on_run() {
        //call any function extension that is present
        for (var x = 0; x < this.run_ext.length; x++) {
            this.run_ext[x]();
        }
    }

    call_on_complete() {
        //call any function extension that is present
        for (var x = 0; x < this.complete_ext.length; x++) {
            this.complete_ext[x]();
        }
    }

    reverseFrames() {

        this.frames.reverse();

    }

    // class can be instantiated by chainables: Animation().FrameSize(arg).FrameBounds(min, max).Populate();

        Image(img)
        {
            var src;

            if(typeof(img) == 'object' && img.src)
                src = img.src;
            else
                src = img;

            this.image = new Gamestack.GameImage(src);

            return this;
        }

    FrameSize(fs)
    {
        this.frameSize = new Gamestack.Vector(fs);
        return this;
    }

    FrameBounds(min, max, termPoint)
    {
        this.frameBounds = new Gamestack.VectorFrameBounds(min, max, termPoint || max);

        return this;
    }

    Populate()
    {

        this.apply2DFrames();

        return this;

    }

    singleFrame(frameSize) {

        this.frames = [];

        this.__frametype = 'single';

        this.frameSize = frameSize || new Gamestack.Vector(this.image.domElement.width, this.image.domElement.height);

        this.selected_frame = {
            image: this.image,
            frameSize: this.frameSize,
            framePos: {x: 0, y: 0}
        };

        this.frames[0] = this.selected_frame;

        return this;

    }

    getArg(args, key, fallback) {

        if (args.hasOwnProperty(key)) {

            return args[key];

        }
        else {
            return fallback;

        }
    }

    apply2DFrames() {

        this.frames = [];

        var fcount = 0;

        var quitLoop = false;

        for (let y = this.frameBounds.min.y; y <= this.frameBounds.max.y; y++) {

            for (let x = this.frameBounds.min.x; x <= this.frameBounds.max.x; x++) {

                let framePos = {
                    x: x * this.frameSize.x + this.frameOffset.x,
                    y: y * this.frameSize.y + this.frameOffset.y
                };

                this.frames.push({image: this.image, frameSize: this.frameSize, framePos: new Gamestack.Vector(framePos)});

                if (x >= this.frameBounds.termPoint.x && y >= this.frameBounds.termPoint.y) {

                    quitLoop = true;

                    break;
                }

                fcount += 1;

                if (quitLoop)
                    break;

            }

        }

        this.frames[0] = !this.frames[0] ? {
            image: this.image,
            frameSize: this.frameSize,
            framePos: {x: this.frameBounds.min.x, y: this.frameBounds.min.y}
        } : this.frames[0];


        if (this.seesaw_mode) {
            console.log('ANIMATION: applying seesaw');

            var frames_reversed = this.frames.slice().reverse();

            this.frames.pop();

            this.frames = this.frames.concat(frames_reversed);

        }
        if (this.reverse_frames) {
            this.reverseFrames();
        }

        // this.selected_frame = this.frames[this.cix % this.frames.length] || this.frames[0];

    }

    update() {

        this.selected_frame = this.frames[Math.round(this.cix) % this.frames.length];

    }

    reset() {

        this.apply2DFrames();

        this.cix = 0;

    }

    continuous() {

        if (this.__frametype == 'single') {
            return 0;

        }

       // this.apply2DFrames();

        //update once:
        this.update();

        if (this.cix == 0) {

            this.engage();

        }


    }

    engage(duration, complete) {

        this.call_on_run();

        duration = duration || this.duration || this.frames.length * 20;

        if (this.__frametype == 'single') {
            return 0;

        }

        let __inst = this;


        //we have a target
        this.tween = new TWEEN.Tween(this)
            .easing(__inst.curve || TWEEN.Easing.Linear.None)

            .to({cix: __inst.frames.length - 1}, duration)
            .onUpdate(function () {
                //console.log(objects[0].position.x,objects[0].position.y);

                //   __inst.cix = Math.ceil(__inst.cix);

                __inst.update();

            })
            .onComplete(function () {
                //console.log(objects[0].position.x, objects[0].position.y);

                __inst.cix = 0;


                __inst.call_on_complete();


                __inst.isComplete = true;

            });

        this.tween.start();

    }

    animate() {

       // this.apply2DFrames();

        this.timer += 1;

        if (this.delay == 0 || this.timer % this.delay == 0) {

            if (this.cix >= this.frames.length - 1) {
                this.call_on_complete();

            }

            this.cix = this.cix >= this.frames.length - 1 ? this.frameBounds.min.x : this.cix + 1;

            this.update();

        }

    }

}
;

        Gamestack.Animation = Animation;

})();
