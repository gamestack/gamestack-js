

(function(){
    console.log('Camera class... creating');

    /**
     * Gamestack.Camera : has simple x, y, z, position / Vector values
     *
     * @returns {Vector}
     */


    class Camera
{

    constructor(args)
    {

      this.position = new Gamestack.Vector(0, 0, 0);

    }


}

Gamestack.Camera = Camera;

})();
