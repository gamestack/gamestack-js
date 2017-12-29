

/**
 * Takes the min and max vectors of rectangular shape and returns Rectangle Object.
 * @param   {Object} args object of arguments
 * @param   {Gamestack.Vector} args.min the minimum vector point (x,y)
 * @param   {Gamestack.Vector} args.max the maximum vector point (x,y)
 *
 * @returns {Rectangle} a Rectangle object
 */

class Rectangle {

    constructor(min, max) {

        this.min = new Gamestack.Vector(min);
        this.max = new Gamestack.Vector(max);

    }
    toLine()
    {


    }
}
;



let VectorBounds = Rectangle;

Gamestack.VectorBounds =VectorBounds;

Gamestack.Rectangle = Rectangle;



/**
 * Takes the min and max vectors plus termPoint ('termination-point'), returns VectorFrameBounds
 *  *use this to define the bounds of an Animation object.
 * @param   {Object} args object of arguments
 * @param   {Gamestack.Vector} args.min the minimum vector point (x,y)
 * @param   {Gamestack.Vector} args.max the maximum vector point (x,y)
 * @param   {Gamestack.Vector} args.termPoint the termPoint vector point (x,y)
 * -While a min and max Gamestack.Vector(x,y) will describe the grid of Animation frames, the termPoint will indicate the last frame to show on the grid (Animations may stop early on the 'grid')
 * @returns {VectorFrameBounds} a VectorFrameBounds object
 */


class VectorFrameBounds extends Rectangle {

    constructor(min, max, termPoint) {

        super(min, max);

        this.termPoint = termPoint || new Gamestack.Vector(this.max.x, this.max.y, this.max.z);

    }


}
;

Gamestack.VectorFrameBounds = VectorFrameBounds;



/**
 * Takes several args and returns Line object. Intended for curved-line / trajectory of Projectile Object.
 * @param   {Object} args object of arguments
 * @param   {Easing} args.curve the curve applied to line see TWEEN.Easing , limited options for immediate line-drawing
 * @param   {number} args.duration the millisecond duration of Line
 * @param   {Gamestack.Vector} args.position the position vector
 *
 * @param   {number} args.pointDist the numeric point-distance
 *
 * @param   {Gamestack.Vector} args.size the size vector
 *
 * @param   {number} args.rotation the numeric rotation of -360 - 360
 *
 * @param   {number} args.growth the numeric growth
 *
 * -While a min and max Vector(x,y) will describe the grid of Animation frames, the termPoint will indicate the last frame to show on the grid (Animations may stop early on the 'grid')
 * @returns {VectorFrameBounds} a VectorFrameBounds object
 */

class Line
{
    constructor(args = {})
    {


        this.curve_options = Curves;//Curves Object (of functions)
        this.curve_string = args.curve_string || "linearNone";

        this.curve = this.get_curve_from_string(this.curve_string);

        this.motion_curve = args.motion_curve || TWEEN.Easing.Linear.None;

        if(typeof(args.curve) == 'function')
        {
            this.curve = args.curve;
        }

        this.points = args.points || [];

        this.position = args.position ||  new Gamestack.Vector();

        this.is_highlighted = args.is_highlighted || false;

        this.offset = args.offset || new Gamestack.Vector();

        this.pointDist = 5;

        this.size = args.size || new Gamestack.Vector();

        this.rotation = args.rotation || 0;

        this.origin = args.origin || new Gamestack.Vector(0, 0);

        this.iterations = 1;

        this.growth = args.growth || 1.2;

    }

    Iterations(n)
    {

       this.iterations = n;
       return this;
    }

    Growth(n)
    {
        this.growth = n;

        return this;

    }

    Origin(o)
    {
        this.position = o;
       this.origin = o;

       return this;

    }

    Pos(p)
    {
        this.origin = p;
        this.position = p;
        return this;
    }

    PointDisp(num)
    {
        this.minPointDist = num;
        return this;
    }

    Curve(c)
    {
        this.curve = c;
        this.curve_string = this.get_curve_string(c);
        return this;
    }

    Duration(d)
    {
        this.duration = d;

        return this;
    }
    Rotation(r)
    {
        this.rotation = r;
        return this;
    }
    next(position)
    {

        var found = false;

        for(var x = 0; x < this.points.length; x++)
        {

            if(position.equals(this.points[x]) &&  x < this.points.length - 1)
            {
                found = true;
                return new Gamestack.Vector(this.points[x + 1]);

            }

            if(x==this.points.length - 1 && !found)
            {

                return new Gamestack.Vector(this.points[0]);

            }

        }

    }

    get_curve_from_string(str)
    {

        console.log('Applying Line():curve:' + str);

        for(var x in this.curve_options) {

            if(x.toLowerCase() == str.toLowerCase())
            {
                return this.curve_options[x];

            }

        }

    }


    get_curve_string(c)
    {
        for(var x in this.curve_options) {

            if(this.curve_options[x] == c)
            {
                return x;

            }

        }

    }

    getGraphCanvas(curveCall, existing_canvas) {

        var canvas = existing_canvas || document.createElement('canvas');

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

        var position = {x: 0, y: 80};
        var position_old = {x: 0, y: 80};

        this.test_graph_size = new Gamestack.Vector(185, 80 -20);

       var points = this.get_line_segment(this.test_graph_size, 5, curveCall);

        for(var x in points)
        {
            var position = new Gamestack.Vector(points[x].x, this.test_graph_size.y + 20 - points[x].y);

            context.beginPath();
            context.moveTo(position_old.x, position_old.y);
            context.lineTo(position.x, position.y);
            context.closePath();
            context.stroke();

            position_old.x = position.x;
            position_old.y = position.y;
        }

        return canvas;
    }

    transpose(origin, rotation)
    {

        this.rotation = rotation;

        this.origin = origin;

        var t_points = [];

        for(var x = 0; x < this.points.length; x++) {

            var p = this.points[x];

            var np = new Gamestack.Vector(Gamestack.GeoMath.rotatePointsXY(p.x, p.y, this.rotation));

            t_points.push(np.add(origin));

            console.log(np);

        }




        return t_points;

    }

    add_segment(next_segment, offset)
    {
        for(var x = 0; x < next_segment.length; x++) {

            next_segment[x] = new Gamestack.Vector(next_segment[x]).add(offset);

            this.points.push(next_segment[x]);

        }

    }


    get_flipped_segment(points)
    {

        var t_points = points.slice(), t_len = t_points.length;

        for(var x = 0; x < points.length; x++) {

            t_points[t_len - x].x = points[x].x

        }

        return t_points;

    }

    Highlight(origin, ctx)
    {

        ctx = ctx || Gamestack.ctx;

        var points = this.transpose(origin);

        for(var x in points)
        {

            var point = points[x];

            var dist = point.sub(Gamestack.point_highlighter.position);

            var d = Math.sqrt( dist.x * dist.x + dist.y * dist.y );


            if(d >= 10)
            {
                Gamestack.point_highlighter.position = new Gamestack.Vector(points[x]);
            }


               Canvas.draw(Gamestack.point_highlighter, ctx);

        }

        return this;

    }

}


var GeoMath = {

        rotatePointsXY:function(x,y,angle) {

            var theta = angle*Math.PI/180;

            var point = {};
            point.x = x * Math.cos(theta) - y * Math.sin(theta);
            point.y = x * Math.sin(theta) + y * Math.cos(theta);

            point.z = 0;

            return point
        }

}

Gamestack.GeoMath = GeoMath;
