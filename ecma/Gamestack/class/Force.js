
 /**
 * GravityForce, calling new GravityForce() is equivalent to calling new Force()
  *
  * Takes an object of arguments and returns GravityForce() Object.
  *@param   {Object} args the object of arguments
 * @param   {string} args.name optional
 * @param   {string} args.description optional
 * @param   {Array} args.subjects the subjects to be pulled by the GravityForce
 * @param   {Array} args.clasticObjects any clastic object that should have collision-stop behavior with args.subjects when collision occurs
 * @param   {Vector} args.max the speed of gravity AKA terminal velocity
 * @param   {number} args.accel the increment to use when accelerating speed of fall
 *
 * @returns {Motion} a Motion object
 */



 (function(){
     console.log('Force class... creating');


     class GravityForce
{
    constructor(args)
    {

        this.name = args.name || "";

        this.description = args.description || "";

        this.subjects = args.subjects || [];

        this.clasticObjects = args.clasticObjects || [];

        this.topClastics = args.topClastics || [];

        this.max = args.max || new Vector3(3, 3, 3);
         this.accel = args.accel || new Vector3(1.3, 1.3, 1.3);


        for(var x in this.clasticObjects)
        {
            if(!this.clasticObjects[x] instanceof Gamestack.Sprite)
            {
                this.clasticObjects[x] = Gamestack.getById(this.clasticObjects[x].id);
            }

        }


        for(var x in this.topClastics)
        {
            if(!this.topClastics[x] instanceof Gamestack.Sprite)
            {
                this.topClastics[x] = Gamestack.getById(this.topClastics[x].id);
            }

        }



        for(var x in this.subjects)
        {
            if(!this.subjects[x] instanceof Gamestack.Sprite)
            {
                this.subjects[x] = Gamestack.getById(this.subjects[x].id);
            }

        }

    }

    getArg(args, key, fallback) {

        if (args.hasOwnProperty(key)) {

            return args[key];

        }
        else {
            return fallback;

        }

    }


    update()
    {

      var  subjects = this.subjects;

       var clasticObjects =  this.clasticObjects;

        var topClastics =  this.topClastics;

      var  accel =  this.accel || {};

        var max =  this.max || {};

        __gameStack.each(subjects, function(ix, itemx){

           itemx.accelY(accel, max);

           itemx.__inAir = true;


            if(itemx.position.y >= itemx.groundMaxY)
            {


                itemx.position.y = itemx.groundMaxY;

            }

            itemx.groundMaxY = 3000000; //some crazy number you'll never reach in-game

            __gameStack.each(clasticObjects, function(iy, itemy){

                itemx.collide_stop(itemy);

            });

            __gameStack.each(topClastics, function(iy, itemy){

                itemx.collide_stop_top(itemy);

            });

        });
    }
};

let Force = GravityForce;

 Gamestack.Force = Force;

 Gamestack.GravityForce = GravityForce;

 })();



