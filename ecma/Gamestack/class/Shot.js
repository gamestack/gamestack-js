
class Shot
{
    constructor(name, imageOrAnimation)
    {
        this.name = name || 'No-Name';

        if(imageOrAnimation instanceof Gamestack.GameImage)
        {
            this.anime = new Animation(imageOrAnimation);
        }
        else if(imageOrAnimation instanceof Gamestack.Animation)
        {
            this.anime = imageOrAnimation;

        }

        this.rotation = 0;

        this.rot_disp = 0;


        var args = name instanceof Object ? name : {};


        //is name / first arg an entire instance of shot?

        this.init(args);

    }

    init(args)
    {
        if(args instanceof Object) {

            for (var x in args) {

                this[x] = args[x];

                if(args[x] instanceof Object && args[x].hasOwnProperty('x'))//process as Vector
                {
                    this[x] = new Vector(args[x]);
                }


            }


            if(typeof this.velocity =='object' && this.velocity.x)
            {
                this.velocity = this.velocity.x; //velocity is single number
            }

            this.size = args.size || new Gamestack.Vector(20, 20);

            this.position = args.position || new Gamestack.Vector(0, 0);

            this.offset = args.offset || new Gamestack.Vector(0, 0);


        }

        Gamestack.ChainSet.informable(this);
    }

    Image(image)
    {

        this.anime = new Animation(image);

    }

    Animation(anime)
    {
        this.anime = anime;
        return this;
    }

    Total(total, rot_disp_per_unit)
    {

        this.total =total;

        this.rot_disp = rot_disp_per_unit;

        return this;

    }

    WaveGrowth(growth)
    {
        if(growth > 0)
            this.curve_growth = growth;
    }

    CurveMode(key, size, growth)
    {
        this.curve = Gamestack.Curves.InOut[key.toLowerCase()];

        this.curve_key = key.toLowerCase();

        this.curve_size = size;

        if(growth > 0)
        this.curve_growth = growth;

        if(typeof(this.curve_size)=='number')
            this.curve_size = new Gamestack.Vector(this.curve_size, this.curve_size);

        return this;

    }

    RotDisp( rot_disp)
    {
        this.rot_disp = rot_disp;

        return this;
    }

    Velocity(v)
    {
        if(typeof v == 'object' && v.x)
        {
            this.speed = v.x;
        }
        else {
            this.speed = v;

        }

        return this;
    }

    Speed(v)
    {
        if(typeof v == 'object' && v.x)
        {
            this.speed = v.x;
        }
        else {
            this.speed = v;

        }

        return this;
    }

    Position(p)
    {
        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.position = p;

        }

        return this;

    }


    Offset(o)
    {
        if(typeof(o) == 'number')
        {
            this.offset = new Gamestack.Vector(o,o,o);

        }
        else {

            this.offset = o;

        }

        return this;

    }


    Pos(p)
    {
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
        if(typeof(s) == 'number')
        {
            this.size = new Gamestack.Vector(s, s, s);

        }
        else {

            this.size = s;

        }

        return this;

    }

    Rotation(r)
    {
        this.rotation = r;

        return this;

    }

    onCollide(collideables, callback)
    {


    }

}


Gamestack.Shot = Shot;