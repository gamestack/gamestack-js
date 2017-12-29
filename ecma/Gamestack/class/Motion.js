/**
 * Takes an object of arguments and returns Motion() object. Motion animates movement of position and rotation properties for any Sprite()

 * @param   {Object} args object of arguments
 * @param   {string} args.name optional
 * @param   {string} args.description optional
 * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.curve the TWEEN.Easing function to be applied (Example: TWEEN.Easing.Quadratic.InOut)
 * @param   {Vector} args.targetRotation the targeted rotation result, when using rotation with movement
 * @param   {Vector} args.distance the target distance of position change, when moving position
 * @param   {number} args.duration the milliseconds duration of the Motion
 * @param   {number} args.delay the milliseconds delay before the Motion occurs (on call of Motion.engage())
 *
 *
 * @returns {Motion} a Motion object
 */

(function () {
    console.log('Motion class... creating');

    /*
     * TweenMotion constructors:
     *
     * new TweenMotion({motion_curve, distance(Vector), rotation(Vector)})
     *
     *  new Motion(new JaggedLine())
     *
     * */

    class Motion extends GSO //extends GSO || GamestackOverrideable
    {
        constructor(args={})
        {
            super(args);

            this.state_save = false;

            this.parent = args.parent || Gamestack.Extendors.applyParentalArgs(this, args);

            Gamestack.Extendors.informable(this, args);

            Gamestack.Extendors.tweenable(this, args);

        }

        restoreState()
        {
            for(var x in this.state_save)
            {
                this.parent[x] = this.state_save[x];
            }
        }

    };


    class TweenMotion extends Motion { //tween the state of an object, including 'position', 'size', and 'rotation' --rotation.x, etc..

        constructor(args = {}) {

            super(args);

            this.getArg = $Q.getArg;

            this.transition = args.trans || args.transition || "literal" || "add";
            this.transition_options = ['literal', 'add'];

            if(typeof(args.curve) == 'string')
            {
                args.curve_string = args.curve;
            }

            this.setTweenCurve(args.curve_string);

            this.target = false;

            if(args.target) {

                this.target = args.target;
            }

            this.curvesList = this.curvesToArray(); //Tween.Easing

            this.duration = Gamestack.getArg(args, 'duration', 500);

            this.delay = Gamestack.getArg(args, 'delay', 0);
        }

        targetCheck(parent)
        {

            if(!this.target.position)
            {
                this.target.position = new Vector();
            }

            if(!this.target.size)
            {
                this.target.size = new Vector();
            }

            if(!this.target.rotation)
            {
                this.target.rotation = new Vector();
            }

        }

        engage() {

            var __inst = this;

            __inst.call_on_run(); //call any on-run extensions

            this.tweens = [];

            var object = this.parent;

            this.targetCheck();

            if(!this.state_save) {

                this.state_save = {
                    position: new Gamestack.Vector(this.parent.position),
                    rotation: new Gamestack.Vector(this.parent.rotation),
                    size: new Gamestack.Vector(this.parent.size)
                };

            }

            if(this.parent && !this.target){

                this.target = {

                    position: new Gamestack.Vector(this.parent.position),

                    rotation: new Gamestack.Vector(this.parent.rotation),

                    size: new Gamestack.Vector(this.parent.size)

                };

            }
            else if (!this.target) {

                this.target = {

                    position: new Gamestack.Vector(),

                    rotation: new Gamestack.Vector(),

                    size: new Gamestack.Vector()

                };

            };


            if (this.transition !== 'literal') { //transition is assumed to be additive

                this.target.position = object.position.add(this.target.position);
                this.target.rotation = object.rotation.add(this.target.rotation);
                this.target.size = object.size.add(this.target.size);

            };

            //we always have a targetPosition
            //construct a tween::
            this.tweens.push(new TWEEN.Tween(object.position)
                .easing(__inst.curve || __inst.motion_curve)

                .to(this.target.position, __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);
                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));

            this.tweens.push(new TWEEN.Tween(object.rotation)
                .easing(__inst.curve || __inst.motion_curve)

                .to(this.target.rotation, __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);
                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));


            this.tweens.push(new TWEEN.Tween(object.size)
                .easing(__inst.curve || __inst.motion_curve)

                .to(this.target.size, __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);
                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));


            for (var x = 0; x < this.tweens.length; x++) {

                this.tweens[x].start();

            };
        }

        /**
         * start the Motion transition
         *
         * @function
         * @memberof Motion
         *
         **********/

        start() {

            this.engage();

        }

// obj.getGraphCanvas( $(c.domElement), value.replace('_', '.'), TWEEN.Easing[parts[0]][parts[1]] );

        getGraphCanvas(t, f, c) {

            var canvas = c || document.createElement('canvas');

            canvas.style.position = "relative";

            canvas.id = 'curve-display';

            canvas.setAttribute('class', 'motion-curve');

            canvas.width = 180;
            canvas.height = 100;

            canvas.style.background = "black";

            var context = canvas.getContext('2d');
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, 180, 100);

            context.lineWidth = 0.5;
            context.strokeStyle = "rgb(230,230,230)";

            context.beginPath();
            context.moveTo(0, 20);
            context.lineTo(180, 20);
            context.moveTo(0, 80);
            context.lineTo(180, 80);
            context.closePath();
            context.stroke();

            context.lineWidth = 2;
            context.strokeStyle = "rgb(255,127,127)";

            var position = {x: 5, y: 80};
            var position_old = {x: 5, y: 80};

            new TWEEN.Tween(position).to({x: 175}, 2000).easing(TWEEN.Easing.Linear.None).start();
            new TWEEN.Tween(position).to({y: 20}, 2000).easing(f).onUpdate(function () {

                context.beginPath();
                context.moveTo(position_old.x, position_old.y);
                context.lineTo(position.x, position.y);
                context.closePath();
                context.stroke();

                position_old.x = position.x;
                position_old.y = position.y;

            }).start();

            return canvas;
        }

        getTweenPoints(size, line) {

            //must have line.minPointDist

            var curve = line.curve,
                duration = line.duration;

            var points = [];

            var position = new Vector(line.position);

            var target = new Vector(position).add(size);

            var start = new Vector(position);

            var dist = new Vector(0, 0, 0);

            var ptrack;


            var easeInOutQuad = function (t) {
                return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            };


            return points;

            var t1 = new TWEEN.Tween(position).to({x: target.x}, 2000).easing(TWEEN.Easing.Linear.None).start();

            if (t2) {
                t2.stop();
            }

            var t2 = new TWEEN.Tween(position).to({y: target.y}, 2000).easing(curve).onUpdate(function () {


                if (ptrack) {

                    dist = ptrack.sub(p);

                    var d = Math.sqrt(dist.x * dist.x + dist.y * dist.y);

                    if (d >= line.minPointDist) {

                        points.push(p);

                        ptrack = new Vector(p);
                    }

                }

                else {
                    ptrack = p;

                    points.push(p);
                }
                ;

            }).onComplete(function () {

                // alert(line.minPointDist);

                line.first_segment = points.slice();

                var extendLinePoints = function (segment, points, ix) {

                    var next_points = segment.slice();

                    var last_point = points[points.length - 1];

                    for (var x = 0; x < next_points.length; x++) {

                        var sr = new Vector(Gamestack.GeoMath.rotatePointsXY(line.size.x * ix, line.size.y * ix, line.rotation));

                        var p = next_points[x].add(sr);

                        if (points.indexOf(p) <= -1) {

                            points.push(p);


                        }

                    }
                };

                for (var x = 0; x <= line.curve_iterations; x++) {
                    if (x > 1) {

                        extendLinePoints(line.first_segment, line.points, x - 1);

                    }

                }


            }).start();

            return points;
        }
    }

    Gamestack.TweenMotion = TweenMotion;


    class LineMotion extends Motion
    {
        constructor(args={})
        {
            super(args);

            Gamestack.Extendors.spatial(this);

            this.Size(args.size || new Gamestack.Vector(200, 200));

            this.Pos(args.size || new Gamestack.Vector(200, 200));

            this.Rot(args.size || new Gamestack.Vector(200, 200));

        }
        Highlight(spr, ctx, gameWindow)
        {
            this.line.Highlight(spr, ctx, gameWindow);

            return this;
        }
        Eliptical(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.ShapeLine().Eliptical(pos, size, 0).Fill();

            return this;

        }


        Box(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.ShapeLine().Quadrilateral(pos, size, 0).Fill();

            return this;
        }
        QuadraticWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'quadratic').Fill();

            return this;

        }
        CubicWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'cubic').Fill();

            return this;
        }
        QuinticWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'quintic').Fill();

            return this;
        }
    }

    Gamestack.LineMotion = LineMotion;
})
();


