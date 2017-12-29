

(function(){
    console.log('CollisionSettings class... creating');

    class CollisionSettings
{
    constructor(args={})
    {
        this.fourway = args.fourway || args.four_way || false;

        this.top = this.four_way || args.top || false;

        this.bottom = this.four_way || args.bottom || false;

        this.left = this.four_way || args.left || false;

        this.right = this.four_way || args.right || false;

        this.pixel = args.pixel || false;

        this.stop = args.stop || false;

        this.padding = args.padding || new Gamestack.Vector(0, 0, 0); // 0-1.0

    }

}

Gamestack.CollisionSettings = CollisionSettings;

})();