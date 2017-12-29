/**
 * Takes an object of arguments and returns Projectile() object. Projectile fires a shot from the parent sprite, with specified offset, rotation, motion_curve, line_curve

 * @param   {Object} args object of arguments
 * @param   {string} args.name optional
 * @param   {string} args.description optional
 * @param   {string} args.distance the distance before dissappearance
 * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.motion_curve the TWEEN.Easing function to be applied for motion/speed (Example: TWEEN.Easing.Quadratic.InOut)
 *
 *  * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.line_curve the TWEEN.Easing function to be applied for line (Example: TWEEN.Easing.Quadratic.InOut)
 *
 * @returns {Projectile} a Projectile object
 */

class Projectile {

    constructor(args = {}) {

        this.getArg = $Q.getArg;

        for (var x in args) {
            this[x] = args[x];

        }

        this.name = args.name || "__";

        this.description = args.description || "__";

        this.animation = Gamestack.getArg(args, 'animation', new Animation());

        this.parent_id = args.parent_id || args.object_id || "__blank"; //The parent object

        this.name = Gamestack.getArg(args, 'name', "__");

        this.size = false;

        if(args.size)
        {
            this.size = new Vector(args.size);
        }
        else if(this.animation && this.animation.frameSize)
        {
           this.size =  new Vector(this.animation.frameSize);

        }
        else
        {
            console.info('Projectile():using default size.');
            this.size = new Vector(20, 20, 20);
        }

        this.origin = args.origin || new Vector(0, 0, 0);

        this.rotation = args.rotation || 0;

        this.line.Rotation(this.rotation);

        this.description = Gamestack.getArg(args, 'description', false);

        this.duration = Gamestack.getArg(args, 'duration', 500);

        this.delay = Gamestack.getArg(args, 'delay', 0);

        this.position = Gamestack.getArg(args, 'position', new Vector(0, 0, 0));

        this.motion_curve = Gamestack.getArg(args, 'motion_curve', TWEEN.Easing.Linear.None);

        this.highlighted = false;

        this.sprites = [];

        this.run_ext = args.run_ext || [];

    }

    /**
     * specify a function to be called when Motion is complete
     *
     * @function
     * @memberof Projectile
     * @param {Function} fun the function to be called when complete
     *
     **********/

    onComplete(fun) {
        this.complete = fun;

    }

    onCollide(fun) {
        this.collide = fun;

    }

    setAnimation(anime) {

        this.animation = anime;

        return this;

    }

    setMotionCurve(c) {

        this.motion_curve = c;

        return this;

    }

    kill_one() {

        var spr = this.sprites[this.sprites.length - 1];

        Gamestack.remove(spr);

    }

    onRun(caller, callkey) {

        this.run_ext = this.run_ext || [];

        this.run_ext.push({caller: caller, callkey: callkey});

    }

    shoot_basic(position, size, rot_offset, speed, numberShots, disp){

        var __playerInst = this;

        var bx = position.x, by = position.y, bw = size.x, bh = size.y;

        var half = numberShots / 2;

        for(var x = half * -1; x <= half; x++) {
            var shot = Gamestack.add(new Sprite({

                active: true,

                position: position,

                size: size,

                speed: speed,

                image: animation.image,

                rotation: new Vector3(0, 0, 0),

                flipX: false

            }));

            shot.setAnimation(animation);

            rot_offset = new Vector(rot_offset + (x * disp), 0, 0);

            shot.position.x = bx, shot.position.y = by;
            shot.rotation.x = 0 + rot_offset.x;

            shot.stats = {

                damage: 1

            };

            if (!options.line) {

                shot.onUpdate(function () {

                    shot.position.x += Math.cos((shot.rotation.x) * 3.14 / 180) * speed;

                    shot.position.y += Math.sin((shot.rotation.x) * 3.14 / 180) * speed;

                });


            }


        }

    }


    fire(origin, rotation) {

        for (var x = 0; x < this.run_ext.length; x++) {

            this.run_ext[x].caller[this.run_ext[x].callkey]();

        }


        this.line.origin = origin;

        this.line.rotation = rotation;

        console.log('FIRING FROM:' + jstr(origin));

        var sprite = new Sprite({image: this.animation.image});

        sprite.setAnimation(this.animation);

        sprite.setSize(this.size);

        sprite.position = new Vector(0, 0, 0);

        var __inst = this;

        __inst.line.fill();

        var lp = this.line.points;

        sprite.position = new Vector(lp[0]);

        sprite.onUpdate(function (sprite) {

            for (var x = 0; x < lp.length; x++) {

                if (sprite.position.equals(lp[x]) && x < lp.length - 1) {

                    sprite.position = new Vector(lp[x + 1]);

                    break;
                }

                if (x == lp.length - 1) {
                    Gamestack.remove(sprite);

                }

            }

        });

        Gamestack.add(sprite);

        this.sprites.push(sprite);

    }

}


Gamestack.Projectile = Projectile;







