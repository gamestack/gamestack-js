


(function(){
    console.log('Terrain class... creating');

class Terrain extends Gamestack.Sprite
{
    constructor(args = {}, arg2, arg3) {
        super(args, arg2, arg3); //init as Gamestack.Sprite()

        this.collision_settings = new Gamestack.CollisionSettings().Fourway().Stop();

        this.collideables = args.collideables || args.colliders || [];

        Gamestack.Extendors.collideable(this, args); //overwrites the onCollide():

    }

    Collideables(c)
    {
        this.collideables = c || [];

        if(!this.collideables instanceof Array)
        {
            return console.error('Must pass array for "c" argument');

        }

        return this;
    }
    onCollide() // Gamestack.Terrain instance should have an onCollide() function
    {

    }

}


    Gamestack.Terrain= Terrain;

})();
