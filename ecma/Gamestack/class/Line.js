
(function(){
    console.log('Line() class... creating');

    var Curves = { //ALL HAVE INPUT AND OUTPUT OF: 0-1.0
    // no easing, no acceleration
    linearNone: function (t) { return t },

    // accelerating from zero velocity
    easeInQuadratic: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuadratic: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuadratic: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuartic: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuartic: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuartic: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuintic: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuintic: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuintic: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

Gamestack.Curves = Curves;





/**
 * Takes several args and returns Line object. Intended for curved-line / trajectory of Projectile Object.
 * @param   {Object} args object of arguments
 * @param   {string} args.curve passed in as string, the key to a curveMethod, options are ['cubic', 'quartic', 'quadratic', 'quintic']
 * @param   {number} args.duration the millisecond duration of Line
 * @param   {Gamestack.Vector} args.position the position vector
 *
 * @param   {number} args.pointDisp the numeric point-distance
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


var inOutCurves = {

    quadratic: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },

    cubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },

    quartic: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },

    quintic: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },

    linear: function (t) { return t; } //provided for consistency / in case 'linear' is needed

    };


Gamestack.Curves.InOut = inOutCurves;

class Line
{
    constructor(args={})
    {
        this.points = [];

        this.pointDisp = 1;

        this.size = args.size || new Gamestack.Vector(100, 100, 0);

        this.position = new Gamestack.Vector(0, 0, 0);
    }

    Rot(r)
    {

        this.rotation = r;

        return this;
    }

    Pos(p)
    {

        this.position = p;

        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.position = p;

        }

        return this;
    }

    Size(s)
    {

       this.size = s;

        if(typeof(s) == 'number')
        {
            this.size = new Gamestack.Vector(s, s, s);

        }

        return this;
    }

    Dispersion(num)
    {
        this.pointDisp = num;
        return this;
    }

    Curve(c, size)
    {
        this.curve = c;

        this.curveMethod = Gamestack.Curves.InOut[this.curve.toLowerCase()];

        if(c)
        this.curve_size = new Gamestack.Vector(size)

        return this;
    }

    CurveSize(s)
    {

        if(typeof(s) == 'number')
        {
            this.curve_size = new Gamestack.Vector(s, s, s);

        }
        else {

            this.curve_size = s;

        }

        return this;
    }

    Duration(d)
    {
        this.duration = d;

        return this;
    }

    Fill()
    {

        var current_point = new Gamestack.Vector(0, 0, 0);

        for(var x = 0; x <= Math.abs(this.size.x); x++)
        {

            var position = new Gamestack.Vector(x, 0, 0);

            if (current_point.trig_distance_xy(position) >= this.pointDisp)              {
                this.points.push(new Gamestack.Vector(position));

                current_point = new Gamestack.Vector(position);

            }
        }

        this.TransposeByRotation(this.rotation);

        return this;
    }

    TransposeByRotation(rotation)
    {

        this.rotation = rotation;

        function rotate(cx, cy, x, y, angle) {
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return new Gamestack.Vector(nx, ny);
        }

        for(var x = 0; x < this.points.length; x++) {

            var p = this.points[x];

            var np = rotate(this.position.x, this.position.y, p.x, p.y, this.rotation);

            this.points[x]= np;

        }

        return this;

    }

    Highlight(sprite, ctx, gameWindow)
    {

        this.highlight_sprites = this.highlight_sprites || [];

        ctx = ctx || Gamestack.ctx;

        var points = this.points;

        gameWindow = gameWindow || Gamestack.game_windows[0];

        for(var x in points)
        {

            console.log(points[x]);

            if(!this.highlight_sprites[x])
            {
                this.highlight_sprites[x] = gameWindow.add(new Gamestack.Sprite(sprite), ctx);
            }

            var point = points[x];

            this.highlight_sprites[x].position = new Gamestack.Vector(point.sub( this.highlight_sprites[x].size.div(2)));

        }

        return this;

    }

    RemoveHighlight(sprite, ctx, gameWindow)
    {
        gameWindow = gameWindow || Gamestack.game_windows[0];

        for(var x in this.highlight_sprites)
        {
            gameWindow.remove(this.highlight_sprites[x]);

        }

        this.highlight_sprites = [];

        return this;

    }
}

Gamestack.Line = Line;

class WaveLine extends Line
{
    constructor(pos, size, curve_key)
    {
        var args = {};

        if(typeof(size) == 'number' || size instanceof Gamestack.Vector)
        {
            super({});
        }
        else if (size instanceof Object)
        {
            super(size);

            args = size;
        }


        this.Pos(pos);

        this.Size(size);

        this.curve_options = Curves;//Curves Object (of functions)

        curve_key = curve_key || args.curve_key || "quadratic"

        this.curve = curve_key ? curve_key.toLowerCase() : "quadratic";

        this.curve_options = ['cubic', 'quartic', 'quadratic', 'quintic', 'sine'];

        this.curveMethod = Gamestack.Curves.InOut[this.curve.toLowerCase()];

        this.points = args.points || [];

        this.is_highlighted = args.is_highlighted || false;

        this.offset = args.offset || new Gamestack.Vector(0, 0, 0);

        this.pointDisp = args.pointDisp || 5;

        this.rotation = args.rotation || 0;

        this.iterations = args.iterations || 1;

        this.max_size = args.max_size || this.size || new Gamestack.Vector(5000, 5000);

        this.growth = args.growth || 1.0;

    }

    Max(p)
    {

        this.target = p;

        if(typeof(p) == 'number')
        {
            this.target = new Gamestack.Vector(p, p, p);

        }
        else {

            this.target = p;

        }

        this.max = this.target; //'max' is synonymous with 'target'

        return this;
    }

    Min(p)
    {

        this.position = p;

        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.tposition = p;

        }

        this.min = this.position; //'max' is synonymous with 'target'

        return this;
    }

    Decay(n)
    {
        if(n < -1.0)
            n = -1.0;

        if(n > 1.0)
        {
            n = 1.0;
        }

        this.growth = 1.0 - n;

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

    Fill()
    {
        this.size = new Gamestack.Vector(this.size);

        var __inst = this;

        this.points = [];

        var current_point = new Gamestack.Vector(this.position), yTrack = 0;

        var x = 1, max_recursion = 300;

        var position = current_point;

        var dist = new Gamestack.Vector(20, 20, 20);

        var size = new Gamestack.Vector(this.curve_size || this.size);

       while(Math.abs(position.x) <= Math.abs(this.max_size.x) && size.x > 2 && dist.x > 2) {

             position = new Gamestack.Vector(current_point);

               var target = new Gamestack.Vector(position.add(size)),

                start = new Gamestack.Vector(position),

                curveMethod = this.curveMethod,

                ptrack = new Gamestack.Vector(start);

            for (position.x = position.x; position.x < Math.abs(target.x); position.x += 1) {

                dist = position.sub(start);

                var pct = dist.x / size.x;

                position.y = start.y +  curveMethod(pct) * (x % 2 == 0 ? size.y : size.y * -1);

              //  position = position.round();

                if (current_point.trig_distance_xy(position) >= this.pointDisp) {

                    var p = new Gamestack.Vector(position);

                        this.points.push(p);

                    current_point = new Gamestack.Vector(position);

                }
            }

            size = size.mult(this.growth);

            if(x > max_recursion)
            {
                return console.error('Too much recursion in SwagLine');
            }

            x+= 1;

        }

        this.TransposeByRotation(this.rotation);

        return this;
    }

    Rotate(rotation)
    {
        this.rotation = rotation;

        if(typeof(this.rotation) == 'object')
        {

            this.rotation = this.rotation.x;

        }

      return this;
    }

}

Gamestack.WaveLine = WaveLine;

class ShapeLine extends Line
{

    constructor(args={})
    {
        super(args);

        this.targetTotalPoints = args.total || 200;

    }

    Total(t)
    {

        this.targetTotalPoints = t;
        return this;
    }

    Eliptical(pos, size, rotation)
    {
        this.Pos(pos || this.position);

        this.Size(size || this.size);

        this.Rot(rotation || this.rotation);

        function fill(elipse)
        {

            elipse.points = [];

        var center = elipse.position.add(elipse.size.div(2));

        var current_point = new Gamestack.Vector(0, 0, 0);

        var a = Math.abs(elipse.size.x /2), b = Math.abs(elipse.size.y /2);

        var perim = 2 * Math.PI * Math.sqrt(a * a + b * b);

        var step = (2 * Math.PI) / elipse.targetTotalPoints;

        for (var i = 0 * Math.PI; i < 2 * Math.PI; i += step) {

            var p = new Gamestack.Vector(center.x - (a * Math.cos(i)), center.y + (b * Math.sin(i)));

            elipse.points.push(new Gamestack.Vector(p));

            current_point = new Gamestack.Vector(p);

        }
        }

        fill(this);

        this.Fill = function(){

            fill(this);

            return this;

        };

        return this;
    }

    Quadrilateral(pos, size, rotation)
    {
        this.Pos(pos || this.position);

        this.Size(size || this.size);

        this.Rot(rotation || this.rotation);

        function fill(quad)
        {

            quad.points = [];

            var current_point = new Gamestack.Vector(0, 0, 0);

            var perim = 2 * quad.size.x + 2 * quad.size.y,

                stepX = quad.size.x / (quad.targetTotalPoints * (quad.size.x / perim)),

                stepY =  quad.size.y / (quad.targetTotalPoints * (quad.size.y / perim));

            for(var x = 0; x < quad.size.x; x+= stepX)
            {
                var p1 = new Gamestack.Vector(x, 0).add(quad.position);

                    quad.points.push(new Gamestack.Vector(p1));
            }

            for(var y = 0; y < quad.size.y; y+= stepY)
            {
                var p1 = new Gamestack.Vector(quad.size.x, y).add(quad.position);

                    quad.points.push(new Gamestack.Vector(p1));
            }

            for(var x = quad.size.x; x >= 0; x-= stepX)
            {
                var p1 = new Gamestack.Vector(x, quad.size.y).add(quad.position);

                quad.points.push(new Gamestack.Vector(p1));
            }

            for(var y = quad.size.y; y >= 0; y-= stepY)
            {
                var p1 = new Gamestack.Vector(0, y).add(quad.position);

                quad.points.push(new Gamestack.Vector(p1));
            }


        }

        fill(this);

        this.Fill = function(){

            fill(this);

            return this;

        };

        return this;
    }
};

Gamestack.ShapeLine = ShapeLine;

})();