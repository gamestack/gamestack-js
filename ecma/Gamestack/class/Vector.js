(function () {
    console.log('Vector class... creating');


    /**
     * Gamestack.Vector: Takes arguments of x, y, and (optionally) z, instantiates Vector object

     <ul>
     <li>Optional: use a Vector as the 'x' argument, and instantiate new distinct Vector from the argument</li>
     </ul>

     * @param   {number} x the x coordinate
     * @param   {number} y the y coordinate
     * @param   {number} z the z coordinate
     * @returns {Vector} a Vector object
     */

    class Vector {
        constructor(x, y, z, r) {

            if (typeof(x) == 'object' && x.hasOwnProperty('x') && x.hasOwnProperty('y')) //optionally pass vector3
            {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z || 0;

                if (this.z == null) {
                    this.z = 0;
                }

                this.valid_check();

                return this;
            }

            if (z == null) {
                z = 0;
            }

            this.x = x;
            this.y = y;
            this.z = z;
            this.r = r;

            this.valid_check();

        }

        valid_check() {
            if (this.x == undefined || this.y == undefined || this.z == undefined) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }


        }

        sub(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x - v.x, this.y - v.y, this.z - v.z);

        }

        add(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x + v.x, this.y + v.y, this.z + v.z);

        }

        mult(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x * v.x, this.y * v.y, this.z * v.z);

        }

        div(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        }

        round() {
            return new Gamestack.Vector(Math.round(this.x), Math.round(this.y), Math.round(this.z));

        }

        floor() {
            return new Gamestack.Vector(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));

        }

        ceil() {
            return new Gamestack.Vector(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));

        }

        equals(v) {

            return this.x == v.x && this.y == v.y && this.z == v.z;
        }

        trig_distance_xy(v) {

            var dist = this.sub(v);

            return Math.sqrt(dist.x * dist.x + dist.y * dist.y);

        }

        diff() {
            //TODO:this function


        }

        abs_diff() {
            //TODO:this function

        }

        is_between(v1, v2) {
            //TODO : overlap vectors return boolean

            return this.x >= v1.x && this.x <= v2.x &&
                this.y >= v1.y && this.y <= v2.y &&
                this.z >= v1.z && this.z <= v2.z;


        }

    }
    ;


    let Vector3 = Vector, Pos = Vector, Size = Vector, Position = Vector, Vector2 = Vector, Rotation = Vector;

    Gamestack.Vector = Vector;

    Gamestack.Rotation = Vector;

    Gamestack.Pos = Vector;

    Gamestack.Position = Vector;

    Gamestack.Size = Vector;


//The above are a list of synonymous expressions for Vector. All of these do the same thing in this library (store x,y,z values)


//SuperVector() : handles all advanced Vector mathematics for any class requiring Vector math

var VectorMath = {

    rotatePointsXY(x, y, angle) {

        var theta = angle * Math.PI / 180;

        var point = {};
        point.x = x * Math.cos(theta) - y * Math.sin(theta);
        point.y = x * Math.sin(theta) + y * Math.cos(theta);

        point.z = 0;

        return point
    }

}

Gamestack.VectorMath = VectorMath;

})();