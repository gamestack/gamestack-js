

(function(){
    console.log('CollisionSettings class... creating');

    class CollisionSettings
{
    constructor(top, left, bottom, right)
    {

        this.top = top || false;

        this.bottom = bottom || false;

        this.left = left || false;

        this.right = right || false;

    }

    Fourway()
    {

        this.top = true;

        this.bottom = true;

        this.left = true;

        this.right = true;

        return this;

    }

    Top()
    {
        this.top = true;

        this.bottom = false;

        this.left = false;

        this.right = false;

        this.pixel = false;

        return this;

    }

    Stop(stop)
    {
       this.stop = stop || true;

       return this;

    }

}

Gamestack.CollisionSettings = CollisionSettings;

})();