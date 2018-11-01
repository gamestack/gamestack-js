
class Level
{
    constructor(args={})
    {
        this.sprites = args.sprites || [];

        this.backgrounds = args.backgrounds || [];

        this.terrains = args.terrains || [];

        this.interactives = args.interactives || [];

        this.threes = args.threes || []; //3d objects

    }

    getListName(clName)
{

    return clName[0].toLowerCase() + clName.substring(1, clName.length) + 's';
}

    add(object)
    {

        var myType = object.__classType || 'Sprite';

        this[this.getListName(myType)].push(new Gamestack[myType]().restoreFrom(object));

    }

    add_all_to_game()
    {



    }
}

