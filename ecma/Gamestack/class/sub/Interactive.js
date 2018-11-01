


(function(){
    console.log('Interactive class... creating');

    class Interactive extends Gamestack.Sprite {
        constructor(args = {}, arg2, arg3) {
            super(args, arg2, arg3); //init as Gamestack.Sprite()

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



    Interactive.prototype.options = function()
    {
        return {

           collision : {

            dissappear: function () {

            },

               stopfourway: function () {

               }

        }
    }

    };

    Gamestack.Interactive = Interactive;


})();