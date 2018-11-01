


(function(){
    console.log('Character class... creating');

    class Character extends Gamestack.Sprite
    {
        constructor(args = {}, arg2, arg3) {

            super(args, arg2, arg3); //init as Gamestack.Sprite()

            Gamestack.Extendors.collideable(this, args); //overwrites the onCollide():

        }

    }

    Character.prototype.options = function (){

        return{

            test_options:{

                side_scroll_player:function(){},

                topdown_player:function(){},

                fourway_flight:function(){}

            }

        }

    };


    Gamestack.Character = Character;


})();