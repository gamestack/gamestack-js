


(function(){
    console.log('Interactive class... creating');

    class Interactive extends Gamestack.Sprite {
        constructor(args = {}) {
            super(args); //init as Gamestack.Sprite()

            this.collision_settings = new Gamestack.CollisionSettings(args);

            this.collideables = args.collideables || [];

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

        onCollide() // Gamestack.Interactive instance should have an onCollide() function
        {

        }

    }


Gamestack.Interactive = Interactive;


})();