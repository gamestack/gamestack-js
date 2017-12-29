/*
 * Gamestack.GSProton: -An implementation of the Proton.js particle engine.
 * :instantiable
 * :data-persistent / json format
 * :reloadable
 * :__presets : various GSProton objects for in-game-use
 *
 * */

(function(){
    console.log('CanvasStack class... creating');


    /**
     * Gamestack.GSProton: Takes arguments of image, canvas, parent, collideables?

     * @param   {image} the img
     * @param   {canvas} canvas to draw on
     * @param   {parent} the parent, either a position{x,y,z} or object with a 'position' property having x,y,z
     * @returns {GSProton} a GSProton object
     */

class GSProton {

    constructor(image, canvas, parent, collideables) {

        var args = {image:image, canvas:canvas, parent:parent, collideables:collideables};

        if(image.image && image.canvas) //image is a GS Proton passed back through constructor as first argument --enable data persistence
        {

            args = image;

        }

        args.canvas = args.canvas || Gamestack.canvas;

        args.parent = args.parent || new Gamestack.Vector(0, 0, 0);

        args.image = args.image || new Gamestack.GameImage;

        this.name = args.name || "__NO-Name";

        this.description = args.description || "__NO-Description";

        this.image = args.image;

        this.active = false;

        this.image =args.image;

        this.canvas = args.canvas;

        this.emission_amount_min = 1;

        this.emission_amount_max = 1;

        this.radius = 0;


        this.mass = 1;

        this.emissions_frequency = 5;

        this.gravity = 0;

        this.proton = {};

        this.usingAttraction = false;

        this.usingRepulsion = false;

        this.usingPointZone = false;

        this.pointZoneX = 0;

        this.pointZoneY = 0;

        this.usingBlendAlpha = false;

        this.attraction = {

          position:new Vector(0, 0),

            min:0,

            max:0

        };

        this.repulsion = {

            position:new Gamestack.Vector(0, 0),

            min:0,

            max:0

        };

        this.startAlpha = 1.0;

        this.endAlpha = 1.0;

        this.startColor_asRandom = true;

        this.startColor = "#FFFFFF";

        this.startScale = 1.0;

        this.endScale = 1.0;

        this.endColor_asRandom = true;

        this.endColor = "#FFFFFF";

        this.positionX_asRandom = false;

        this.positionY_asRandom = false;

        this.positionX = 0;

        this.positionY = 0;

        this.vSpeedMin = 0.5;

        this.vSpeedMax = 1.5;

        this.vSpeedRotationMin = 0;

        this.vSpeedRotationMax = 360;

        this.lifeMin = 5;

        this.lifeMax = 10;

        for(var x in this)
        {
            if(args.hasOwnProperty(x))
            {

                this[x] = args[x];

            }

        }

        //the following instantiate to empty []

        this.initializers = [];

        this.behaviors = [];

    }

    replaceBehaviorByType(constructor, replacement) {

        for (var x in this.behaviors) //remove any existing object by type
        {
            if (this.behaviors[x] instanceof constructor) {

                this.behaviors.splice(x, 1);

            }
        }

        this.behaviors.push(replacement);

        this.ticker = 0;

    }

    Collideables(collideableArray) {
        this.collideables = collideableArray;
    }

    Rotation(minRot, maxRot) {

        maxRot = maxRot || minRot; //they are either positive-number or the same
        this.vSpeedRotationMin = minRot;

        this.vSpeedRotationMax = maxRot;

        this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));

    }

    Gravity(grav) {

        this.gravity = grav;

        this.replaceBehaviorByType(Proton.Gravity, new Proton.Gravity(this.gravity));

    }

    Velocity(minV, maxV) {

        maxV = maxV || minV; //they are either positive-number or the same
        this.vSpeedMin = minV;

        this.vSpeedMax = maxV;

        this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));

    }

    Attraction(position, min, max)
    {
        this.usingAttraction = true;

       this.attraction.position = position;

       this.attraction.min = min;

       this.attraction.max = max;
    }

    Repulsion(x, y, min, max)
    {
        this.usingRepulsion = true;

        this.repulsion.position = position;

        this.repulsion.min = min;

        this.repulsion.max = max;
    }

    onUpdate() {

    }

    isRectangularCollision(obj1, obj2) {

        return obj1.position.x + obj1.size.x > obj2.position.x &&
            obj1.position.y + obj1.size.y > obj2.position.y &&
            obj1.position.x < obj2.position.x + obj2.size.x &&
            obj1.position.y < obj2.position.y + obj2.size.y;

    }

    collide(obj1, obj2) {
        console.log('collide() function UNSET');

    }

    update(collideables) {

        collideables = collideables || this.collideables || [];

        this.ticker += 1;

        if (this.ticker % 100 == 0) {

            console.log('Proton:update():');
            console.log(this.emitter);

        }

        if (this.positionX_asRandom) {
            this.emitter.p.x = Math.floor(Math.random() * canvas.width);
        }
        else {
            this.emitter.p.x = this.positionX;

        }


        if (this.positionY_asRandom) {
            this.emitter.p.y = Math.floor(Math.random() * canvas.width);
        }
        else {
            this.emitter.p.y = this.positionY;

        }

        var particles = this.emitter.particles;


        for (var x = 0; x < particles.length; x++) {
            var p = {

                size: {
                    x: Math.round(this.emitter.initializes[0].w * this.emitter.scale),

                    y: Math.round(this.emitter.initializes[0].h * this.emitter.scale)

                },

                position: particles[x].p

            };
            for (var y = 0; y < collideables.length; y++) {

                if (collideables[y].hasOwnProperty('position') && collideables[y].hasOwnProperty('size') && this.isRectangularCollision(p, collideables[y])) {

                    this.collide(p, collideables[y])

                }

            }


        }

    }

    init() {

        this.proton = new Proton;

        this.emit_mode = this.emit_mode || "";

        this.emitter = new Proton.Emitter();

        this.emission_amount = this.emission_amount || 10;

        this.emissions_frequency = this.emissions_frequency || 10;

        var rps = 5 / this.emissions_frequency;

        this.emitter.rate = new Proton.Rate([this.emission_amount_min, this.emission_amount_max], rps);

        function allNumbers(list)
        {
            for(var x in list)
            {
                if(typeof(list[x]) == 'number')
                {


                }
                else
                {
                    return false
                }

            }

            return true;

        };

        this.initializers = [];

        this.behaviors = [];

        this.initializers.push(new Proton.ImageTarget(this.image));
        this.initializers.push(new Proton.Mass(this.mass));
        this.initializers.push(new Proton.Life(this.lifeMin, this.lifeMax));

        this.initializers.push(new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));




        if(this.usingPointZone)
        {

            this.initializers.push(new Proton.Position(new Proton.PointZone(this.pointZoneX, this.pointZoneY)));

        }



        this.behaviors.push(new Proton.Gravity(this.gravity));

        this.behaviors.push(new Proton.Alpha(1, [this.startAlpha, this.endAlpha]));

        this.behaviors.push(new Proton.Color(this.startColor_asRandom ? 'random' : this.startColor, this.endColor_asRandom ? 'random' : this.endColor, Infinity, Proton.easeInSine));

        this.behaviors.push(new Proton.Scale(this.startScale, this.endScale));

        if(allNumbers([this.attractionX, this.attractionY, this.attractionMin, this.attractionMax]))
        {
            console.info('Creating attraction');

            this.behaviors.push(new Proton.Attraction({x:this.attractionX,y:this.attractionY}, this.attractionMin, this.attractionMax));

        }

        if(allNumbers([this.repulsionX, this.repulsionY, this.repulsionMin, this.repulsionMax]))
        {
            console.info('Creating repulsion');

            this.behaviors.push(new Proton.Repulsion({x:this.repulsionX,y:this.repulsionY}, this.repulsionMin, this.repulsionMax));

        }

        if(this.usingAttraction)
        {
           this.behaviors.push(new Proton.Attraction(this.attraction.position, this.attraction.min, this.attraction.max));

        }

        if(this.usingRepulsion)
        {
            this.behaviors.push(new Proton.Repulsion(this.repulsion.position, this.repulsion.min, this.repulsion.max));

        }

        if(this.radius > 0)
        {
            this.initializers.push(new Proton.Radius(this.radius));


        }


        var i = this.initializers;

        for (var x in i) {
            this.emitter.addInitialize(i[x]);
        }

        var b = this.behaviors;

        for (var x in b) {
            this.emitter.addBehaviour(b[x]);
        }

        this.emitter.p = this.parent && this.parent.hasOwnProperty('x') ? new Vector(this.parent) : this.emitter.p;

        this.emitter.p = this.parent && this.parent.hasOwnProperty('position')&& this.parent.position.hasOwnProperty('x') ? new Vector(this.parent.position) : this.emitter.p;

        this.emitter.p.x += this.positionX;
        this.emitter.p.y += this.positionY;

            this.emitter.emit();

        this.proton.addEmitter(this.emitter);

        this.renderer = new Proton.Renderer('canvas', this.proton, this.canvas);

        if(this.usingBlendAlpha)
        {
            this.renderer.blendFunc("SRC_ALPHA", "ONE");

        }

        var __inst = this;

        this.renderer.start();

        this.tick();
    }

    on()
    {
        this.init();
    }

    off()
    {
       if(this.emitter && this.emitter.stopEmit)
           this.emitter.stopEmit();
    }

    tick() {

        requestAnimationFrame(function () {
            __inst.tick()
        });

        var __inst =  this;

            this.proton.update();
       // this.update();
    }


}


var ProtonPresets = {

    //particleDemoName:new GSProton();   //add particleDemoObjects


};

Gamestack.GSProton = GSProton;

})();
