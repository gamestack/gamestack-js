/**@author
 Jordan Edward Blake
 * */

/**@copyright

 Copyright 2016

 **/

/**
 * Object, instance of GamestackLibrary() : references Gamestack classes
 * attaches to window object || module.exports (when loading via require)
 * */

let Gamestack = {};

let GamestackEngine = function () {

    var lib = {

        game_windows:[],

        all_objects:[],

        DEBUG: false,

        gui_mode: true,

        __gameWindow: {}
        ,

        __sprites: [],

        __animations: [],


        spriteTypes: [],

        systemSpriteTypes: ['player', 'enemy', 'background', 'interactive', 'terrain', 'weapon', 'subsprite'],

        samples: {}
        ,

        log_modes: ['reqs', 'info', 'warning'],

        log_mode: "all",

        recursionCount: 0,

        __gameWindowList: [],


        getObjectById(id){

            for (var x = 0; x < this.all_objects.length; x++) {
                if (this.all_objects[x].id == id) {

                    return this.all_objects[x];

                }


            }

        }
        ,

        interlog: function (message, div) //recursive safe :: won't go crazy with recursive logs
        {
            this.recursionCount++;

            if (!isNaN(div) && this.recursionCount % div == 0) {
                //   console.log('Interval Log:'+  message);

            }

        }
        ,


        create_id: function () {
            var S4 = function () {
                return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
            };
            return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());

        },


        error: function (quit, message) {

            if (quit) {
                throw new Error(message);

            }
            else {
                console.error('E!' + message);

            }

        }
        ,

        info: function (m) {

            if (GameStack.DEBUG) {

                console.info('Info:' + m);

            }
        }
        ,


        log: function (m) {

            if (GameStack.DEBUG) {

                console.log('GameStack:' + m);

            }
        }
        ,

        Extendors:{

            hasInit:function(obj, args, f)
            {


            },

            hasOnComplete:function(obj, args, f)
            {


            },

            hasMultiOnComplete:function(obj, args, f)
            {


            },

            hasOnRun:function(obj, args, f)
            {


            },

            hasMultiOnRun:function(obj, args, f)
            {


            },

            hasOnCollide(obj, args, f)
            {



            },

            hasMultiOnCollide(obj, args, f)
            {



            },

            collideable(obj, args)
            {

                obj.collision_callback = function(){};

                obj.onCollide = args.onCollide || function(collideables, callback)
                {
                    if(typeof(collideables) == 'function')
                    {
                        callback = collideables;

                    }

                    this.collision_callback = callback || function(){};

                };

            },

            spatial(obj)
            {
                obj.Size = function(s){
                    this.size = new Gamestack.Vector(s, s, s);
                    return this;
                };

                obj.Pos = function(p){
                    this.position = new Gamestack.Vector(p, p, p);
                    return this;
                };

                obj.Rot = function(r){
                    this.rotation = new Gamestack.Vector(r, r, r);
                    return this;
                };

                obj.Position = obj.Pos;

                obj.Rotate = obj.Rot;

                obj.Rotation = obj.Rot;

            },

            informable(obj, args)
            {
                obj.name = Gamestack.getArg(args, 'name', "__");

                obj.description = Gamestack.getArg(args, 'description', false);
            },

            tweenable(obj, args)
            {

                obj.curve_string = args.curve_string || "linearNone";

                obj.setTweenCurve=function(c) {

                    c = c || "linear_none";

                var cps = c.split('_');

                var s1 = cps[0].toLowerCase(), s2 = cps[1].toLowerCase();

                var curve = TWEEN.Easing.Linear.None;

                obj.curve_string = 'linear_none'

                $.each(TWEEN.Easing, function (ix, easing) {

                    $.each(TWEEN.Easing[ix], function (iy, easeType) {

                        if (ix == s1 && iy == s2) {

                            // alert('setting curve');

                            curve = TWEEN.Easing[ix][iy];

                            obj.curve_string = ix + '_' + iy;

                        }

                    });


                });

                   obj.curve = curve;

                return curve;

            };

                obj.curvesToArray=function() {

                var c = [];

                GameStack.each(TWEEN.Easing, function (ix, easing) {

                    GameStack.each(easing, function (iy, easeType) {

                        if (['in', 'out', 'inout', 'none'].indexOf(iy.toLowerCase()) >= 0) {

                            c.push(ix + "_" + iy);

                        }

                    });

                });

                return c;

            };

            },

            applyParentalArgs(obj, args)
            {

                if(args.parent instanceof Gamestack.Sprite)
                {
                    alert('parent was Sprite()');

                    obj.parent = args.parent;

                    obj.parent_id = obj.parent.id;

                }
                else
                {
                    obj.parent_id = args.parent_id || args.object_id || "__blank"; //The parent object

                    obj.parent = Gamestack.getObjectById(obj.parent_id);
                }

                return obj.parent;

            }


        },

        ChainSet: {

            informable: function (obj) {

                obj.Info = function (name, description) {

                    this.name = name;

                    this.description = description;

                    return this;
                };

            },

            posable: function (obj) {

                obj.Position = function () {
                    if (typeof(p) == 'number') {
                        this.position = new Gamestack.Vector(p, p, p);

                    }
                    else if (typeof(p) == 'object') {

                        this.position = p;

                    }

                    return this;

                };


            },

            rotable: function (obj) {

                obj.Rotation = function () {
                    if (typeof(p) == 'number') {
                        this.position = new Gamestack.Vector(p, p, p);

                    }
                    else if (typeof(p) == 'object') {

                        this.position = p;

                    }

                    return this;

                };


            }
        },


        //animate() : main animation call, run the once and it will recurse with requestAnimationFrame(this.animate);


        Collision: {

            spriteRectanglesCollide(obj1, obj2, gw)
            {
                gw = gw || Gamestack.game_windows[0];

                var camPos = new Gamestack.Vector(0, 0, 0);

                obj1.padding = obj1.padding || new Gamestack.Vector(0, 0, 0);

                var paddingX = Math.round(obj1.padding.x * obj1.size.x),

                    paddingY = Math.round(obj1.padding.y * obj1.size.y),

                paddingX2 = Math.round(obj2.padding.x * obj2.size.x),

                paddingY2 = Math.round(obj2.padding.y * obj2.size.y),

                    left = obj1.position.x + paddingX + camPos.x,

                    right = obj1.position.x + obj1.size.x - paddingX + camPos.x,

                    top = obj1.position.y + camPos.y + paddingY, bottom = obj1.position.y + obj1.size.y - paddingY+ camPos.y;

                if (right > obj2.position.x + paddingX2 && left < obj2.position.x + obj2.size.x - paddingX2 &&
                    bottom > obj2.position.y + paddingY2 && top < obj2.position.y + obj2.size.y - paddingY2) {

                    return true;

                }

            }
        }
        ,

        _gameWindow: {}
        ,

        setGameWindow: function (gameWindow) {

            this._gameWindow = gameWindow;

        }
        ,


        ExtendEvents: function (extendedObject, extendedKey, extendor, extendorKey) {
            var evtLink = new GSEventLink(extendedObject, extendedKey, extendor, extendorKey);

            this.all_objects.push(new GSEventLink(extendedObject, extendedKey, extendor, extendorKey));

            var parent = extendedObject;

            // console.log(parent);

            if (parent) {
                console.log('Gamestack:EXTENDING EVENTS:' + extendedKey + ":" + extendorKey);

                if (parent.onRun) //Any extendable object has an onRun ... OR
                {
                    parent.onRun(extendor, extendorKey);

                }
                if (parent.onComplete) //object has an onComplete
                {
                    parent.onComplete(extendor, extendorKey);

                }


            }

        },

        removeOffscreenObjects: function (gw) {

            gw = gw || Gamestack.game_windows[0];

            Gamestack.each(Gamestack.all_objects, function (ix, item) {

                if (item instanceof Gamestack.Sprite && item.onScreen() == false && !item.__keepAlive && !item.keepAlive) {

                    gw.remove(item);

                }
            });
        },

        removeDeadObjects: function (gw) {

            gw = gw || Gamestack.game_windows[0];

            Gamestack.each(Gamestack.all_objects, function (ix, item) {

                if (item instanceof Gamestack.Sprite && item.isDead()) {

                   // console.log('removing:' + item.image.domElement.src);
                    gw.remove(item);

                }
            });
        },

        getGameWindow: function () {


            return this._gameWindow;

        }
        ,

        assignAll: function (object, args, keys) {

            __gameStack.each(keys, function (ix, item) {

                object[ix] = args[ix];

            });


        }
        ,


        each: function (list, onResult, onComplete) {
            for (var i in list) {
                onResult(i, list[i]);
            }

            if (typeof(onComplete) === 'function') {
                onComplete(false, list)
            }
            ;

        }
        ,

        ready_callstack: [],

        ready: function (callback) {

            this.ready_callstack.push(callback);

        }

        ,

        reload: function () {
            this.callReady();

        },

        callReady: function () {

            var funx = this.ready_callstack;

            var gameWindow = this._gameWindow, lib = this, objects = this.__gameWindow.objects;

            //call every function in the ready_callstack


            this.each(funx, function (ix, call) {

                call(lib, gameWindow, objects);

            });

            this.InputSystem.init();

            this.__running = true;

        }
        ,

        getArg: function (args, keys, fallback) {

            if (typeof(keys) == 'string') {
                keys = [keys]; //always array
            }
            for (var x = 0; x < keys.length; x++) {
                var k = keys[x];

                if (args && args.hasOwnProperty(k)) {
                    return args[k]; //return first argument match
                }
            }
            return fallback;
        }
        ,

        normalArgs: function (args) {

            var a = {};

            function normal(str) {
                return str.toLowerCase().replace('-', '').replace(' ', '').replace('_', '')
            };

            for (var x in args) {
                a[normal(x)] = args[x];
            }

            return a;
        }
        ,

        isNormalStringMatch: function (str1, str2) {

            return str1.toLowerCase().replace(' ', '') == str2.toLowerCase().replace(' ', '');

        },

        instance_type_pairs: function () {

            //get an array of all instance/type pairs added to the library

            //example : [ {constructor_name:Sprite, type:enemy_basic}, {constructor_name:Animation, type:enemy_attack}  ];

            var objectList = [];

            this.each(this.all_objects, function (ix, item) {

                objectList.push({constructor_name: item.constructor.name, type: item.type});

            });

            return objectList;

        },

        getById: function (id) {

            for (var x in this.all_objects) {
                if (this.all_objects[x].id == id) {
                    return this.all_objects[x];

                }

            }

        },

        select: function (constructor_name, name, type /*ignoring spaces and CAPS/CASE on type match*/) {

            var objects_out = [];

            var __inst = this;

            this.each(this.all_objects, function (ix, item) {

                if (constructor_name == '*' || item.constructor.name == constructor_name) {

                    if (type == '*' || __inst.isNormalStringMatch(type, item.type)) {

                        if (name == '*' || __inst.isNormalStringMatch(name, item.name)) {

                            objects_out.push(item);


                        }

                    }

                }

            });

            return objects_out;
        }
    }

    return lib;

};


let GamestackApi =
    {
        get: function () {


        },

        post: function (object) {
            //TODO decycle the object before saving

            if (!object.id) {
                object.id = Gamestack.create_id();

            }

            var name = object.name, type = object.constructor.name, contents = jstr(object), id = object.id;


        }

    };

class GSO //Gamestack-Overrideable
{
    constructor(args={})
    {

        this.run_ext = args.run_ext || [];

        this.complete_ext = args.complete_ext || [];

    }


    /*****
     * Overridable / Extendable functions
     * -allows stacking of external object-function calls
     ******/

    onRun(caller, callkey) {
        this.run_ext = this.run_ext || [];

        if (this.run_ext.indexOf(caller[callkey]) == -1) {
            this.run_ext.push({caller: caller, callkey: callkey});
        }
    }

    onComplete(caller, callkey) {
        this.complete_ext = this.complete_ext || [];

        if (this.complete_ext.indexOf(caller[callkey]) == -1) {
            this.complete_ext.push({caller: caller, callkey: callkey});
        }
    }

    call_on_run() {
        //call any function extension that is present
        for (var x = 0; x < this.run_ext.length; x++) {
            this.run_ext[x].caller[this.run_ext[x].callkey]();
        }
    }

    call_on_complete() {
        //call any function extension that is present
        for (var x = 0; x < this.complete_ext.length; x++) {
            this.complete_ext[x].caller[this.complete_ext[x].callkey]();
        }
    }

}


/**
 * GameImage
 *
 * Simple GameImage
 * @param   {string} src source name/path of the targeted image-file

 * @returns {GameImage} object of GameImage()

 * */

class GameImage {

    constructor(src, onCreate) {

        // GameStack.log('initializing image');

        if (!src || src instanceof String && !['.jpg', '.png', '.gif'].indexOf(src.toLowerCase()) >= 0) {
            console.info('Requested an UNDEFINED or Non-Image-File for image src');
            return {};
        }

        if (src instanceof Object && src.src) {

            //alert('getting image from image');

            this.image = document.createElement('IMG');

            this.image.src = src.src;

            this.src = src.src;

        }

        else if (typeof(src) == 'string') {

            let ext = src.substring(src.lastIndexOf('.'), src.length);

            this.image = document.createElement('IMG');

            this.image.src = src;

            this.src = this.image.src;

        }

        if (!this.image) {
            this.image = {error: "Image not instantiated, set to object by default"};

            return {};

        }
        else {
            this.image.onerror = function () {
                this.__error = true;
            };

        }

        this.domElement = this.image;

        if (src.data || src.image && src.image.data) {
            console.info('GameImage() : found and applied image.data');
            this.data = src.data;

        }


        var __inst = this;

        this.image.onload = function () {

            if (typeof(this.onCreate) == 'function') {

                this.onCreate(this.image);

            }


        }

    }


    getImage() {
        return this.image;
    }

}


//GameStack: a main / game lib object::
//TODO: fix the following set of mixed references:: only need to refer to (1) lib-object-instance
let GameStack = new GamestackEngine();
Gamestack = GameStack;
let __gameStack = GameStack;
let Quick2d = GameStack; //Exposing 'Quick2d' as synonymous reference to Gamestack
let __gameInstance = Gamestack;

Gamestack.Sound = Sound;
Gamestack.GameImage = GameImage;

if (typeof module !== 'undefined' && module.exports) {

    //This library is being instaniated via require() aka node.js require or similar library loader
    module.exports = Gamestack;

} else {


}

/***************
 * TODO : fix the above duplicate references, which exist now for backward compatibility with previouslyh authored code
 *
 *  -apply find and replace accross the codebase
 *
 * ****************/

/********
 * jstr() : public function for stringified objects and arrays (uses pretty print style)
 * *********/

function jstr(obj) {

    return JSON.stringify(obj);

};

Gamestack.jstr = jstr;

/**********
 * $Q : Selector Function
 *  -allows string selection of library collections, etc...
 * Example Calls
 * **********/


function $Q(selector) {

    //declare events:


    var $GFunx = {};

    $GFunx.each = function (callback) {

        var objects = [];

        for (var x = 0; x < this.length; x++) {
            if (typeof x == 'number') {

                callback(x, this[x]);
            }

        }


    };

    $GFunx.on = function (evt_key, selectorObject, controller_ix, callback) //handle each event such as on('collide') OR on('stick_left_0') << first controller stick_left
    {

        var criterion = $Q.between('[', ']', evt_key);

        if (criterion.indexOf('===') >= 0) {
            criterion = criterion.replace('===', '=');
        }

        if (criterion.indexOf('==') >= 0) {
            criterion = criterion.replace('==', '=').replace('==', 0);
        }

        var cparts = criterion.split('=');

        var __targetType = "*", __targetName = "*";

        if (evt_key.indexOf('[') >= 0) {
            evt_key = $Q.before('[', evt_key).trim();

        }


        var padding = 0;

        //if controller_ix is function, and callback not present, then controller_ix is the callback aka optional argument

        if (controller_ix && typeof controller_ix == 'function' && !callback) {
            callback = controller_ix;
            controller_ix = 0;
        }

        //if controller_ix is function, and callback not present, then selectorObject is the callback aka optional argument

        if (selectorObject && typeof selectorObject == 'function' && !callback) {

            callback = selectorObject;

            selectorObject = $Q('*');

            controller_ix = 0;
        }
        ;

        var evt_profile = {};

        //which controller?

        evt_profile.cix = controller_ix;

        //Need the control key: 'left_stick', 'button_0', etc..

        evt_profile.evt_key = evt_key;

        if ($Q.contains_any(['stick', 'button', 'click', 'key'], evt_profile.evt_key)) {

            var button_mode = evt_profile.evt_key.indexOf('button') >= 0;

            Gamestack.GamepadAdapter.on(evt_profile.evt_key, 0, function (x, y) {

                callback(x, y);

            });

            console.info('detected input event key in:' + evt_profile.evt_key);

            console.info('TODO: rig events');

        }

        //TODO: test collision events:

        else if ($Q.contains_any(['collide', 'collision', 'hit', 'touch'], evt_profile.evt_key)) {

            console.info('Rigging a collision event');

            console.info('detected collision event key in:' + evt_profile.evt_key);

            console.info('TODO: rig collision events');

            this.each(function (ix, item1) {

                console.info('Collision Processing 1:' + item1.name);
                console.info('Collision Processing 1:' + item1.type);

                selectorObject.each(function (iy, item2) {

                    console.info('Collision Processing 2:' + item2.name);
                    console.info('Collision Processing 2:' + item2.type);

                    if (typeof(item1.onUpdate) == 'function') {

                        item1.onUpdate(function (sprite) {

                            if (item1.collidesRectangular(item2)) {

                                callback(item1, item2);

                            }
                            ;

                        });

                    }


                });

            });


        }


        else {
            console.info('Rigging a property event');

            //TODO: test property-watch events:

            console.info('detected property threshhold event key in:' + evt_profile.evt_key);

            console.info('TODO: rig property events');

            var condition = "_", key = criterion || evt_profile.evt_key;

            if (key.indexOf('[') >= 0 || key.indexOf(']') >= 0) {
                key = $Q.between('[', ']', key);

            }

            var evt_parts = [];

            var run = function () {
                console.error('Sprite property check was not set correctly');

            };

            if (key.indexOf('>=') >= 0) {
                condition = ">=";


            }
            else if (key.indexOf('<=') >= 0) {
                condition = "<=";
            }
            else if (key.indexOf('>') >= 0) {
                condition = ">";
            }
            else if (key.indexOf('<') >= 0) {
                condition = "<";
            }

            else if (key.indexOf('=') >= 0) {
                condition = "=";
            }

            evt_parts = key.split(condition);

            for (var x = 0; x < evt_parts.length; x++) {
                evt_parts[x] = evt_parts[x].replace('=', '').replace('=', '').trim(); //remove any trailing equals and trim()

            }

            var mykey, number;

            // alert(evt_parts[0]);

            try {

                mykey = evt_parts[0];

                number = parseFloat(evt_parts[1]);

            }
            catch (e) {
                console.log(e);
            }

            console.info('Gamestack:Processing condition with:' + condition);

            switch (condition) {

                case ">=":


                    run = function (obj, key) {
                        if (obj[key] >= number) {
                            callback();
                        }
                    };

                    break;

                case "<=":

                    run = function (obj, key) {
                        if (obj[key] <= number) {
                            callback();
                        }
                    };

                    break;


                case ">":

                    run = function (obj, key) {
                        if (obj[key] > number) {
                            callback();
                        }
                    };

                    break;

                case "<":

                    run = function (obj, key) {
                        if (obj[key] < number) {
                            callback();
                        }
                    };

                    break;

                case "=":

                    run = function (obj, key) {
                        if (obj[key] == number) {
                            callback();
                        }
                    };

                    break;

            }


            /************
             * Attach update to each member
             *
             * **************/

            var keys = mykey.split('.'), propkey = "";

            this.each(function (ix, item) {

                var object = {};

                if (keys.length == 1) {
                    object = item;

                    propkey = mykey;

                }
                else if (keys.length == 2) {
                    object = item[keys[0]];

                    propkey = keys[1];


                }

                else if (keys.length == 3) {
                    object = item[keys[0]][keys[1]];

                    propkey = keys[2];

                }
                else {
                    console.error(":length of '.' notation out of range. We use max length of 3 or prop.prop.key.");

                }

                if (typeof item.onUpdate == 'function') {


                    var spr = item;

                    item.onUpdate(function (sprite) {

                        run(object, propkey);

                    });

                }

            });

        }

    };

    var object_out = new Object();

    //handle selector / selection of objects:

    if (typeof(selector) !== 'string') {

        if (typeof(selector) !== 'object') {
            selector = {};
        }

        object_out = selector;
    }
    else {


        if (selector && selector !== '*') {

            var s = selector || '';

            console.info('selector:' + s);


            var mainSelector = $Q.before('[', s).trim(), msfChar = mainSelector.substring(0, 1);

            var __targetClassName = "*";

            var output = [];

            var cleanSelectorString = function (str) {
                return str.replace(",", "");
            };

            switch (msfChar.toLowerCase()) {
                case ".":

                    console.info('Selecting by "." or class');

                    __targetClassName = cleanSelectorString($Q.after('.', mainSelector));

                    console.info('Target class is:' + __targetClassName);

                    break;

                case "*":

                    console.info('Selecting by "*" or ANY object in the library instance');

                    __targetClassName = "*";

                    break;

            }

            var criterion = $Q.between('[', ']', s), cparts = criterion.split('=');

            var __targetType = "*", __targetName = "*";

            var getParts = function () {

                if (cparts.length >= 2) {

                    switch (cparts[0].toLowerCase()) {

                        case "name":

                            //get all objects according to name=name

                            console.log('Q():Detected parts in selector:' + jstr(cparts));

                            __targetName = cleanSelectorString(cparts[1]);

                            break;

                        case  "type":

                            console.log('Q():Detected parts in selector:' + jstr(cparts));

                            __targetType = cleanSelectorString(cparts[1]);

                            break;

                    }

                }

                if (cparts.length >= 4) {

                    cparts[2] = cparts[2].replace(",", "");

                    switch (cparts[2].toLowerCase()) {

                        case "name":

                            //get all objects according to name=name

                            console.log('Q():Detected parts in selector:' + jstr(cparts));

                            __targetName = cleanSelectorString(cparts[3]);

                            break;

                        case  "type":

                            console.log('Q():Detected parts in selector:' + jstr(cparts));

                            __targetType = cleanSelectorString(cparts[3]);

                            break;

                    }

                }

            };

            getParts(cparts);

            object_out = GameStack.select(__targetClassName, __targetName, __targetType);

        }
        else if (selector == '*') {
            object_out = GameStack.all_objects;

        }

    }

    for (var x in $GFunx) {

        object_out[x] = $GFunx[x];

    }
    ;

    return object_out;

}


$Q.each = function (obj, callback, complete) {

    for (var x in obj) {
        callback(obj);

    }

    if (typeof(complete) == 'function') {
        complete(obj);

    }

};


$Q.before = function (c1, test_str) {
    var start_pos = 0;
    var end_pos = test_str.indexOf(c1, start_pos);
    return test_str.substring(start_pos, end_pos);
};


$Q.contains = function (c1, test_str) {
    return test_str.indexOf(c1) >= 0;
};

$Q.contains_all = function (cList, test_str) {
    for (var x = 0; x < cList.length; x++) {
        if (test_str.indexOf(cList[x]) < 0) {
            return false;

        }

    }

    return true;

};

$Q.contains_any = function (cList, test_str) {

    for (var x = 0; x < cList.length; x++) {
        if (test_str.indexOf(cList[x]) >= 0) {
            return true;

        }
    }

    return false;

};

$Q.after = function (c1, test_str) {
    var start_pos = test_str.indexOf(c1) + 1;
    var end_pos = test_str.length;
    return test_str.substring(start_pos, end_pos);
};

$Q.between = function (c1, c2, test_str) {
    var start_pos = test_str.indexOf(c1) + 1;
    var end_pos = test_str.indexOf(c2, start_pos);
    return test_str.substring(start_pos, end_pos)
};


$Q.test_selector_method = function () { //leftover method of hand-testing
    var Q_TestStrings = ['*', '.Sprite', '*[type="enemy_type_0"]', '.Sprite[type="enemy_type_0"]'];

    for (var x = 0; x < Q_TestStrings.length; x++) {
        var test = Q_TestStrings[x];

        console.info('testing:' + test);

        $Q(test);
    }

    console.log('Testing stick left');

    this.on('stick_left_0');

    console.log('Testing button');

    this.on('button_0');


    console.log('Testing collide');

    this.on('collide');


    console.log('Testing button');

    this.on('collide');

    console.log('Testing prop');

    this.on('health>=0');


};


Gamestack.$Q = $Q;

Gamestack.query = $Q;

/********************
 * GameStack.InputSystem
 * -Various PC Input Events
 ********************/

Gamestack.InputSystem = {

    //PC input events

    events:{

        mousemove: [],
        leftclick:[],
        rightclick:[],
        middleclick: [],
        wheelup: [],
        wheelDown: []
    },

    keymap:{},

    keyReplace: function (str) {
        return str.toLowerCase().replace('space', ' ').replace('left', String.fromCharCode(37)).replace('left', String.fromCharCode(37)).replace('up', String.fromCharCode(38)).replace('right', String.fromCharCode(39)).replace('down', String.fromCharCode(40));
    },

    extendKey: function (evt_key, callback, onFinish) {

        evt_key = this.keyReplace(evt_key);

        Gamestack.InputSystem.keymap[evt_key] = {

            down: false,

            callback: function () {

                callback(evt_key);

            }

        };

        return Gamestack.InputSystem.keymap[evt_key];

    },

    extend: function (evt_key, downCall, upCall, onFinish) {

        evt_key = evt_key.toLowerCase();

        Gamestack.InputSystem.events[evt_key] = Gamestack.InputSystem.events[evt_key] || [];

        Gamestack.InputSystem.events[evt_key].push( {

            down: downCall,

            up: upCall

        });

        return Gamestack.InputSystem.events[evt_key];

    },


    init: function () {


        window.setInterval(function () {

            Gamestack.each(GameStack.InputSystem.keymap, function (im, kmapItem) {

                if (kmapItem.down == true) {

                    kmapItem.callback();

                }

            });

        }, 10);

        document.onkeydown = document.onkeyup = function (e) {

            e = e || event; // to deal with IE

            var gs_key_string = 'key_' + String.fromCharCode(e.keyCode),

                evt_object = Gamestack.InputSystem['keymap'][gs_key_string] ||  Gamestack.InputSystem['keymap'][gs_key_string.toLowerCase()];

            if (evt_object) {
                evt_object.down = e.type == 'keydown';

            }

        }

        var canvases = document.getElementsByTagName('CANVAS');

        function getMousePos(e, c) {

            var x;
            var y;
            if (e.pageX || e.pageY) {
                x = e.pageX;
                y = e.pageY;
            } else {
                x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            x -= c.offsetLeft;
            y -= c.style.top;
            return {x: x, y: y};
        }


        function fullMoveInputSystem(event, c) {

            var pos = getMousePos(event, c);
            var InputSystem = GameStack.InputSystem;
            for (var x in InputSystem.events) {

                if (InputSystem.events[x] instanceof Array && x == 'mousemove') {

                    GameStack.each(InputSystem.events[x], function (ix, el) {

                        el.down(pos.x, pos.y);
                    });
                }

            }

        }
        ;


        for (var x = 0; x < canvases.length; x++) {

            var c = canvases[x];

            function applyMouseMove(e) {

                fullMoveInputSystem(e, c);

            }

            document.addEventListener("mousemove", applyMouseMove);

            c.onmousedown = function (e) {

                //    alert(JSON.stringify(GameStack.InputSystem, true, 2));

                var value = e.which;
                var pos = getMousePos(e, c);
                var InputSystem = GameStack.InputSystem;


                e.preventDefault();

                switch (e.which) {

                    case 1:

                        for (var x in InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'leftclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {


                                    el.down(pos.x, pos.y);
                                });
                            }


                        }

                        break;
                    case 2:
                        // alert('Middle Mouse button pressed.');


                        for (var x in GameStack.InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'middleclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {

                                    el.down(pos.x, pos.y);
                                });
                            }


                        }
                        break;
                    case 3:
                        //  alert('Right Mouse button pressed.');


                        for (var x in GameStack.InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'rightclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {

                                    el.down(pos.x, pos.y);
                                });

                                return false;
                            }


                        }

                        break;
                    default:

                        return 0;
                    //alert('You have a strange Mouse!');

                }


                e.preventDefault();
                return 0;
            };

            c.onmouseup = function (e) {

                //    alert(JSON.stringify(GameStack.InputSystem, true, 2));

                var value = e.which;
                var pos = getMousePos(e, c);
                var InputSystem = GameStack.InputSystem;


                e.preventDefault();

                switch (e.which) {
                    case 1:

                        for (var x in InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'leftclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {

                                    el.up(pos.x, pos.y);
                                });
                            }


                        }

                        break;
                    case 2:
                        // alert('Middle Mouse button pressed.');


                        for (var x in GameStack.InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'middleclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {

                                    el.up(pos.x, pos.y);
                                });
                            }


                        }
                        break;
                    case 3:
                        //  alert('Right Mouse button pressed.');


                        for (var x in GameStack.InputSystem.events) {


                            if (InputSystem.events[x] instanceof Array && x == 'rightclick') {


                                GameStack.each(InputSystem.events[x], function (ix, el) {

                                    el.up(pos.x, pos.y);
                                });


                                return false;

                            }


                        }

                        break;
                    default:

                        return 0;
                    //alert('You have a strange Mouse!');

                }


            };
        }


    }


};

//Override the existing window.onload function

window.onload = function () {

    __gameStack.callReady();

}


Gamestack.file_system = {

    localizedSource: function (src, hostUrl) {

        hostUrl = hostUrl || "../";

        var gs_folder_ix = src.indexOf('assets/game');

        return hostUrl + src.substring(gs_folder_ix, src.length);

    },

    loadJSON: function (filepath, callback) {

        $.getJSON(filepath, function (data) {

            callback(false, data);

        });
    },

    loadJSONLevel: function (filepathOrJson, gw, callback) {

        if(typeof(gw) == 'function' || !gw)
        {
            callback = gw || callback || function(){  };

            gw = Gamestack.game_windows[0];
        }

        if(typeof(filepathOrJson) == 'object')
        {

            load(filepathOrJson);

            return;

        }
        else
        {

            $.getJSON(filepathOrJson, function (data) {

                load(data);


            });

            return;
        }

        function load(data)
        {

            //localize .src up to three levels of recursion (.src must be altered to refer locally)

            data.objects = data.sprites || data.objects;

            $.each(data.objects, function (ix, xitem) {

                if (typeof(xitem.src) == 'string') {

                    xitem.src = Gamestack.file_system.localizedSource(xitem.src);
                }

                __gameStack.each(xitem, function (iy, yitem) {

                    if (yitem.src) {

                        yitem.src = Gamestack.file_system.localizedSource(yitem.src);

                    }

                    __gameStack.each(yitem, function (iz, zitem) {

                        if (zitem.src) {
                            zitem.src = Gamestack.file_system.localizedSource(zitem.src);

                        }


                    });


                });

                xitem = new Gamestack[xitem.__gsClassTag](xitem);

                gw.add(xitem);
                //sprite.image = sprite.selected_animation.image;

                if (ix >= data.objects.length - 1) {

                    //last sprite is loaded //WHY DOESN't this work?

                    callback(false, data);
                }

            });

            };

    }


};


/*
 * Canvas
 *    draw animations, textures to the screen
 * */

Gamestack.ready(function (lib) {

    Gamestack.log('GameStack:lib :: ready');


});


/**
 * Instantiates a GameWindow object
 * @param   {Object} args : the object of arguments
 * @param   {Object} args.canvas : the canvas object of the window: GameWindow constructor will create one if not supplied in args
 *
 * @param   {Object} args.ctx : the canvas context
 *
 * @param   {Array} args.sprites : the list of sprites, to be applied with GameWindow
 *
 * @param   {Array} args.forces : the list of forces, such as gravity, to be applied with GameWindow
 *

 * @returns {GameWindow} object of GameWindow()
 * */


class GameWindow
{
    constructor({canvas = false, objects, update, camera, noSize}={})
    {
        this.objects = objects || [];

        this.canvas = canvas || false;

        if(!canvas)
        {
            console.info('GameWindow() had no {canvas:canvas} argument. Creating a new canvas in document.body...');
            this.canvas = document.createElement('CANVAS');
            document.body.append(this.canvas);
        }


        if(!noSize) {

            document.body.style.position = "absolute";

            document.body.style.width = "100%";

            document.body.style.height = "100%";

        }

        this.camera = new Gamestack.Camera();

        this.camera.target = false;

        __gameStack.camera = this.camera;

        if (typeof update == 'function') {
            this.onUpdate(update);

        }

        var __inst = this;


        this.update_ext = [];


        if(!noSize) {

            this.adjustSize();

            window.onresize = function () {

                __inst.adjustSize();

            };

        }

        this.ctx = this.canvas.getContext('2d');

        Gamestack.game_windows.push(this);

    }

    uniques(list) {

        var listout = [];

        $Q.each(list, function (ix, item) {

            if (!listout.indexOf(item.id) >= 0) {

                var str = item.name;

                listout.push({"sprite": item});

            }

        });

        return listout;

    }

    setPlayer(player) {
        this.player = player;

        if (!this.objects.indexOf(player) >= 0) {
            this.objects.push(player);

        }

    }

    onUpdate(f)
    {

        this.update_ext.push(f);


    }

    update() {

        GameStack.each(this.objects, function (ix, item) {

            if (item && typeof(item.def_update) == 'function') {

                item.def_update(item);

            }

            if (item && typeof(item.update) == 'function') {
                item.update(item);

            }

        });

        for(var x in this.update_ext)
        {
            this.update_ext[x]();

        }

    }

    draw() {

        var _gw = this;


        if(this.before_draw_ext)
        {
            this.before_draw_ext();
        }

        GameStack.each(this.objects, function (ix, item) {

            if (['Sprite', 'Background', 'Interactive', 'Terrain'].indexOf(item.constructor.name) >= 0 || item.__isDrawable) {

                Gamestack.Canvas.draw(item, _gw.ctx);
            }

        });

        if(this.draw_ext)
        {
            this.draw_ext();
        }


    }

    onDraw(f) {

        this.draw_ext = function(){ f(); };

    }

    onBeforeDraw(f) {

        this.before_draw_ext = function(){ f(); };

    }

    adjustSize(w, h) { //fill to parent size

        w = w || this.canvas.parentNode.clientWidth;

        h = h || this.canvas.parentNode.clientHeight;

        var c = document.getElementById('#gs-container');

        if (c) {
            c.setAttribute('width', w)
        }
        ;

        if (c) {
            c.setAttribute('height', h)
        }
        ;

        __gameStack.WIDTH = w;

        __gameStack.HEIGHT = h;

        this.canvas.width = w;

        this.canvas.height = h;

    }

    add(obj, onBottom) {
    //1: if Sprite(), Add object to the existing __gameWindow

    var __inst = this;

    if (obj instanceof Gamestack.Camera) {

        this.camera = obj;

    }
    else if (obj instanceof Gamestack.GSEvent) {

        if (__gameStack.__running) {

            return console.error('Events can only be added before Gamstack.animate() is called::aka before the main update / loop begins');
        }
        else {

            obj.apply();


        }

    }
    else {

        if(onBottom)
        {
            this.objects.splice(0, 0, obj);
        }
        else {

            this.objects.push(obj);

        }

    }

    this.collect(obj);

    return obj;

}



    remove(obj) {

    //1: if Sprite(), Add object to the existing __gameWindow

    var ix = this.objects.indexOf(obj);

    if (ix >= 0) {
        this.objects.splice(ix, 1);
    }


        var ixG = Gamestack.all_objects.indexOf(obj);

        if (ixG >= 0) {
            Gamestack.all_objects.splice(ixG, 1);
        }



    }

    collect(obj) {

    Gamestack.all_objects.push(obj);

}

    animate(time) {

        var __inst = this;

        requestAnimationFrame(function(){

            __inst.animate();

        });


        if (Gamestack.__stats) {
        Gamestack.__stats.begin();
        Gamestack.__statsMS.begin();
        Gamestack.__statsMB.update();
    }

    __gameStack.isAtPlay = true;

    if (window.TWEEN)
        TWEEN.update(time);

    __inst.update();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.draw();

    if (Gamestack.__stats) {
        Gamestack.__stats.end();
        Gamestack.__statsMS.end();
    }

}

    start() {

    if (typeof(Stats) == 'function') //Stats library exists
    {
        //basic stat animation
        Gamestack.__stats = new Stats();
        Gamestack.__stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom

        Gamestack.__stats.dom.style.left = '30%';

        this.canvas.parentNode.appendChild(Gamestack.__stats.dom);

        //basic stat animation
        Gamestack.__statsMS = new Stats();
        Gamestack.__statsMS.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom

        Gamestack.__statsMS.dom.style.left = '30%';

        Gamestack.__statsMS.dom.style.marginLeft = '90px';

        this.canvas.parentNode.appendChild(Gamestack.__statsMS.dom);

        //basic stat animation
        Gamestack.__statsMB = new Stats();
        Gamestack.__statsMB.showPanel(2); // 0: fps, 1: ms, 2: mb, 3+: custom

        Gamestack.__statsMB.dom.style.left = '30%';

        Gamestack.__statsMB.dom.style.marginLeft = '180px';

        this.canvas.parentNode.appendChild(Gamestack.__statsMB.dom);

    }

    this.animate();
}

}


class FullScreenGameWindow extends GameWindow {

    constructor(args={canvas = false, objects, update, camera}={}) {

        super(args);

        if (!this.canvas) {
            console.info('creating new canvas');
            this.canvas = document.createElement('CANVAS');

            document.body.append(this.canvas);

        }

        this.canvas.style.position = 'absolute';

        this.canvas.style.width = '100%';

        this.canvas.style.height = '100%';

        this.canvas.style.background = 'black';

        var c = this.canvas;

        this.ctx = this.canvas.getContext('2d');

        __gameStack.canvas = this.canvas;

        __gameStack.ctx = this.ctx;

        this.adjustSize();

        __gameStack.__gameWindow = this;
    }

    adjustSize(w, h) {
        w = w || this.canvas.clientWidth;

        h = h || this.canvas.clientHeight;

        var c = document.getElementById('#gs-container');

        if (c) {
            c.setAttribute('width', w)
        }
        ;

        if (c) {
            c.setAttribute('height', h)
        }
        ;

        __gameStack.WIDTH = w;

        __gameStack.HEIGHT = h;

        this.canvas.width = w;

        this.canvas.height = h;

    }
}
;

Gamestack.GameWindow = GameWindow;






