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






;
(function(){
    console.log('Animation class... creating');

    /**
     * Gamestack.Animation: Takes an object of arguments and returns Animation() object.
     * @param   {Object} args object of arguments
     * @param   {string} args.name optional
     * @param   {string} args.description optional
     * @param   {string} args.type optional
     * @param   {Vector} args.size of the Animation object, has x and y properties
     * @param   {Vector} args.frameSize the size of frames in Animation, having x and y properties
     * @param   {VectorFrameBounds} args.frameBounds the bounds of the Animation having min, max, and termPoint properties
     * @param   {number} args.delay optional, the seconds to delay before running animation when started by the start() function

     * @param   {number} args.duration how many milliseconds the animation should take to complete
     *
     * @returns {Animation} an Animation object
     */


    class Animation {

    constructor(args = {}) {

        args = args || {};

        if(typeof args == 'string')
        {

            this.image = new Gamestack.GameImage(args);
            args = {};
        }

        for (var x in this.args) {
            this[x] = args[x];

        }

        this.name = args.name || "__animationName";

        this.description = args.description || "__animationDesc";

        if(!this.image)
        {
            this.image = new Gamestack.GameImage(args.src || args.image);

        }

        var __inst = this, imgDom = this.image.domElement;

        this.frameSize = new Gamestack.Vector(args.frameSize || new Gamestack.Vector(0, 0));

        if(this.image && this.image.domElement) {

            this.image.domElement.onload = function () {
                if (__inst.frameSize.x == 0 && __inst.frameSize.y == 0) {

                    __inst.frameSize = new Gamestack.Vector(imgDom.width, imgDom.height);

                }
            }

        }

        if (args.frameBounds && args.frameBounds.min && args.frameBounds.max) {

            this.frameBounds = new Gamestack.VectorFrameBounds(args.frameBounds.min, args.frameBounds.max, args.frameBounds.termPoint);

        }
        else
        {
            this.frameBounds = new Gamestack.VectorFrameBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0))

        }

        this.frameOffset = new Gamestack.Vector(this.getArg(args, 'frameOffset', new Gamestack.Vector(0, 0, 0)));

        this.flipX = this.getArg(args, 'flipX', false);

        this.cix = 0;

        this.timer = 0;

        this.duration = args.duration || 2000;

        this.seesaw_mode = args.seesaw_mode || false;

        this.reverse_frames = args.reverse_frames || false;

        this.apply2DFrames();

        this.selected_frame = this.frames[0] || {};

        this.run_ext = args.run_ext || [];

        this.complete_ext = args.complete_ext || [];

        Gamestack.ChainSet.informable(this);

    }

    /*****
    * Overridable / Extendable functions
    * -allows stacking of external object-function calls
    ******/

    onRun(call) {

        if (this.run_ext.indexOf(call) == -1) {
            this.run_ext.push(call);
        }
    }

    onComplete(call) {

        if (this.complete_ext.indexOf(call) == -1) {
            this.complete_ext.push(call);
        }
    }

    call_on_run() {
        //call any function extension that is present
        for (var x = 0; x < this.run_ext.length; x++) {
            this.run_ext[x]();
        }
    }

    call_on_complete() {
        //call any function extension that is present
        for (var x = 0; x < this.complete_ext.length; x++) {
            this.complete_ext[x]();
        }
    }

    reverseFrames() {

        this.frames.reverse();

    }

    // class can be instantiated by chainables: Animation().FrameSize(arg).FrameBounds(min, max).Populate();

        Image(img)
        {
            var src;

            if(typeof(img) == 'object' && img.src)
                src = img.src;
            else
                src = img;

            this.image = new Gamestack.GameImage(src);

            return this;
        }

    FrameSize(fs)
    {
        this.frameSize = new Gamestack.Vector(fs);
        return this;
    }

    FrameBounds(min, max, termPoint)
    {
        this.frameBounds = new Gamestack.VectorFrameBounds(min, max, termPoint || max);

        return this;
    }

    Populate()
    {

        this.apply2DFrames();

        return this;

    }

    singleFrame(frameSize) {

        this.frames = [];

        this.__frametype = 'single';

        this.frameSize = frameSize || new Gamestack.Vector(this.image.domElement.width, this.image.domElement.height);

        this.selected_frame = {
            image: this.image,
            frameSize: this.frameSize,
            framePos: {x: 0, y: 0}
        };

        this.frames[0] = this.selected_frame;

        return this;

    }

    getArg(args, key, fallback) {

        if (args.hasOwnProperty(key)) {

            return args[key];

        }
        else {
            return fallback;

        }
    }

    apply2DFrames() {

        this.frames = [];

        var fcount = 0;

        var quitLoop = false;

        for (let y = this.frameBounds.min.y; y <= this.frameBounds.max.y; y++) {

            for (let x = this.frameBounds.min.x; x <= this.frameBounds.max.x; x++) {

                let framePos = {
                    x: x * this.frameSize.x + this.frameOffset.x,
                    y: y * this.frameSize.y + this.frameOffset.y
                };

                this.frames.push({image: this.image, frameSize: this.frameSize, framePos: new Gamestack.Vector(framePos)});

                if (x >= this.frameBounds.termPoint.x && y >= this.frameBounds.termPoint.y) {

                    quitLoop = true;

                    break;
                }

                fcount += 1;

                if (quitLoop)
                    break;

            }

        }

        this.frames[0] = !this.frames[0] ? {
            image: this.image,
            frameSize: this.frameSize,
            framePos: {x: this.frameBounds.min.x, y: this.frameBounds.min.y}
        } : this.frames[0];


        if (this.seesaw_mode) {
            console.log('ANIMATION: applying seesaw');

            var frames_reversed = this.frames.slice().reverse();

            this.frames.pop();

            this.frames = this.frames.concat(frames_reversed);

        }
        if (this.reverse_frames) {
            this.reverseFrames();
        }

        // this.selected_frame = this.frames[this.cix % this.frames.length] || this.frames[0];

    }

    update() {

        this.selected_frame = this.frames[Math.round(this.cix) % this.frames.length];

    }

    reset() {

        this.apply2DFrames();

        this.cix = 0;

    }

    continuous() {

        if (this.__frametype == 'single') {
            return 0;

        }

       // this.apply2DFrames();

        //update once:
        this.update();

        if (this.cix == 0) {

            this.engage();

        }


    }

    engage(duration, complete) {

        this.call_on_run();

        duration = duration || this.duration || this.frames.length * 20;

        if (this.__frametype == 'single') {
            return 0;

        }

        let __inst = this;


        //we have a target
        this.tween = new TWEEN.Tween(this)
            .easing(__inst.curve || TWEEN.Easing.Linear.None)

            .to({cix: __inst.frames.length - 1}, duration)
            .onUpdate(function () {
                //console.log(objects[0].position.x,objects[0].position.y);

                //   __inst.cix = Math.ceil(__inst.cix);

                __inst.update();

            })
            .onComplete(function () {
                //console.log(objects[0].position.x, objects[0].position.y);

                __inst.cix = 0;


                __inst.call_on_complete();


                __inst.isComplete = true;

            });

        this.tween.start();

    }

    animate() {

       // this.apply2DFrames();

        this.timer += 1;

        if (this.delay == 0 || this.timer % this.delay == 0) {

            if (this.cix >= this.frames.length - 1) {
                this.call_on_complete();

            }

            this.cix = this.cix >= this.frames.length - 1 ? this.frameBounds.min.x : this.cix + 1;

            this.update();

        }

    }

}
;

        Gamestack.Animation = Animation;

})();
;

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
;

/**
 * instantiates Gamestack.js Canvas (CanvasLib) controller

 @description
 This Canvas library handles the low-level drawing of Sprite() objects on HTML5Canvas.
 -draws Sprites(), handling their rotation, size, and other parameters.
 * @returns {CanvasLib} a CanvasLib object
 */

(function(){
    console.log('CanvasStack class... creating');

class CanvasStack {

    constructor() {

        return {

            __levelMaker: false,

            __OFFSCREEN:false,

            allowOffscreen:function(duration)
            {

                this.__OFFSCREEN = true;

                var __inst = this;

                if(duration) {

                    window.setTimeout(function () {

                        __inst.__OFFSCREEN = false;

                    }, duration || 10000); //in 10 seconds set __OFFSCREEN to false

                }

            },

            draw: function (sprite, ctx, camera) {

                camera = camera || Gamestack.game_windows[0].camera || {position:new Gamestack.Vector(0, 0, 0)};

                if (sprite.active && sprite.onScreen(__gameStack.WIDTH, __gameStack.HEIGHT)) {


                    this.drawPortion(sprite, ctx, camera);

                }

            },
            drawFrameWithRotation: function (img, fx, fy, fw, fh, x, y, width, height, deg, canvasContextObj, flipX, flipY) {

                canvasContextObj.save();
                deg = Math.round(deg);
                deg = deg % 360;
                var rad = deg * Math.PI / 180;
                //Set the origin to the center of the image
                canvasContextObj.translate(x, y);
                canvasContextObj.rotate(rad);
                //Rotate the canvas around the origin

                canvasContextObj.translate(0, canvasContextObj.width);

                if (flipX) {

                    canvasContextObj.scale(-1, 1);
                } else {

                }

                if (flipY) {

                    canvasContextObj.scale(1, -1);
                } else {

                }

                //draw the image
                canvasContextObj.drawImage(img, fx, fy, fw, fh, width / 2 * (-1), height / 2 * (-1), width, height);
                //reset the canvas

                canvasContextObj.restore();
            },



            drawData:function(x, y, w, h, data, ctx){

                ctx.putImageData(data, x, y, 0, 0, w, h);

            },


            /*
             * drawPortion:
             *
             *   expects: (sprite{selected_animation{selected_frame{frameSize, framePos } offset?, gameSize? }  })
             *
             *
             * */

            drawPortion: function (sprite, ctx, camera) {

                var frame;

                if (sprite.active) {

                    if (sprite.selected_animation instanceof Object && sprite.selected_animation.hasOwnProperty('selected_frame')) {

                        frame = sprite.selected_animation.selected_frame;

                    }
                    else {

                       // console.error('Sprite is missing arguments');
                        //delay the draw

                        return;

                    }

                    var p = sprite.position;

                    var camera_pos = camera.position || {x: 0, y: 0, z: 0};

                    if(!sprite.hasOwnProperty('scrollFactor'))
                    {
                        sprite.scrollFactor = 1.0;
                    }

                    var x = p.x, y = p.y, scrollFactor = sprite.scrollFactor >= 0 && sprite.scrollFactor <= 1.0 ? sprite.scrollFactor : 1.0;

                    if(sprite.noScroll)
                    {
                        scrollFactor = 0;
                    }


                    x -= camera_pos.x * scrollFactor || 0;
                    y -= camera_pos.y * scrollFactor || 0;
                    //optional animation : gameSize

                    var targetSize = sprite.size || sprite.selected_animation.size;

                    var realWidth = targetSize.x;
                    var realHeight = targetSize.y;

                    //optional animation : offset

                    if (sprite.selected_animation && sprite.selected_animation.hasOwnProperty('offset')) {
                        x += sprite.selected_animation.offset.x;

                        y += sprite.selected_animation.offset.y;

                    }

                    var rotation;

                    if (typeof(sprite.rotation) == 'object') {

                        rotation = sprite.rotation.x;


                    }
                    else {
                        rotation = sprite.rotation;

                    }

                    var frame = sprite.selected_animation.selected_frame;

                    if (frame && frame.image && frame.image.data) {

                        ctx.putImageData(frame.image.data, x, y, 0, 0, sprite.size.x, sprite.size.y);

                    }
                    else {

                        if(sprite.selected_animation.image.domElement instanceof HTMLImageElement) {

                            this.drawFrameWithRotation(sprite.selected_animation.image.domElement, frame.framePos.x, frame.framePos.y, frame.frameSize.x, frame.frameSize.y, Math.round(x + (realWidth / 2)), Math.round(y + (realHeight / 2)), realWidth, realHeight, rotation % 360, ctx, sprite.flipX,  sprite.flipY);

                        }

                    }

                }

            }

        }

    }

}

    Gamestack.Canvas = new CanvasStack();

    Gamestack.CanvasStack = CanvasStack;
})();




;

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

})();;
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



;

/**
 * ControllerEventKeys()
 *
 * <ul >
 *  <li> an object representation of the controller
 *  <li> all keys are set to false
 * </ul>
 * @returns {ControllerEventKeys} object of ControllerEventKeys()
 * */


class ControllerEventKeys
{
    constructor()
    {
        return {

            left_stick:false,

            right_stick:false,

            0:false,

            1:false,

            2:false,

            3:false,

            4:false,

            5:false,

            6:false,

            7:false,

            8:false,

            9:false,

            10:false,

            11:false,

            12:false,

            13:false,

            14:false,

            15:false,

            16:false,

            17:false,

            18:false,

            19:false

        }

    }

}

Gamestack.ControllerEventKeys = ControllerEventKeys;


/**
 * GamepadAdapter()
 *
 * <ul >
 *  <li> supports game-controller input for web-games
 *  <li> accesses live gamepad input from the HTML5 Gamepad Api
 * </ul>
 *
 * [See Live Demos with Suggested Usage-Examples]{@link http://www.google.com}
 * @returns {GamepadAdapter} object of GamepadAdapter()
 * */


GameStack.gamepads = GameStack.gamepads || __gameInstance.gamepads;

class GamepadAdapter {

    constructor() {

        this.__gamepads = [];

        this.intervals = [];

        let controller_stack = this;

        let __gamepadMaster = this;

        this.events = [];


        function getGamepads()
        {

            if(__gamepadMaster.mainLoop)
            {
                window.clearInterval(__gamepadMaster.mainLoop);
            }

            __gamepadMaster.mainLoop = window.setInterval(function () {

                var gps = navigator.getGamepads();

                __gamepadMaster.gps = gps;

                for(var x = 0; x < gps.length; x++) {

                    var events = __gamepadMaster.__gamepads[x] ? __gamepadMaster.__gamepads[x] : {};

                    __gamepadMaster.process(__gamepadMaster.gps[x], events);

                }

            }, 20);

        };


        window.addEventListener("gamepadconnected", function(e) {
            console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.",
                e.gamepad.index, e.gamepad.id,
                e.gamepad.buttons.length, e.gamepad.axes.length);

           getGamepads();
        });



        //always call on instance created

        getGamepads();

    }

    gamepads()
    {

        return  navigator.getGamepads();

    }


    disconnect_all() {

        for (var x = 0; x < this.intervals.length; x++) {

            window.clearInterval(this.intervals[x]);

        }

    }


    disconnect_by_index(game_pad_index) {

        window.clearInterval(this.intervals[game_pad_index]);

    }

    hasAnyPad() {
        return "getGamepads" in navigator;

    }

    Event(key, game_pad, callback) {
        return {

            key: key, game_pad:game_pad, callback: callback


        }

    }


    GamepadEvents(args)
    {

        var gp = {};

        gp.stick_left = args.stick_left || function(x, y)
            {

                //  console.log('Def call');

            }


        gp.stick_right = args.stick_right ||  function(x, y)
            {

            }

        gp.buttons = [];

        gp.extendFunc = function(f1, f2)
        {

            var fc = f2;

            return function(x, y){

                f2(x, y);

                f1(x, y);

            }

        };

        gp.on = function(key, callback)
        {

            if(this[key] && key !== "on")
            {

                var current_cb =  typeof(this[key]) == 'function' ? this[key] : function(x, y){};

                this[key] = this.extendFunc(callback, current_cb);


            }

            else if(key.indexOf('button') >= 0 && key.indexOf('_') >= 0 )
            {
                var parts = key.split('_');

                var number;

                try
                {

                    number = parseInt(parts[1]);


                    var current_cb =  typeof(this['buttons'][number]) == 'function' ? this['buttons'][number] : function(x, y){};

                    this['buttons'][number] = this.extendFunc(callback, current_cb);

                }
                catch (e)
                {
                    console.error('could not parse "on" event with ' + key);

                }

            }


        }

        gp.constructor = {name:"GamepadEvents"};

        this.__gamepads.push(gp);

        Gamestack.gamepads = this.__gamepads;

        return gp;

    }

    getGamepads()
    {
        return Gamestack.gamepads;

    }

    process(gp, gpEvents)
    {

        this.process_buttons(gp, gpEvents);

        this.process_axes(gp, gpEvents);

    }

    process_axes(gp, events)
    {

        if(!gp || !gp['axes'])
        {

            return false;

        }



        for (var i = 0; i < gp.axes.length; i += 2) {

            var axis1 = gp.axes[i], axia2 = gp.axes[i + 1];

            var ix = (Math.ceil(i / 2) + 1), x = gp.axes[i], y = gp.axes[i + 1];

            if(ix == 1 && events.stick_left)
            {
                events.stick_left(x, y);

            }

            if(ix == 2 && events.stick_right)
            {
                events.stick_right(x, y);

            }

            if (this.events && this.events['stick_' + i] && typeof(this.events['stick_' + i].callback) == 'function') {
                this.events['stick_' + i].callback();

            }
        }

    }


    process_buttons(gp, events) {

        if(!gp || !gp['buttons'])
        {
            return false;

        }

        for (var i = 0; i < gp.buttons.length; i++) {

            if(!events.buttons)
                break;

            else if (events.buttons.length > i && typeof(events.buttons[i]) == 'function') {
                events.buttons[i](gp.buttons[i].pressed);
            }
            else if (events.buttons.length > i && typeof( events.buttons[i]) == 'object' && typeof(events.buttons[i].update) == 'function') {
                events.buttons[i].update(events.buttons[i].pressed);

            }
            var clearance_1 = this.events && this.events[i], gpc, bkey = "button_" + i;

            if (clearance_1) {
                gpc = this.events[bkey] && !isNaN(this.events[bkey].game_pad) ? this.gamepads[this.events[bkey].game_pad] : this.events[bkey].game_pad;
            }
            ;

            if (clearance_1 && gpc && typeof(this.events[bkey].callback) == 'function') {
                //call the callback
                this.events[i].callback();

            }

        }


    }


    on(key, gpix, callback) {

        if(gpix >= this.__gamepads.length)
        {

            this.__gamepads.push(this.GamepadEvents({}));

        }

        this.__gamepads[gpix].on(key, callback);

    }


}

/**
 * ControllerSetting()
 * takes arguments of button(string) || stick(string), plus event(function),
 *
 * @returns {ControllerSetting
 * }
 */


/**********
 * NOTE: here we bind the instance, and NOT the instantiator.
 *
 * *********/

if(!__gameInstance.GamepadAdapter)
{
    Gamestack.GamepadAdapter = new GamepadAdapter();

    // __gameInstance.gamepads.push(gamepad);

}
;function makeArray(obj) {

    if (obj instanceof Array) {

    }
    else {
        obj = [obj];
    }
    return obj;
};




(function(){
    console.log('GSEvent class... creating');


class GSEvent {

    constructor(args = {}) {

        this.name = args.name || "blankEvent";

        this.objects = args.objects || args.object || args.obj || [];

        this.siblings = args.siblings || args.sibling || args.sibs || args.sib || [];

    }
}


function GSEventLink(extendedObject, extendedKey, extendor, extendorKey) {
    this.parent_id = extendedObject.id,

        this.child_id = extendor.id,

        this.parent_key = extendedKey,

        this.child_key = extendorKey;
};


class InputEvent extends GSEvent {
    constructor(args) {
        super(args);

        //Run the Q() function

        var btnix = args.btnix || args.button_ix || false,

            gpix = args.gpix || args.gamepad_ix || 0,

            callback = args.callback || function () {



                };

        var six = args.stickix || args.six || args.stick_ix || false;

        var inputKey = six !== false ? 'stick_' + six : btnix !== false ? 'button_' + btnix : false;

        //Keys:

        var keyboardKeys = args.keys || false;

        if (keyboardKeys instanceof Array) {

            keyboardKeys = makeArray(keyboardKeys);

            Gamestack.each(keyboardKeys, function (ix, keyitem) {

                Gamestack.InputSystem.extendKey('key_' + keyitem.toLowerCase(), function () {

                    callback(keyitem.toLowerCase());

                });

            });

        }

        if (inputKey && gpix >= 0) {

            Gamestack.GamepadAdapter.on(inputKey, gpix, function (x, y) {

                callback(x, y);

            });


        }

    }

}
;


class CollisionEvent extends GSEvent {
    constructor(args = {}, arg2, arg3) {
        super(args);

        //TODO:error if Gamestack is animating :: only before animate

        var callback = function(){};

        if(args && arg2 && arg3)
        {
            this.objects = makeArray(args);

            this.siblings = makeArray(arg2);

            callback = arg3;

        }
        else {

            callback = args.callback || function () {
                };

        }

        $Q(this.objects).on('collide', $Q(this.siblings), function (obj1, obj2) {

            callback(obj1, obj2);

        });

    }
}
;


class BoolEvent extends GSEvent {
    constructor(args) {
        super(args);

        this.on = args.on || function () {
                console.info('CustomBoolEvent():needs .on function(){} returning bool argument');
            }
        /*Defaults to false to avoid broken code*/

        this.callback = args.callback || function () {
                console.info('CustomBoolEvent():needs .callback function(){} argument');
            };

        var __inst = this;

      console.info('CustomBoolEvent():: this class is due for completion soon, still in development.');

    }


}
;


    Gamestack.GSEvent= GSEvent;

    Gamestack.GSEventLink= GSEventLink;

    Gamestack.InputEvent= InputEvent;

    Gamestack.CollisionEvent= CollisionEvent;

    Gamestack.BoolEvent= BoolEvent;

})();;/*
 * Gamestack.GSProton: -An implementation of the Proton.js particle engine.
 * :instantiable
 * :data-persistent / json format
 * :reloadable
 * :__presets : various GSProton objects for in-game-use
 *
 * */

(function(){
    console.log('CanvasStack class... creating');


    /**
     * Gamestack.GSProton: Takes arguments of image, canvas, parent, collideables?

     * @param   {image} the img
     * @param   {canvas} canvas to draw on
     * @param   {parent} the parent, either a position{x,y,z} or object with a 'position' property having x,y,z
     * @returns {GSProton} a GSProton object
     */

class GSProton {

    constructor(image, canvas, parent, collideables) {

        var args = {image:image, canvas:canvas, parent:parent, collideables:collideables};

        if(image.image && image.canvas) //image is a GS Proton passed back through constructor as first argument --enable data persistence
        {

            args = image;

        }

        args.canvas = args.canvas || Gamestack.canvas;

        args.parent = args.parent || new Gamestack.Vector(0, 0, 0);

        args.image = args.image || new Gamestack.GameImage;

        this.parent = args.parent;

        this.name = args.name || "__NO-Name";

        this.description = args.description || "__NO-Description";

        this.image = args.image;

        this.active = false;

        this.image =args.image;

        this.canvas = args.canvas;

        this.emission_amount_min = 1;

        this.emission_amount_max = 1;

        this.radius = 0;


        this.mass = 1;

        this.emissions_frequency = 5;

        this.gravity = 0;

        this.proton = {};

        this.usingAttraction = false;

        this.usingRepulsion = false;

        this.usingPointZone = false;

        this.pointZoneX = 0;

        this.pointZoneY = 0;

        this.usingBlendAlpha = false;

        this.attraction = {

          position:new Vector(0, 0),

            min:0,

            max:0

        };

        this.repulsion = {

            position:new Gamestack.Vector(0, 0),

            min:0,

            max:0

        };

        this.startAlpha = 1.0;

        this.endAlpha = 1.0;

        this.startColor_asRandom = true;

        this.startColor = "#FFFFFF";

        this.startScale = 1.0;

        this.endScale = 1.0;

        this.endColor_asRandom = true;

        this.endColor = "#FFFFFF";

        this.positionX_asRandom = false;

        this.positionY_asRandom = false;

        this.positionX = 0;

        this.positionY = 0;

        this.vSpeedMin = 0.5;

        this.vSpeedMax = 1.5;

        this.vSpeedRotationMin = 0;

        this.vSpeedRotationMax = 360;

        this.lifeMin = 5;

        this.lifeMax = 10;

        for(var x in args)
        {
            if(this.hasOwnProperty(x))
            {

                this[x] = args[x];

            }

        }

        //the following instantiate to empty []

        this.initializers = [];

        this.behaviors = [];

    }

    replaceBehaviorByType(constructor, replacement) {

        for (var x in this.behaviors) //remove any existing object by type
        {
            if (this.behaviors[x] instanceof constructor) {

                this.behaviors.splice(x, 1);

            }
        }

        this.behaviors.push(replacement);

        this.ticker = 0;

    }

    Collideables(collideableArray) {
        this.collideables = collideableArray;
    }

    Rotation(minRot, maxRot) {

        maxRot = maxRot || minRot; //they are either positive-number or the same
        this.vSpeedRotationMin = minRot;

        this.vSpeedRotationMax = maxRot;

        this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));

    }

    Gravity(grav) {

        this.gravity = grav;

        this.replaceBehaviorByType(Proton.Gravity, new Proton.Gravity(this.gravity));

    }

    Velocity(minV, maxV) {

        maxV = maxV || minV; //they are either positive-number or the same
        this.vSpeedMin = minV;

        this.vSpeedMax = maxV;

        this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));

    }

    Attraction(position, min, max)
    {
        this.usingAttraction = true;

       this.attraction.position = position;

       this.attraction.min = min;

       this.attraction.max = max;
    }

    Repulsion(x, y, min, max)
    {
        this.usingRepulsion = true;

        this.repulsion.position = position;

        this.repulsion.min = min;

        this.repulsion.max = max;
    }

    onUpdate() {

    }

    isRectangularCollision(obj1, obj2) {

        return obj1.position.x + obj1.size.x > obj2.position.x &&
            obj1.position.y + obj1.size.y > obj2.position.y &&
            obj1.position.x < obj2.position.x + obj2.size.x &&
            obj1.position.y < obj2.position.y + obj2.size.y;

    }

    collide(obj1, obj2) {
        console.log('collide() function UNSET');

    }

    Pos(p)
    {
        if(typeof p == 'object')
        {
            this.emitter.p.x = p.x;

            this.emitter.p.y = p.y;

        }

        else if (typeof p == 'number')
        {

            this.emitter.p.x = p;

            this.emitter.p.y = p;
        }

    }

    update(collideables) {

        collideables = collideables || this.collideables || [];

        this.ticker += 1;

        if (this.ticker % 100 == 0) {

            console.log('Proton:update():');
            console.log(this.emitter);

        }

        if (this.positionX_asRandom) {
            this.emitter.p.x = Math.floor(Math.random() * canvas.width);
        }
        else {
            this.emitter.p.x = this.positionX;

        }


        if (this.positionY_asRandom) {
            this.emitter.p.y = Math.floor(Math.random() * canvas.width);
        }
        else {
            this.emitter.p.y = this.positionY;

        }

        var particles = this.emitter.particles;


        for (var x = 0; x < particles.length; x++) {
            var p = {

                size: {
                    x: Math.round(this.emitter.initializes[0].w * this.emitter.scale),

                    y: Math.round(this.emitter.initializes[0].h * this.emitter.scale)

                },

                position: particles[x].p

            };
            for (var y = 0; y < collideables.length; y++) {

                if (collideables[y].hasOwnProperty('position') && collideables[y].hasOwnProperty('size') && this.isRectangularCollision(p, collideables[y])) {

                    this.collide(p, collideables[y])

                }

            }


        }

    }

    init() {

        this.proton = new Gamestack.Proton();

        this.emit_mode = this.emit_mode || "";

        this.emitter = new Proton.Emitter();

        this.emission_amount = this.emission_amount || 10;

        this.emissions_frequency = this.emissions_frequency || 10;

        var rps = 5 / this.emissions_frequency;

        this.emitter.rate = new Proton.Rate([this.emission_amount_min, this.emission_amount_max], rps);

        function allNumbers(list)
        {
            for(var x in list)
            {
                if(typeof(list[x]) == 'number')
                {


                }
                else
                {
                    return false
                }

            }

            return true;

        };

        this.initializers = [];

        this.behaviors = [];

        this.initializers.push(new Proton.ImageTarget(this.image));
        this.initializers.push(new Proton.Mass(this.mass));
        this.initializers.push(new Proton.Life(this.lifeMin, this.lifeMax));

        this.initializers.push(new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));




        if(this.usingPointZone)
        {

            this.initializers.push(new Proton.Position(new Proton.PointZone(this.pointZoneX, this.pointZoneY)));

        }



        this.behaviors.push(new Proton.Gravity(this.gravity));

        this.behaviors.push(new Proton.Alpha(1, [this.startAlpha, this.endAlpha]));

        this.behaviors.push(new Proton.Color(this.startColor_asRandom ? 'random' : this.startColor, this.endColor_asRandom ? 'random' : this.endColor, Infinity, Proton.easeInSine));

        this.behaviors.push(new Proton.Scale(this.startScale, this.endScale));

        if(allNumbers([this.attractionX, this.attractionY, this.attractionMin, this.attractionMax]))
        {
            console.info('Creating attraction');

            this.behaviors.push(new Proton.Attraction({x:this.attractionX,y:this.attractionY}, this.attractionMin, this.attractionMax));

        }

        if(allNumbers([this.repulsionX, this.repulsionY, this.repulsionMin, this.repulsionMax]))
        {
            console.info('Creating repulsion');

            this.behaviors.push(new Proton.Repulsion({x:this.repulsionX,y:this.repulsionY}, this.repulsionMin, this.repulsionMax));

        }

        if(this.usingAttraction)
        {
           this.behaviors.push(new Proton.Attraction(this.attraction.position, this.attraction.min, this.attraction.max));

        }

        if(this.usingRepulsion)
        {
            this.behaviors.push(new Proton.Repulsion(this.repulsion.position, this.repulsion.min, this.repulsion.max));

        }

        if(this.radius > 0)
        {
            this.initializers.push(new Proton.Radius(this.radius));


        }


        var i = this.initializers;

        for (var x in i) {
            this.emitter.addInitialize(i[x]);
        }

        var b = this.behaviors;

        for (var x in b) {
            this.emitter.addBehaviour(b[x]);
        }

        this.emitter.p = this.parent && this.parent.hasOwnProperty('x') ? new Vector(this.parent) : this.emitter.p;

        this.emitter.p = this.parent && this.parent.hasOwnProperty('position')&& this.parent.position.hasOwnProperty('x') ? new Vector(this.parent.position) : this.emitter.p;

        this.emitter.p.x += this.positionX;
        this.emitter.p.y += this.positionY;

            this.emitter.emit();

        this.proton.addEmitter(this.emitter);

        this.renderer = new Proton.Renderer('canvas', this.proton, this.canvas);

        if(this.usingBlendAlpha)
        {
            this.renderer.blendFunc("SRC_ALPHA", "ONE");

        }

        var __inst = this;

        this.renderer.start();

        this.tick();
    }

    on()
    {
        this.isOn = true;

        this.init();
    }

    off()
    {

        this.isOn = false;

        if(this.renderer) {

            console.info('Stopping one GSProton object');

            this.renderer.stop();


        }

    }

    tick() {


        var __inst = this;


        requestAnimationFrame(function () {
            __inst.tick()
        });

        if(this.isOn) {

            this.proton.update();

        }
       // this.update();
    }


}


var ProtonPresets = {

    //particleDemoName:new GSProton();   //add particleDemoObjects


};

Gamestack.GSProton = GSProton;

})();
;
var head = document.head || document.getElementsByTagName('head')[0];

head.innerHTML += '<style>'+
    '\r\n' +
    '.speech-triangle { overflow:visible; }' +
    '.speech-triangle:before { content: "";' +
'position: absolute;' +
        'z-index:-1;'+
'width: 0;' +
'height: 0;' +
'left: 38px;' +
    'bottom: -18px;' +
'border-width: 8px 8px;' +
'border-style: solid;' +
'border-color: #fff transparent transparent #fff;' +
    ' } .farLeft:after{ right:0px; left:20px; } .farRight:after{ left:0px; right:20px; }   .flipX:after{  -moz-transform: scaleX(-1); -webkit-transform: scaleX(-1); -o-transform: scaleX(-1); transform: scaleX(-1); -ms-filter: fliph; /*IE*/ filter: fliph; /*IE*/  } ' +
   ' </style>';



(function(){
    console.log('HtmlExtra classes... creating');


class HtmlExtra //to do apply a super object 'Extra'
{
    constructor(args = {}) {
        this.applyCSSArgs(args);
    }

    applyCSSArgs(args) {

        var norms = Gamestack.normalArgs(args);

        this.widthFloat = Gamestack.getArg(norms, ['width', 'widthfloat', 'w'], 0.5);

        this.heightFloat = Gamestack.getArg(norms, ['height', 'heightfloat', 'h'], 0.5);

        this.topFloat = Gamestack.getArg(norms, ['top', 'topfloat', 't'], 0.5);

        this.bottomFloat = Gamestack.getArg(norms, ['bottom', 'bottomfloat', 'b'], false);

        this.color = norms.color || '#ffffff';

        this.backgroundColor = Gamestack.getArg(norms, ['backgroundcolor', 'backcolor', 'background', 'bc'], 'black');

        this.text = norms.text || "__BLANK";

        this.fontFamily = norms.font || norms.fontFamily || "appFont";

        this.border = "2px inset " + this.color;

        this.fontSize = norms.fontsize || "20px";

        if(this.bottomFloat >= 0)
        {

            this.targetBottom = this.get_float_pixels(this.bottomFloat, document.body.clientHeight);

        }
        else
        {

            this.targetTop = this.get_float_pixels(this.topFloat, document.body.clientHeight);



        }

        this.fadeTime = {

            in:200,

            out:200
        };

    }

    Top(v)
    {

      this.targetTop =  this.get_float_pixels(v, document.body.clientHeight);

        this.domElement.style.bottom = 'auto';
      this.domElement.style.top = this.targetTop;

      return this;

    }

    Left(v)
    {

        this.targetLeft =  this.get_float_pixels(v, document.body.clientWidth);

        this.domElement.style.right = 'auto';
        this.domElement.style.left = this.targetLeft;

        return this;
    }

    Bottom(v)
    {


        this.targetBottom =  this.get_float_pixels(v, document.body.clientHeight);

        this.domElement.style.top = 'auto';
        this.domElement.style.bottom = this.targetBottom;

        return this;

    }

    Right(v)
    {

        this.targetRight =  this.get_float_pixels(v, document.body.clientWidth);

        this.domElement.style.left= 'auto';
        this.domElement.style.right = this.targetRight;

        return this;
    }

    FontSize(v)
    {

        this.domElement.style.fontSize= v;

        return this;
    }

    FontFamily(v)
    {

        this.domElement.style.fontFamily= v;

        return this;
    }


    FontSize(v)
    {

        this.domElement.style.fontSize= v;

        return this;
    }

    Text(v)
    {
        this.domElement.innerText = v;

        return this;
    }

    Background(v)
    {
        this.domElement.style.background = v;

        return this;

    }

    Duration(d){

        this.duration = d;

        return this;
    }

    FadeTime(fadeInTime, fadeOutTime)
    {

        this.fadeTime = {

            in:fadeInTime || 250,

            out:fadeOutTime || 250

        }

        return this;
    }

    Color(c)
    {
        this.domElement.style.color= c;

        return this;
    }

    Border(b)
    {
        this.domElement.style.border = b;

    }

    get_float_pixels(float, dimen) {
        return Math.round(dimen * float) + 'px';
    }

    onComplete(fun) {

        this.complete = fun;

        return this;
    }

    show(text, duration) {
        //create an html element

        document.body.append(this.domElement);

        var __inst = this;

        if(this.show_interval)
        {
            clearInterval(this.show_interval);
        }

        this.show_interval = setInterval(function(){


            var o = parseFloat(__inst.domElement.style.opacity);

            if(o < 1.0)
            {
                o += 1.0 * (20 / __inst.fadeTime.in);

                __inst.domElement.style.opacity = o;
            }


        }, 20);

        setTimeout(function () {

            clearInterval(__inst.show_interval);


            __inst.hide_interval = setInterval(function(){

                var o = parseFloat(__inst.domElement.style.opacity);

            if(o > 0)
            {
                o -= 1.0 * (20 / __inst.fadeTime.out);

                __inst.domElement.style.opacity = o;
            }
            else {

                __inst.domElement.style.opacity = o;


                if (typeof(__inst.complete) == 'function') {
                    __inst.complete();


                }

                clearInterval(__inst.hide_interval);

            }



            }, 20);


        }, __inst.duration);


    }

        update() {


    }
}

/**
 * Instantiates a TextDisplay(), HTML/DOM object
 * @param   {Object} args the object of arguments
 * @param   {Number} args.widthFloat the pct 0-1.0 of screen-Width
 * @param   {Number} args.heightFloat the pct 0-1.0 of screen-Height
 *
 * @param   {Number} args.topFloat the pct 0-1.0 of screen-top-margin
 * @param   {Number} args.leftFloat the pct 0-1.0 of screen-left-margin
 * @param   {Number} args.targetLeft the pct 0-1.0 of target-left location (for slide-animation behavior)
 * @param   {Number} args.targetTop the pct 0-1.0 of target-top location (for slide-animation behavior)
 * @param   {string} args.color the css-text-color
 * @param   {string} args.text the text-value
 *
 * @param   {string} args.fontFamily the css fontFamily

 * @param {boolean} args.fromTop true || false, triggers a sliding-text animation from direction
 *
 *
 * @param {boolean} args.fromBottom true || false, triggers a sliding-text animation from direction
 *
 *
 * @param {boolean} args.fromLeft true || false, triggers a sliding-text animation from direction
 *
 *
 * @param {boolean} args.fromRight true || false, triggers a sliding-text animation from direction
 *
 *
 *@returns TextDisplay()
 *
 * */

class TextDisplay extends HtmlExtra {

    constructor(args = {}) {

        super(args);

        if (!args) {
            args = {};

        }

        this.duration = args.duration || 5000;

        this.complete = args.complete || function () {
            };

        this.create_dom();
    }

    create_dom() {
        this.domElement = document.createElement('SPAN');

        this.domElement.style.position = "fixed";

        this.domElement.style.color = this.color;

        this.domElement.style.padding = "10px";

        if(!this.targetBottom >= 0) {

            this.domElement.style.top = Math.round(document.body.clientHeight * this.topFloat) + 'px';

        }
        else
        {

            this.domElement.style.bottom = Math.round(document.body.clientHeight * this.bottomFloat) + 'px';

        }

        if(!this.targetRight >= 0) {

            this.domElement.style.left = Math.round(document.body.clientWidth * this.leftFloat) + 'px';

        }   else
        {

            this.domElement.style.right = Math.round(document.body.clientWidth * this.rightFloat) + 'px';
        }

        this.domElement.style.width = '90%';

        this.domElement.style.left = "5%";

        this.domElement.style.height ='auto';

        this.domElement.style.fontFamily = this.fontFamily;

        this.domElement.style.fontSize = this.fontSize;

        this.domElement.style.display = "block";

        this.domElement.style.textAlign = "center";

        this.domElement.style.zIndex = "9999";

        this.domElement.innerText = this.text;

        this.domElement.textContent = this.text;

        this.domElement.style.backgroundColor = 'transparent'; //always transparent

        this.domElement.style.opacity = this.fadeIn ? 0 : 1.0;

        this.domElement.id = GameStack.create_id();


    }

}

Gamestack.TextDisplay = TextDisplay;

/**
 * Instantiates an ItemDisplay() object : Displays item-image with number, such as the number of theoretical Coins collected
 * @param   {Object} args the object of arguments
 * @param   {string} args.src the src of the image
 * @param   {Vector} args.size the size(x, y) of the image, when displayed
 * @param   {Number} args.topFloat the pct 0-1.0 of screen-top-margin
 * @param   {Number} args.leftFloat the pct 0-1.0 of screen-left-margin
 * @param   {Number} args.targetLeft the pct 0-1.0 of target-left location (for slide-animation behavior)
 * @param   {Number} args.targetTop the pct 0-1.0 of target-top location (for slide-animation behavior)
 * @param   {string} args.color the css-text-color
 * @param   {string} args.text the text-value
 *
 * @param   {string} args.fontFamily the css fontFamily
 * @param   {string} args.fontSize the size of font
 *
 *@returns ItemDisplay()
 *
 * */


class ImageStatDisplay extends HtmlExtra {

    constructor(args = {}) {

        super(args);

        this.src = args.src || "__NONE";

        this.size = args.size || new Vector3(50, 50);

        this.text_id = GameStack.create_id();

        this.id = GameStack.create_id();

        this.img_id = GameStack.create_id();

        this.create_dom();

    }

    setValue(value) {
        document.getElementById(this.text_id)
    }

    get_float_pixels(float, dimen) {
        return Math.round(dimen * float) + 'px';
    }


    get_id() {
        return this.id;
    }

    update(v) {
        var e = document.getElementById(this.text_id);

        this.text = v + "";

        e.innerText = this.text;
    }

    create_dom() {
        //create an html element

        this.domElement = document.createElement('DIV');

        this.domElement.setAttribute('class', 'gameStack-stats');

        this.domElement.innerHTML += '<img style="float:left;" width="' + this.size.x + '" height="' + this.size.y + '" id="' + this.img_id + '" src="' + this.src + '"/>';

        this.domElement.style.color = this.color;

        this.domElement.innerHTML += '<span id="' + this.text_id + '" style="padding:5px; vertical-align:middle; display:table-cell; font-size:' + this.fontSize + '; color:' + this.color + ';">' + this.text + '</span>';

        this.domElement.style.position = "fixed";

        //this.domElement.style.padding = "10px";

        this.domElement.style.fontFamily = this.fontFamily;

        this.domElement.style.fontSize = this.fontSize;

        this.domElement.style.zIndex = "9999";

        this.domElement.id = this.id;
    }

    show(x, y) {

        this.domElement.style.left = x + "px";

        this.domElement.style.top = y + "px";

        document.body.append(this.domElement);
    }
}

Gamestack.ImageStatDisplay = ImageStatDisplay;

class Bar {
    constructor(background, border) {
        this.background = background;
        var e = document.createElement("SPAN");

        e.style.position = 'fixed';

        e.style.background = this.background;

        e.style.zIndex = "9999";

        e.style.backgroundSize = "100% 100%";

        e.style.backgroundPosition = "center bottom";

        if (border) {
            e.style.border = border;

        }


        this.domElement = e;

    }


    width(w) {
        this.domElement.style.width = w;

        return this;
    }

    height(h) {
        this.domElement.style.height = h;

        return this;
    }

}

Gamestack.Bar = Bar;

class BarFill {
    constructor(background) {
        this.background = background;
        var e = document.createElement("SPAN");

        e.style.background = this.background;

        e.style.position = 'fixed';

        e.style.zIndex = "9995";

        this.domElement = e;

    }

    width(w) {
        this.domElement.style.width = w;

        return this;
    }

    height(h) {
        this.domElement.style.height = h;

        return this;
    }

}

Gamestack.BarFill = BarFill;

class BarDisplay extends HtmlExtra { //show BarDisplay as in 'health-bar'

    constructor(args = {}) {

        super(args);

        this.border = args.border || "none";

        this.inner = args.src || args.inner || 'darkorange';

        this.outer = args.outer_src || args.outer || 'transparent';

        this.width = args.width + ''  || args.fill_width + '';

        if(this.width.indexOf('px') == -1)
        {
            this.width += 'px';
        }

        this.height = args.height + ''  || args.fill_height + '';

        if(this.height.indexOf('px') == -1)
        {
            this.height += 'px';
        }

        this.color = args.color  || args.fill_color;

        this.CreateDom();


    }

    CreateDom()
    {

        this.innerDom = new BarFill(this.inner).width(this.width || "80px").height(this.height || "10px");

        this.fill = this.innerDom;

        this.outerDom = new Bar(this.outer, this.border).width(this.width || "80px").height(this.height || "10px");

        this.bar = this.outerDom;

    }

    Inner(color_or_src)
    {
        this.inner = color_or_src;

        this.CreateDom();

        return this;
    }

    Outer(color_or_src)
    {
        this.outer = color_or_src;

        this.CreateDom();

        return this;
    }

    Border(css_border)
    {
      this.border = css_border;

      this.CreateDom();

      return this;

    }

    show() {

        document.body.append(this.innerDom.domElement);

        document.body.append(this.outerDom.domElement);

        return this;
    }

    Show() { //same as lc show()

        document.body.append(this.innerDom.domElement);

        document.body.append(this.outerDom.domElement);

        return this;
    }

    get_float_pixels(float, dimen) {
        return Math.round(dimen * float) + 'px';
    }

    portion_top(v) {

        this.fill.domElement.style.top = this.get_float_pixels(v || this.topFloat, GameStack.HEIGHT);

        this.bar.domElement.style.top = this.get_float_pixels(v || this.topFloat, GameStack.HEIGHT);

    }

    portion_left(v) {

        this.fill.domElement.style.left = this.get_float_pixels(v || this.leftFloat, GameStack.WIDTH);

        this.bar.domElement.style.left = this.get_float_pixels(v || this.leftFloat, GameStack.WIDTH);

    }

    portion_width(w) {

        this.fill.domElement.style.width = this.get_float_pixels(w || this.widthFloat, GameStack.WIDTH);

        this.bar.domElement.style.width = this.get_float_pixels(w || this.widthFloat, GameStack.WIDTH);


    }

    portion_height(h) {
        this.fill.domElement.style.height = this.get_float_pixels(h || this.heightFloat, GameStack.HEIGHT);

        this.bar.domElement.style.height = this.get_float_pixels(h || this.heightFloat, GameStack.HEIGHT);

    }

    update(f) {
        this.fill.domElement.style.width = this.get_float_pixels(f || 0, parseFloat(this.bar.domElement.style.width));

    }

}

Gamestack.BarDisplay = BarDisplay;

class TextBubble extends HtmlExtra {

    constructor(args = {}) //merely an element of text
    {
        super(args);

        this.opacity = args.opacity || 0.85;

        this.create_dom();

        this.duration = args.stay || args.duration || this.text.length * 100;

    }

    create_dom() {
        this.domElement = document.createElement('SPAN');

        this.domElement.setAttribute('class', 'speech-triangle')

        this.domElement.style.textAlign = "left"; //reset to left

        this.domElement.style.opacity = this.opacity;

        this.domElement.style.position = "fixed";

        this.domElement.style.color = this.color || 'white';

        if (this.backgroundColor == 'transparent') {
            this.backgroundColor = 'black';
        }

        this.domElement.style.backgroundColor = this.backgroundColor || 'black';

        this.domElement.style.borderRadius = '0.4em';

        this.domElement.style.border = this.border || '1px outset snow';

        this.domElement.style.borderColor = this.borderColor || 'snow';

        this.domElement.style.padding = "5px";

        this.domElement.style.paddingBottom = "2px";

        this.domElement.style.height = 'auto'; //auto-wrap to text

        this.domElement.style.top = Math.round(document.body.clientHeight * this.topFloat) + 'px';

        this.domElement.style.left = Math.round(document.body.clientWidth * this.leftFloat) + 'px';

        this.domElement.style.width = 'auto';

        this.domElement.style.height = 'auto';

        this.domElement.style.fontFamily = this.fontFamily;

        this.domElement.style.fontSize = this.fontSize;

        this.domElement.style.display = "block";

        this.domElement.style.textAlign = "center";

        this.domElement.style.zIndex = "9999";

        this.domElement.innerText = this.text;

        this.domElement.textContent = this.text;

        this.domElement.style.opacity = this.fadeIn ? 0 : this.opacity;

        this.domElement.id = GameStack.create_id();

    }
}

Gamestack.TextBubble= TextBubble;


})();
;
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

;
(function(){
    console.log('Line() class... creating');

    var Curves = { //ALL HAVE INPUT AND OUTPUT OF: 0-1.0
    // no easing, no acceleration
    linearNone: function (t) { return t },

    // accelerating from zero velocity
    easeInQuadratic: function (t) { return t*t },
    // decelerating to zero velocity
    easeOutQuadratic: function (t) { return t*(2-t) },
    // acceleration until halfway, then deceleration
    easeInOutQuadratic: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },
    // accelerating from zero velocity
    easeInCubic: function (t) { return t*t*t },
    // decelerating to zero velocity
    easeOutCubic: function (t) { return (--t)*t*t+1 },
    // acceleration until halfway, then deceleration
    easeInOutCubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },
    // accelerating from zero velocity
    easeInQuartic: function (t) { return t*t*t*t },
    // decelerating to zero velocity
    easeOutQuartic: function (t) { return 1-(--t)*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuartic: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },
    // accelerating from zero velocity
    easeInQuintic: function (t) { return t*t*t*t*t },
    // decelerating to zero velocity
    easeOutQuintic: function (t) { return 1+(--t)*t*t*t*t },
    // acceleration until halfway, then deceleration
    easeInOutQuintic: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t }
}

Gamestack.Curves = Curves;





/**
 * Takes several args and returns Line object. Intended for curved-line / trajectory of Projectile Object.
 * @param   {Object} args object of arguments
 * @param   {string} args.curve passed in as string, the key to a curveMethod, options are ['cubic', 'quartic', 'quadratic', 'quintic']
 * @param   {number} args.duration the millisecond duration of Line
 * @param   {Gamestack.Vector} args.position the position vector
 *
 * @param   {number} args.pointDisp the numeric point-distance
 *
 * @param   {Gamestack.Vector} args.size the size vector
 *
 * @param   {number} args.rotation the numeric rotation of -360 - 360
 *
 * @param   {number} args.growth the numeric growth
 *
 * -While a min and max Vector(x,y) will describe the grid of Animation frames, the termPoint will indicate the last frame to show on the grid (Animations may stop early on the 'grid')
 * @returns {VectorFrameBounds} a VectorFrameBounds object
 */


var inOutCurves = {

    quadratic: function (t) { return t<.5 ? 2*t*t : -1+(4-2*t)*t },

    cubic: function (t) { return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1 },

    quartic: function (t) { return t<.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t },

    quintic: function (t) { return t<.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t },

    linear: function (t) { return t; } //provided for consistency / in case 'linear' is needed

    };


Gamestack.Curves.InOut = inOutCurves;

class Line
{
    constructor(args={})
    {
        this.points = [];

        this.pointDisp = 1;

        this.size = args.size || new Gamestack.Vector(100, 100, 0);

        this.position = new Gamestack.Vector(0, 0, 0);
    }

    Rot(r)
    {

        this.rotation = r;

        return this;
    }

    Pos(p)
    {

        this.position = p;

        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.position = p;

        }

        return this;
    }

    Size(s)
    {

       this.size = s;

        if(typeof(s) == 'number')
        {
            this.size = new Gamestack.Vector(s, s, s);

        }

        return this;
    }

    Dispersion(num)
    {
        this.pointDisp = num;
        return this;
    }

    Curve(c, size)
    {
        this.curve = c;

        this.curveMethod = Gamestack.Curves.InOut[this.curve.toLowerCase()];

        if(c)
        this.curve_size = new Gamestack.Vector(size)

        return this;
    }

    CurveSize(s)
    {

        if(typeof(s) == 'number')
        {
            this.curve_size = new Gamestack.Vector(s, s, s);

        }
        else {

            this.curve_size = s;

        }

        return this;
    }

    Duration(d)
    {
        this.duration = d;

        return this;
    }

    Fill()
    {

        var current_point = new Gamestack.Vector(0, 0, 0);

        for(var x = 0; x <= Math.abs(this.size.x); x++)
        {

            var position = new Gamestack.Vector(x, 0, 0);

            if (current_point.trig_distance_xy(position) >= this.pointDisp)              {
                this.points.push(new Gamestack.Vector(position));

                current_point = new Gamestack.Vector(position);

            }
        }

        this.TransposeByRotation(this.rotation);

        return this;
    }

    TransposeByRotation(rotation)
    {

        this.rotation = rotation || this.rotation;

        function rotate(cx, cy, x, y, angle) {
            var radians = (Math.PI / 180) * angle,
                cos = Math.cos(radians),
                sin = Math.sin(radians),
                nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
                ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
            return new Gamestack.Vector(nx, ny);
        }

        for(var x = 0; x < this.points.length; x++) {

            var p = this.points[x];

            var np = rotate(this.position.x, this.position.y, p.x, p.y, this.rotation);

            this.points[x]= np;

        }

        return this;

    }

    Highlight(sprite, gameWindow)
    {

        this.highlight_sprites = this.highlight_sprites || [];


        var points = this.points;

        gameWindow = gameWindow || Gamestack.game_windows[0];

       var ctx = gameWindow.ctx;


        for(var x in points)
        {

            console.log(points[x]);

            if(!this.highlight_sprites[x])
            {
                this.highlight_sprites[x] = gameWindow.add(new Gamestack.Sprite(sprite), ctx);
            }

            var point = points[x];

            this.highlight_sprites[x].position = new Gamestack.Vector(point.sub( this.highlight_sprites[x].size.div(2)));

        }

        return this;

    }

    RemoveHighlight(gameWindow)
    {
        gameWindow = gameWindow || Gamestack.game_windows[0];

        for(var x in this.highlight_sprites)
        {
            gameWindow.remove(this.highlight_sprites[x]);

        }

        this.highlight_sprites = [];

        return this;

    }
}

Gamestack.Line = Line;

class WaveLine extends Line
{
    constructor(pos, size, curve_key)
    {
        var args = {};

        if(typeof(size) == 'number' || size instanceof Gamestack.Vector)
        {
            super({});
        }
        else if (size instanceof Object)
        {
            super(size);

            args = size;
        }


        this.Pos(pos);

        this.Size(size);

        this.curve_options = Curves;//Curves Object (of functions)

        curve_key = curve_key || args.curve_key || "quadratic"

        this.curve = curve_key ? curve_key.toLowerCase() : "quadratic";

        this.curve_options = ['cubic', 'quartic', 'quadratic', 'quintic', 'sine'];

        this.curveMethod = Gamestack.Curves.InOut[this.curve.toLowerCase()];

        this.points = args.points || [];

        this.is_highlighted = args.is_highlighted || false;

        this.offset = args.offset || new Gamestack.Vector(0, 0, 0);

        this.pointDisp = args.pointDisp || 5;

        this.rotation = args.rotation || 0;

        this.iterations = args.iterations || 1;

        this.max_size = args.max_size || this.size || new Gamestack.Vector(5000, 5000);

        this.growth = args.growth || 1.0;

    }

    Max(p)
    {

        this.target = p;

        if(typeof(p) == 'number')
        {
            this.target = new Gamestack.Vector(p, p, p);

        }
        else {

            this.target = p;

        }

        this.max = this.target; //'max' is synonymous with 'target'

        return this;
    }

    Min(p)
    {

        this.position = p;

        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.tposition = p;

        }

        this.min = this.position; //'max' is synonymous with 'target'

        return this;
    }

    Decay(n)
    {
        if(n < -1.0)
            n = -1.0;

        if(n > 1.0)
        {
            n = 1.0;
        }

        this.growth = 1.0 - n;

        return this;

    }

    next(position)
    {

        var found = false;

        for(var x = 0; x < this.points.length; x++)
        {

            if(position.equals(this.points[x]) &&  x < this.points.length - 1)
            {
                found = true;
                return new Gamestack.Vector(this.points[x + 1]);

            }

            if(x==this.points.length - 1 && !found)
            {

                return new Gamestack.Vector(this.points[0]);

            }

        }

    }

    getGraphCanvas(curveCall, existing_canvas) {

        var canvas = existing_canvas || document.createElement('canvas');

        canvas.style.position = "relative";

        canvas.id = 'curve-display';

        canvas.setAttribute('class', 'motion-curve');

        canvas.width = 180;
        canvas.height = 100;

        canvas.style.background = "black";

        var context = canvas.getContext('2d');
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, 180, 100);

        context.lineWidth = 0.5;
        context.strokeStyle = "rgb(230,230,230)";

        context.beginPath();
        context.moveTo(0, 20);
        context.lineTo(180, 20);
        context.moveTo(0, 80);
        context.lineTo(180, 80);
        context.closePath();
        context.stroke();

        context.lineWidth = 2;
        context.strokeStyle = "rgb(255,127,127)";

        var position = {x: 0, y: 80};
        var position_old = {x: 0, y: 80};

        this.test_graph_size = new Gamestack.Vector(185, 80 -20);

        var points = this.get_line_segment(this.test_graph_size, 5, curveCall);

        for(var x in points)
        {
            var position = new Gamestack.Vector(points[x].x, this.test_graph_size.y + 20 - points[x].y);

            context.beginPath();
            context.moveTo(position_old.x, position_old.y);
            context.lineTo(position.x, position.y);
            context.closePath();
            context.stroke();

            position_old.x = position.x;
            position_old.y = position.y;
        }

        return canvas;
    }

    Fill()
    {
        this.size = new Gamestack.Vector(this.size);

        var __inst = this;

        this.points = [];

        var current_point = new Gamestack.Vector(this.position), yTrack = 0;

        var x = 1, max_recursion = 300;

        var position = current_point;

        var dist = new Gamestack.Vector(20, 20, 20);

        var size = new Gamestack.Vector(this.curve_size || this.size);

       while(Math.abs(this.position.sub(position).x) <= Math.abs(this.max_size.x) && size.x > 2 && dist.x > 2) {

             position = new Gamestack.Vector(current_point);

               var target = new Gamestack.Vector(position.add(size)),

                start = new Gamestack.Vector(position),

                curveMethod = this.curveMethod,

                ptrack = new Gamestack.Vector(start);

            for (position.x = position.x; position.x < Math.abs(target.x); position.x += 1) {

                dist = position.sub(start);

                var pct = dist.x / size.x;

                position.y = start.y +  curveMethod(pct) * (x % 2 == 0 ? size.y : size.y * -1);

              //  position = position.round();

                if (current_point.trig_distance_xy(position) >= this.pointDisp) {

                    var p = new Gamestack.Vector(position);

                        this.points.push(p);

                    current_point = new Gamestack.Vector(position);

                }
            }

            size = size.mult(this.growth);

            if(x > max_recursion)
            {
                return console.error('Too much recursion in SwagLine');
            }

            x+= 1;

        }

        this.TransposeByRotation(this.rotation);

        return this;
    }

    Rotate(rotation)
    {
        this.rotation = rotation;

        if(typeof(this.rotation) == 'object')
        {

            this.rotation = this.rotation.x;

        }

      return this;
    }

}

Gamestack.WaveLine = WaveLine;

class ShapeLine extends Line
{

    constructor(args={})
    {
        super(args);

        this.targetTotalPoints = args.total || 200;

    }

    Total(t)
    {

        this.targetTotalPoints = t;
        return this;
    }

    Eliptical(pos, size, rotation)
    {
        this.Pos(pos || this.position);

        this.Size(size || this.size);

        this.Rot(rotation || this.rotation);

        function fill(elipse)
        {

            elipse.points = [];

        var center = elipse.position.add(elipse.size.div(2));

        var current_point = new Gamestack.Vector(0, 0, 0);

        var a = Math.abs(elipse.size.x /2), b = Math.abs(elipse.size.y /2);

        var perim = 2 * Math.PI * Math.sqrt(a * a + b * b);

        var step = (2 * Math.PI) / elipse.targetTotalPoints;

        for (var i = 0 * Math.PI; i < 2 * Math.PI; i += step) {

            var p = new Gamestack.Vector(center.x - (a * Math.cos(i)), center.y + (b * Math.sin(i)));

            elipse.points.push(new Gamestack.Vector(p));

            current_point = new Gamestack.Vector(p);

        }
        }

        fill(this);

        this.Fill = function(){

            fill(this);

            return this;

        };

        return this;
    }

    Quadrilateral(pos, size, rotation)
    {
        this.Pos(pos || this.position);

        this.Size(size || this.size);

        this.Rot(rotation || this.rotation);

        function fill(quad)
        {

            quad.points = [];

            var current_point = new Gamestack.Vector(0, 0, 0);

            var perim = 2 * quad.size.x + 2 * quad.size.y,

                stepX = quad.size.x / (quad.targetTotalPoints * (quad.size.x / perim)),

                stepY =  quad.size.y / (quad.targetTotalPoints * (quad.size.y / perim));

            for(var x = 0; x < quad.size.x; x+= stepX)
            {
                var p1 = new Gamestack.Vector(x, 0).add(quad.position);

                    quad.points.push(new Gamestack.Vector(p1));
            }

            for(var y = 0; y < quad.size.y; y+= stepY)
            {
                var p1 = new Gamestack.Vector(quad.size.x, y).add(quad.position);

                    quad.points.push(new Gamestack.Vector(p1));
            }

            for(var x = quad.size.x; x >= 0; x-= stepX)
            {
                var p1 = new Gamestack.Vector(x, quad.size.y).add(quad.position);

                quad.points.push(new Gamestack.Vector(p1));
            }

            for(var y = quad.size.y; y >= 0; y-= stepY)
            {
                var p1 = new Gamestack.Vector(0, y).add(quad.position);

                quad.points.push(new Gamestack.Vector(p1));
            }


        }

        fill(this);

        this.Fill = function(){

            fill(this);

            return this;

        };

        return this;
    }
};

Gamestack.ShapeLine = ShapeLine;

})();;/**
 * Takes an object of arguments and returns Motion() object. Motion animates movement of position and rotation properties for any Sprite()

 * @param   {Object} args object of arguments
 * @param   {string} args.name optional
 * @param   {string} args.description optional
 * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.curve the TWEEN.Easing function to be applied (Example: TWEEN.Easing.Quadratic.InOut)
 * @param   {Vector} args.targetRotation the targeted rotation result, when using rotation with movement
 * @param   {Vector} args.distance the target distance of position change, when moving position
 * @param   {number} args.duration the milliseconds duration of the Motion
 * @param   {number} args.delay the milliseconds delay before the Motion occurs (on call of Motion.engage())
 *
 *
 * @returns {Motion} a Motion object
 */

(function () {
    console.log('Motion class... creating');

    /*
     * TweenMotion constructors:
     *
     * new TweenMotion({motion_curve, distance(Vector), rotation(Vector)})
     *
     *  new Motion(new JaggedLine())
     *
     * */

    class Motion extends GSO //extends GSO || GamestackOverrideable
    {
        constructor(args={})
        {
            super(args);

            this.state_save = false;

            this.parent = args.parent || Gamestack.Extendors.applyParentalArgs(this, args);

            Gamestack.Extendors.informable(this, args);

            Gamestack.Extendors.tweenable(this, args);

        }

        restoreState()
        {
            for(var x in this.state_save)
            {
                this.parent[x] = this.state_save[x];
            }
        }

    };

    Gamestack.Motion = Motion;

    class TweenMotion extends Motion { //tween the state of an object, including 'position', 'size', and 'rotation' --rotation.x, etc..

        constructor(args = {}) {

            super(args);

            this.getArg = $Q.getArg;

            if(typeof(args.curve) == 'string')
            {
                args.curve_string = args.curve;
            }

            this.setTweenCurve(args.curve_string);

            this.target = false;

            this.targetCheck();

            this.curvesList = this.curvesToArray(); //Tween.Easing

            this.duration = Gamestack.getArg(args, 'duration', 500);

            this.delay = Gamestack.getArg(args, 'delay', 0);
        }

        targetCheck()
        {

            if(!this.target)
            {
                this.target = {

                    position: new Gamestack.Vector(),

                    rotation: new Gamestack.Vector(),

                    size: new Gamestack.Vector()

                };

            }
        }

        engage() {

            var __inst = this;

            __inst.call_on_run(); //call any on-run extensions

            this.tweens = [];

            var object = this.parent;

            this.targetCheck();

            if(!this.state_save) {

                this.state_save = {
                    position: new Gamestack.Vector(this.parent.position),
                    rotation: new Gamestack.Vector(this.parent.rotation),
                    size: new Gamestack.Vector(this.parent.size)
                };

            }


            //we always have a targetPosition
            //construct a tween::
            this.tweens.push(new TWEEN.Tween(object.position)
                .easing(__inst.curve || __inst.motion_curve)

                .to(object.position.add(this.target.position), __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);


                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));

            this.tweens.push(new TWEEN.Tween(object.rotation)
                .easing(__inst.curve || __inst.motion_curve)

                .to(object.rotation.add(this.target.rotation), __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);

                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));


            this.tweens.push(new TWEEN.Tween(object.size)
                .easing(__inst.curve || __inst.motion_curve)

                .to(object.size.add(this.target.size), __inst.duration)
                .onUpdate(function () {
                    //console.log(objects[0].position.x,objects[0].position.y);


                })
                .onComplete(function () {
                    //console.log(objects[0].position.x, objects[0].position.y);
                    if (__inst.complete) {

                        __inst.call_on_complete(); //only call once

                    }


                }));


            for (var x = 0; x < this.tweens.length; x++) {

                this.tweens[x].start();

            };
        }

        /**
         * start the Motion transition
         *
         * @function
         * @memberof Motion
         *
         **********/

        start() {

            this.engage();

        }

// obj.getGraphCanvas( $(c.domElement), value.replace('_', '.'), TWEEN.Easing[parts[0]][parts[1]] );

        getGraphCanvas(t, f, c) {

            var canvas = c || document.createElement('canvas');

            canvas.style.position = "relative";

            canvas.id = 'curve-display';

            canvas.setAttribute('class', 'motion-curve');

            canvas.width = 180;
            canvas.height = 100;

            canvas.style.background = "black";

            var context = canvas.getContext('2d');
            context.fillStyle = "rgb(0,0,0)";
            context.fillRect(0, 0, 180, 100);

            context.lineWidth = 0.5;
            context.strokeStyle = "rgb(230,230,230)";

            context.beginPath();
            context.moveTo(0, 20);
            context.lineTo(180, 20);
            context.moveTo(0, 80);
            context.lineTo(180, 80);
            context.closePath();
            context.stroke();

            context.lineWidth = 2;
            context.strokeStyle = "rgb(255,127,127)";

            var position = {x: 5, y: 80};
            var position_old = {x: 5, y: 80};

            new TWEEN.Tween(position).to({x: 175}, 2000).easing(TWEEN.Easing.Linear.None).start();
            new TWEEN.Tween(position).to({y: 20}, 2000).easing(f).onUpdate(function () {

                context.beginPath();
                context.moveTo(position_old.x, position_old.y);
                context.lineTo(position.x, position.y);
                context.closePath();
                context.stroke();

                position_old.x = position.x;
                position_old.y = position.y;

            }).start();

            return canvas;
        }

        getTweenPoints(size, line) {

            //must have line.minPointDist

            var curve = line.curve,
                duration = line.duration;

            var points = [];

            var position = new Vector(line.position);

            var target = new Vector(position).add(size);

            var start = new Vector(position);

            var dist = new Vector(0, 0, 0);

            var ptrack;


            var easeInOutQuad = function (t) {
                return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t
            };


            return points;

            var t1 = new TWEEN.Tween(position).to({x: target.x}, 2000).easing(TWEEN.Easing.Linear.None).start();

            if (t2) {
                t2.stop();
            }

            var t2 = new TWEEN.Tween(position).to({y: target.y}, 2000).easing(curve).onUpdate(function () {


                if (ptrack) {

                    dist = ptrack.sub(p);

                    var d = Math.sqrt(dist.x * dist.x + dist.y * dist.y);

                    if (d >= line.minPointDist) {

                        points.push(p);

                        ptrack = new Vector(p);
                    }

                }

                else {
                    ptrack = p;

                    points.push(p);
                }
                ;

            }).onComplete(function () {

                // alert(line.minPointDist);

                line.first_segment = points.slice();

                var extendLinePoints = function (segment, points, ix) {

                    var next_points = segment.slice();

                    var last_point = points[points.length - 1];

                    for (var x = 0; x < next_points.length; x++) {

                        var sr = new Vector(Gamestack.GeoMath.rotatePointsXY(line.size.x * ix, line.size.y * ix, line.rotation));

                        var p = next_points[x].add(sr);

                        if (points.indexOf(p) <= -1) {

                            points.push(p);


                        }

                    }
                };

                for (var x = 0; x <= line.curve_iterations; x++) {
                    if (x > 1) {

                        extendLinePoints(line.first_segment, line.points, x - 1);

                    }

                }


            }).start();

            return points;
        }
    }

    Gamestack.TweenMotion = TweenMotion;


    class LineMotion extends Motion
    {
        constructor(args={})
        {
            super(args);

            Gamestack.Extendors.spatial(this);

            this.Size(args.size || new Gamestack.Vector(200, 200));

            this.Pos(args.size || new Gamestack.Vector(200, 200));

            this.Rot(args.size || new Gamestack.Vector(200, 200));

        }
        Highlight(spr, gameWindow)
        {
            this.line.Highlight(spr, gameWindow);

            return this;
        }
        Eliptical(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.ShapeLine().Eliptical(pos, size, 0).Fill();

            return this;

        }


        Box(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.ShapeLine().Quadrilateral(pos, size, 0).Fill();

            return this;
        }
        QuadraticWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'quadratic').Fill();

            return this;

        }
        CubicWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'cubic').Fill();

            return this;
        }
        QuinticWave(pos, size)
        {
            size = size || this.size;

            pos = pos || this.position;

            this.line = new Gamestack.WaveLine(pos, size, 'quintic').Fill();

            return this;
        }
    }

    Gamestack.LineMotion = LineMotion;
})
();


;/**
 * Takes an object of arguments and returns Projectile() object. Projectile fires a shot from the parent sprite, with specified offset, rotation, motion_curve, line_curve

 * @param   {Object} args object of arguments
 * @param   {string} args.name optional
 * @param   {string} args.description optional
 * @param   {string} args.distance the distance before dissappearance
 * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.motion_curve the TWEEN.Easing function to be applied for motion/speed (Example: TWEEN.Easing.Quadratic.InOut)
 *
 *  * @param   {TWEEN.Easing.'objectGroup'.'objectMember'} args.line_curve the TWEEN.Easing function to be applied for line (Example: TWEEN.Easing.Quadratic.InOut)
 *
 * @returns {Projectile} a Projectile object
 */

class Projectile {

    constructor(args = {}) {

        this.getArg = $Q.getArg;

        for (var x in args) {
            this[x] = args[x];

        }

        this.name = args.name || "__";

        this.description = args.description || "__";

        this.animation = Gamestack.getArg(args, 'animation', new Animation());

        this.parent_id = args.parent_id || args.object_id || "__blank"; //The parent object

        this.name = Gamestack.getArg(args, 'name', "__");

        this.size = false;

        if(args.size)
        {
            this.size = new Vector(args.size);
        }
        else if(this.animation && this.animation.frameSize)
        {
           this.size =  new Vector(this.animation.frameSize);

        }
        else
        {
            console.info('Projectile():using default size.');
            this.size = new Vector(20, 20, 20);
        }

        this.origin = args.origin || new Vector(0, 0, 0);

        this.rotation = args.rotation || 0;

        this.line.Rotation(this.rotation);

        this.description = Gamestack.getArg(args, 'description', false);

        this.duration = Gamestack.getArg(args, 'duration', 500);

        this.delay = Gamestack.getArg(args, 'delay', 0);

        this.position = Gamestack.getArg(args, 'position', new Vector(0, 0, 0));

        this.motion_curve = Gamestack.getArg(args, 'motion_curve', TWEEN.Easing.Linear.None);

        this.highlighted = false;

        this.sprites = [];

        this.run_ext = args.run_ext || [];

    }

    /**
     * specify a function to be called when Motion is complete
     *
     * @function
     * @memberof Projectile
     * @param {Function} fun the function to be called when complete
     *
     **********/

    onComplete(fun) {
        this.complete = fun;

    }

    onCollide(fun) {
        this.collide = fun;

    }

    setAnimation(anime) {

        this.animation = anime;

        return this;

    }

    setMotionCurve(c) {

        this.motion_curve = c;

        return this;

    }

    kill_one() {

        var spr = this.sprites[this.sprites.length - 1];

        Gamestack.remove(spr);

    }

    onRun(caller, callkey) {

        this.run_ext = this.run_ext || [];

        this.run_ext.push({caller: caller, callkey: callkey});

    }

    shoot_basic(position, size, rot_offset, speed, numberShots, disp){

        var __playerInst = this;

        var bx = position.x, by = position.y, bw = size.x, bh = size.y;

        var half = numberShots / 2;

        for(var x = half * -1; x <= half; x++) {
            var shot = Gamestack.add(new Sprite({

                active: true,

                position: position,

                size: size,

                speed: speed,

                image: animation.image,

                rotation: new Vector3(0, 0, 0),

                flipX: false

            }));

            shot.setAnimation(animation);

            rot_offset = new Vector(rot_offset + (x * disp), 0, 0);

            shot.position.x = bx, shot.position.y = by;
            shot.rotation.x = 0 + rot_offset.x;

            shot.stats = {

                damage: 1

            };

            if (!options.line) {

                shot.onUpdate(function () {

                    shot.position.x += Math.cos((shot.rotation.x) * 3.14 / 180) * speed;

                    shot.position.y += Math.sin((shot.rotation.x) * 3.14 / 180) * speed;

                });


            }


        }

    }


    fire(origin, rotation) {

        for (var x = 0; x < this.run_ext.length; x++) {

            this.run_ext[x].caller[this.run_ext[x].callkey]();

        }


        this.line.origin = origin;

        this.line.rotation = rotation;

        console.log('FIRING FROM:' + jstr(origin));

        var sprite = new Sprite({image: this.animation.image});

        sprite.setAnimation(this.animation);

        sprite.setSize(this.size);

        sprite.position = new Vector(0, 0, 0);

        var __inst = this;

        __inst.line.fill();

        var lp = this.line.points;

        sprite.position = new Vector(lp[0]);

        sprite.onUpdate(function (sprite) {

            for (var x = 0; x < lp.length; x++) {

                if (sprite.position.equals(lp[x]) && x < lp.length - 1) {

                    sprite.position = new Vector(lp[x + 1]);

                    break;
                }

                if (x == lp.length - 1) {
                    Gamestack.remove(sprite);

                }

            }

        });

        Gamestack.add(sprite);

        this.sprites.push(sprite);

    }

}


Gamestack.Projectile = Projectile;







;




var Shapes = {

    circle:function(radius, freq) {

        return {

            radius:radius,

            points:[],

            fill:function(center, freq)
            {



            }

        }
    },

    square:function(s, freq)
    {
        console.error('STILL NEED TO BUILD THIS SQUARE IN GS-API');

        return{

            size:new Gamestack.Vector(s, s),

            width:w,

            height:h,

            freq:freq,

            points:[],

            fill:function(start, freq)
            {


            }
        }

    },

    rect:function(w, h, freq)
    {
        console.error('STILL NEED TO BUILD THIS TRIANGLE');

        return{

            size:new Gamestack.Vector(w, h),

            width:w,

            height:h,

            freq:freq,

            points:[],

            fill:function(start, freq)
            {


            }
        }

    },

    triangle:function(base, h, freq)
    {

        console.error('STILL NEED TO BUILD THIS TRIANGLE');

        return{

            base:base,

            height:height,

            freq:freq,

            points:[],

            fill:function(start, freq)
            {


            }
        }

    }
};


Gamestack.Shapes = Shapes;
;
class Shot
{
    constructor(name, imageOrAnimation)
    {
        this.name = name || 'No-Name';

        if(imageOrAnimation instanceof Gamestack.GameImage)
        {
            this.anime = new Animation(imageOrAnimation);
        }
        else if(imageOrAnimation instanceof Gamestack.Animation)
        {
            this.anime = imageOrAnimation;

        }

        this.rotation = 0;

        this.rot_disp = 0;


        var args = name instanceof Object ? name : {};


        //is name / first arg an entire instance of shot?

        this.init(args);

    }

    init(args)
    {
        if(args instanceof Object) {

            for (var x in args) {

                this[x] = args[x];

                if(args[x] instanceof Object && args[x].hasOwnProperty('x'))//process as Vector
                {
                    this[x] = new Vector(args[x]);
                }


            }


            if(typeof this.velocity =='object' && this.velocity.x)
            {
                this.velocity = this.velocity.x; //velocity is single number
            }

            this.size = args.size || new Gamestack.Vector(20, 20);

            this.position = args.position || new Gamestack.Vector(0, 0);

            this.offset = args.offset || new Gamestack.Vector(0, 0);


        }

        Gamestack.ChainSet.informable(this);
    }

    Image(image)
    {

        this.anime = new Animation(image);

    }

    Animation(anime)
    {
        this.anime = anime;
        return this;
    }

    Total(total, rot_disp_per_unit)
    {

        this.total =total;

        this.rot_disp = rot_disp_per_unit;

        return this;

    }

    WaveGrowth(growth)
    {
        if(growth > 0)
            this.curve_growth = growth;
    }

    CurveMode(key, size, growth)
    {
        this.curve = Gamestack.Curves.InOut[key.toLowerCase()];

        this.curve_key = key.toLowerCase();

        this.curve_size = size;

        if(growth > 0)
        this.curve_growth = growth;

        if(typeof(this.curve_size)=='number')
            this.curve_size = new Gamestack.Vector(this.curve_size, this.curve_size);

        return this;

    }

    RotDisp( rot_disp)
    {
        this.rot_disp = rot_disp;

        return this;
    }

    Velocity(v)
    {
        if(typeof v == 'object' && v.x)
        {
            this.speed = v.x;
        }
        else {
            this.speed = v;

        }

        return this;
    }

    Speed(v)
    {
        if(typeof v == 'object' && v.x)
        {
            this.speed = v.x;
        }
        else {
            this.speed = v;

        }

        return this;
    }

    Position(p)
    {
        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.position = p;

        }

        return this;

    }


    Offset(o)
    {
        if(typeof(o) == 'number')
        {
            this.offset = new Gamestack.Vector(o,o,o);

        }
        else {

            this.offset = o;

        }

        return this;

    }


    Pos(p)
    {
        if(typeof(p) == 'number')
        {
            this.position = new Gamestack.Vector(p, p, p);

        }
        else {

            this.position = p;

        }

        return this;

    }

    Size(s)
    {
        if(typeof(s) == 'number')
        {
            this.size = new Gamestack.Vector(s, s, s);

        }
        else {

            this.size = s;

        }

        return this;

    }

    Rotation(r)
    {
        this.rotation = r;

        return this;

    }

    onCollide(collideables, callback)
    {


    }

}


Gamestack.Shot = Shot;;

/**
 * Takes the min and max vectors of rectangular shape and returns Rectangle Object.
 * @param   {Object} args object of arguments
 * @param   {Gamestack.Vector} args.min the minimum vector point (x,y)
 * @param   {Gamestack.Vector} args.max the maximum vector point (x,y)
 *
 * @returns {Rectangle} a Rectangle object
 */

class Rectangle {

    constructor(min, max) {

        this.min = new Gamestack.Vector(min);
        this.max = new Gamestack.Vector(max);

    }
    toLine()
    {


    }
}
;



let VectorBounds = Rectangle;

Gamestack.VectorBounds =VectorBounds;

Gamestack.Rectangle = Rectangle;



//span includes a min and max, which may be any of the following:

//1. opacity 0-1 OR any float of 0-1

//2. vector(x,y,z?)

//3. hex-color-string such as #FFFFFF

//4. numeric bounds of negative-any-number to positive-any-number

class Span
{
    constructor(min, max)
    {

        this.min = min;

        this.max = max;

        //handle vector instance:

        if(typeof(min) == 'object' && min.hasOwnProperty('x') &&
            typeof(max) == 'object' && max.hasOwnProperty('x') )
        {
            this.min = new Gamestack.Vector(min);
            this.max = new Gamestack.Vector(max);
        }

    }
}

Gamestack.Span = Span;


/**
 * Takes the min and max vectors plus termPoint ('termination-point'), returns VectorFrameBounds
 *  *use this to define the bounds of an Animation object.
 * @param   {Object} args object of arguments
 * @param   {Gamestack.Vector} args.min the minimum vector point (x,y)
 * @param   {Gamestack.Vector} args.max the maximum vector point (x,y)
 * @param   {Gamestack.Vector} args.termPoint the termPoint vector point (x,y)
 * -While a min and max Gamestack.Vector(x,y) will describe the grid of Animation frames, the termPoint will indicate the last frame to show on the grid (Animations may stop early on the 'grid')
 * @returns {VectorFrameBounds} a VectorFrameBounds object
 */


class VectorFrameBounds extends Rectangle {

    constructor(min, max, termPoint) {

        super(min, max);

        this.termPoint = new Gamestack.Vector(termPoint || new Gamestack.Vector(this.max.x, this.max.y, this.max.z));

    }


}
;

Gamestack.VectorFrameBounds = VectorFrameBounds;



/**
 * Takes several args and returns Line object. Intended for curved-line / trajectory of Projectile Object.
 * @param   {Object} args object of arguments
 * @param   {Easing} args.curve the curve applied to line see TWEEN.Easing , limited options for immediate line-drawing
 * @param   {number} args.duration the millisecond duration of Line
 * @param   {Gamestack.Vector} args.position the position vector
 *
 * @param   {number} args.pointDist the numeric point-distance
 *
 * @param   {Gamestack.Vector} args.size the size vector
 *
 * @param   {number} args.rotation the numeric rotation of -360 - 360
 *
 * @param   {number} args.growth the numeric growth
 *
 * -While a min and max Vector(x,y) will describe the grid of Animation frames, the termPoint will indicate the last frame to show on the grid (Animations may stop early on the 'grid')
 * @returns {VectorFrameBounds} a VectorFrameBounds object
 */

class Line
{
    constructor(args = {})
    {


        this.curve_options = Curves;//Curves Object (of functions)
        this.curve_string = args.curve_string || "linearNone";

        this.curve = this.get_curve_from_string(this.curve_string);

        this.motion_curve = args.motion_curve || TWEEN.Easing.Linear.None;

        if(typeof(args.curve) == 'function')
        {
            this.curve = args.curve;
        }

        this.points = args.points || [];

        this.position = args.position ||  new Gamestack.Vector();

        this.is_highlighted = args.is_highlighted || false;

        this.offset = args.offset || new Gamestack.Vector();

        this.pointDist = 5;

        this.size = args.size || new Gamestack.Vector();

        this.rotation = args.rotation || 0;

        this.origin = args.origin || new Gamestack.Vector(0, 0);

        this.iterations = 1;

        this.growth = args.growth || 1.2;

    }

    Iterations(n)
    {

       this.iterations = n;
       return this;
    }

    Growth(n)
    {
        this.growth = n;

        return this;

    }

    Origin(o)
    {
        this.position = o;
       this.origin = o;

       return this;

    }

    Pos(p)
    {
        this.origin = p;
        this.position = p;
        return this;
    }

    PointDisp(num)
    {
        this.minPointDist = num;
        return this;
    }

    Curve(c)
    {
        this.curve = c;
        this.curve_string = this.get_curve_string(c);
        return this;
    }

    Duration(d)
    {
        this.duration = d;

        return this;
    }
    Rotation(r)
    {
        this.rotation = r;
        return this;
    }
    next(position)
    {

        var found = false;

        for(var x = 0; x < this.points.length; x++)
        {

            if(position.equals(this.points[x]) &&  x < this.points.length - 1)
            {
                found = true;
                return new Gamestack.Vector(this.points[x + 1]);

            }

            if(x==this.points.length - 1 && !found)
            {

                return new Gamestack.Vector(this.points[0]);

            }

        }

    }

    get_curve_from_string(str)
    {

        console.log('Applying Line():curve:' + str);

        for(var x in this.curve_options) {

            if(x.toLowerCase() == str.toLowerCase())
            {
                return this.curve_options[x];

            }

        }

    }


    get_curve_string(c)
    {
        for(var x in this.curve_options) {

            if(this.curve_options[x] == c)
            {
                return x;

            }

        }

    }

    getGraphCanvas(curveCall, existing_canvas) {

        var canvas = existing_canvas || document.createElement('canvas');

        canvas.style.position = "relative";

        canvas.id = 'curve-display';

        canvas.setAttribute('class', 'motion-curve');

        canvas.width = 180;
        canvas.height = 100;

        canvas.style.background = "black";

        var context = canvas.getContext('2d');
        context.fillStyle = "rgb(0,0,0)";
        context.fillRect(0, 0, 180, 100);

        context.lineWidth = 0.5;
        context.strokeStyle = "rgb(230,230,230)";

        context.beginPath();
        context.moveTo(0, 20);
        context.lineTo(180, 20);
        context.moveTo(0, 80);
        context.lineTo(180, 80);
        context.closePath();
        context.stroke();

        context.lineWidth = 2;
        context.strokeStyle = "rgb(255,127,127)";

        var position = {x: 0, y: 80};
        var position_old = {x: 0, y: 80};

        this.test_graph_size = new Gamestack.Vector(185, 80 -20);

       var points = this.get_line_segment(this.test_graph_size, 5, curveCall);

        for(var x in points)
        {
            var position = new Gamestack.Vector(points[x].x, this.test_graph_size.y + 20 - points[x].y);

            context.beginPath();
            context.moveTo(position_old.x, position_old.y);
            context.lineTo(position.x, position.y);
            context.closePath();
            context.stroke();

            position_old.x = position.x;
            position_old.y = position.y;
        }

        return canvas;
    }

    transpose(origin, rotation)
    {

        this.rotation = rotation;

        this.origin = origin;

        var t_points = [];

        for(var x = 0; x < this.points.length; x++) {

            var p = this.points[x];

            var np = new Gamestack.Vector(Gamestack.GeoMath.rotatePointsXY(p.x, p.y, this.rotation));

            t_points.push(np.add(origin));

            console.log(np);

        }




        return t_points;

    }

    add_segment(next_segment, offset)
    {
        for(var x = 0; x < next_segment.length; x++) {

            next_segment[x] = new Gamestack.Vector(next_segment[x]).add(offset);

            this.points.push(next_segment[x]);

        }

    }


    get_flipped_segment(points)
    {

        var t_points = points.slice(), t_len = t_points.length;

        for(var x = 0; x < points.length; x++) {

            t_points[t_len - x].x = points[x].x

        }

        return t_points;

    }

    Highlight(origin, ctx)
    {

        ctx = ctx || Gamestack.ctx;

        var points = this.transpose(origin);

        for(var x in points)
        {

            var point = points[x];

            var dist = point.sub(Gamestack.point_highlighter.position);

            var d = Math.sqrt( dist.x * dist.x + dist.y * dist.y );


            if(d >= 10)
            {
                Gamestack.point_highlighter.position = new Gamestack.Vector(points[x]);
            }


               Canvas.draw(Gamestack.point_highlighter, ctx);

        }

        return this;

    }

}


var GeoMath = {

        rotatePointsXY:function(x,y,angle) {

            var theta = angle*Math.PI/180;

            var point = {};
            point.x = x * Math.cos(theta) - y * Math.sin(theta);
            point.y = x * Math.sin(theta) + y * Math.cos(theta);

            point.z = 0;

            return point
        }

}

Gamestack.GeoMath = GeoMath;
;


/**
 * Simple Sound object:: implements Jquery: Audio()
 * @param   {string} src : source path / name of the targeted sound-file

 * @returns {Sound} object of Sound()
 * */


class Sound {

    constructor(src, data) {


        if (typeof(src) == 'object') {

            this.sound = document.createElement('audio');

            this.sound.src = src.src;

            this.src = src.src;

        }

        else if (typeof(src) == 'string') {

            this.sound = document.createElement('audio');

            this.sound.src = src;

            this.src = src;

        }

        if(typeof(data)=='object') {
            for (var x in data) {
                if (x !== 'sound') {
                    this[x] = data[x];

                }

            }

        }

        this.sound.load();

        this.onLoad = this.onLoad || function () {



            };

        if (typeof(this.onLoad) == 'function') {

            this.onLoad(this.sound);

        }

    }

    Loop(loop)
    {
        this.sound.loop = loop || true;

        return this;

    }

    loop(loop) //same as Loop()
    {
        this.sound.loop = loop || true;

        return this;

    }


    Volume(val)
    {

        this.sound.volume = val;

        return this;

    }


    volume(val) //same as Volume()
    {

        this.sound.volume = val;

        return this;

    }

    Play() {
        if (typeof(this.sound) == 'object' && typeof(this.sound.play) == 'function') {

            this.sound.play();

        }

        return this;

    }

    play() { //same as Play()
        if (typeof(this.sound) == 'object' && typeof(this.sound.play) == 'function') {

            this.sound.play();

        }

        return this;

    }

}


class SoundList{

    constructor(list)
    {

        this.cix = 1;

        this.sounds = [];

        if(list instanceof Array)
        {
            for(var x in list)
            {
                if(list[x].src)
                {
                    this.sounds.push(new Sound(list[x].src, list[x]));

                }
                else if(typeof(list[x]) == 'string')
                {
                    this.sounds.push(new Sound(list[x]));

                }

            }

        }



    }

    add(src, name)
    {
        if(typeof(src) == 'object' && src.src)
        {
            this.sounds.push(new Sound(src.src, src));

        }
        else if(typeof(src) == 'string')
        {
            var data = {};

            if(name)
            {
                data.name = name;
            }

            this.sounds.push(new Sound(list[x], data));

        }

    }

    Volume(v)
    {
        for(var x = 0; x < this.sounds.length;x++)
        {
            this.sounds[x].volume(v);

        }

        return this;
    }

    volume(v)
    {
        for(var x = 0; x < this.sounds.length;x++)
        {
            this.sounds[x].volume(v);

        }

        return this;
    }


    PlayNext()
    {
        this.sounds[this.cix % this.sounds.length].play();

        this.cix += 1;

    }

    Play()
    {

        this.sounds[this.cix % this.sounds.length].play();

        this.cix += 1;


    }

    playNext() //same as PlayNext()
    {
        this.sounds[this.cix % this.sounds.length].play();

        this.cix += 1;

    }

    play() //same as Play()
    {

        this.sounds[this.cix % this.sounds.length].play();

        this.cix += 1;


    }

}

Gamestack.Sound = Sound;

Gamestack.SoundList = SoundList;
;(function () {
    console.log('Sprite class... creating');

    /**
     * Gamestack.Sprite: Takes an object of arguments and returns Sprite() object. Sprite() is a container for multiple Animations, Motions, and Sounds. Sprites have several behavioral functions for 2d-Game-Objects.

     * @param   {Object} args object of arguments
     * @param   {string} args.name optional
     * @param   {string} args.description optional

     * @param   {string} args.src the source file for the GameImage:Sprite.image :: use a string / file-path

     * @param   {Gamestack.Vector} args.size the size of the Gamestack.Sprite
     * @param   {Gamestack.Vector} args.position the position of the Gamestack.Sprite
     * @param   {Gamestack.Vector} args.padding the 'float-type' Vector of x and y padding to use when processing collision on the Gamestack.Sprite. A padding of new Vector(0.2, 0.2) will result in 1/5 of Gamestack.Sprite size for padding

     * @param   {Gamestack.Animation} args.selected_animation the selected_animation of the Gamestack.Sprite:: pass during creation or use Gamestack.Sprite.setAnimation after created
     *
     * @returns {Gamestack.Sprite} a Gamestack.Sprite object
     */


    class Sprite {
        constructor(args = {}, arg2, arg3) {

            var a = {};

            if (args instanceof Gamestack.Animation) //instantiate from animation
            {
                args = {selected_animation: args, size: new Gamestack.Vector(args.frameSize)};
            }

            else if (typeof(args) == 'string')//load with image 'src' argument
            {
                //apply image from string 'src'

                this.image = new Gamestack.GameImage(args);

                var __inst = this;

                var img = this.image.domElement;

                if(typeof img == 'object' && img.onload)
                img.onload = function () {

                    __inst.singleFrame();

                    if (__inst.after_load) {
                        __inst.after_load(__inst);
                    }
                };

                if (typeof(arg2) == 'number') //image plus 'scale' argument
                {
                    this.scale = arg2;

                    var img = this.image.domElement;

                    this.image.domElement.onload = function () {
                        __inst.size = new Gamestack.Vector(Math.round(img.width * scale), Math.round((img.width / img.height) * scale));

                    };

                }

                if (typeof(arg2) == 'object' && arg2.hasOwnProperty('x') && arg2.hasOwnProperty('y')) //image plus 'size' argument
                {

                    this.size = new Gamestack.Vector(arg2);

                }
            }


            if (typeof(arg2) == 'object' && arg2.hasOwnProperty('x')) {
                this.size = new Gamestack.Vector(arg2);
            }

            Gamestack.Extendors.spatial(this);

            this.active = true; //active sprites are visible

            if (typeof(args) == 'object') {

                this.apply_args(args);
            }
            else {
                this.apply_args(a);
            }


        }

        afterLoad(f) {
            this.after_load = f;
        }

        apply_args(args = {}) {

            for (var x in args) {
                this[x] = args[x];
            }

            this.name = args.name || "__blankName";

            this.life = args.life || 999999999999;

            this.description = args.description || "__spriteDesc";

            this.id = Gamestack.getArg(args, 'id', this.create_id());

            this.animations = Gamestack.getArg(args, 'animations', []);

            this.motions = Gamestack.getArg(args, 'motions', []);

            this.particles = Gamestack.getArg(args, 'particles', []);

            this.shots = Gamestack.getArg(args, 'shots', []);

            this.sounds = Gamestack.getArg(args, 'sounds', []);

            this.__initializers = Gamestack.getArg(args, '__initializers', []);

            this.type = Gamestack.getArg(args, 'type', 'basic');

            this.scrollFactor = args.scrollFactor || 1.0;


            this.noScroll = args.noScroll || true;

            this.speed =  new Gamestack.Vector(Gamestack.getArg(args, 'speed', new Gamestack.Vector(0, 0, 0)));

            this.size = new Gamestack.Vector(Gamestack.getArg(args, 'size', new Gamestack.Vector(0, 0)));

            this.position = new Gamestack.Vector(Gamestack.getArg(args, 'position', new Gamestack.Vector(0, 0, 0)));

            this.collision_bounds = Gamestack.getArg(args, 'collision_bounds', new Gamestack.VectorBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0)));

            this.rotation = new Gamestack.Vector(Gamestack.getArg(args, 'rotation', new Gamestack.Vector(0, 0, 0)));


            this.acceleration = Gamestack.getArg(args, 'acceleration', new Gamestack.Vector(0, 0, 0));

            this.rot_speed =  new Gamestack.Vector(Gamestack.getArg(args, 'rot_speed', new Gamestack.Vector(0, 0, 0)));

            this.rot_accel =  new Gamestack.Vector(Gamestack.getArg(args, 'rot_accel', new Gamestack.Vector(0, 0, 0)));

            this.padding =  new Gamestack.Vector(Gamestack.getArg(args, 'padding', new Gamestack.Vector(0, 0, 0)));


            var __inst = this;

            if (args.src) {
                this.src = args.src;
                console.log('image src:' + args.src);
                this.image = new Gamestack.GameImage(args.src);
            }
            else if (args.image instanceof Gamestack.GameImage) {
                this.image = args.image;
            }

            else if (args.image && args.image.domElement && args.image.domElement.src) {
                this.image = new Gamestack.GameImage(args.image.domElement.src);
            }


            //Apply / instantiate Sound(), Gamestack.Motion(), and Gamestack.Animation() args...


            GameStack.each(this.shots, function (ix, item) {

                __inst.shots[ix] = new Gamestack.Shot(item);

            });

            GameStack.each(this.sounds, function (ix, item) {

                __inst.sounds[ix] = new Gamestack.Sound(item);

            });

            GameStack.each(this.motions, function (ix, item) {

                __inst.motions[ix] = new Gamestack.TweenMotion(item);

            });

            GameStack.each(this.animations, function (ix, item) {

                __inst.animations[ix] = new Gamestack.Animation(item);


            });

            GameStack.each(this.particles, function (ix, item) {

                __inst.particles[ix] = new Gamestack.GSProton(item);

            });

            //Apply initializers:

            GameStack.each(this.__initializers, function (ix, item) {

                __inst.onInit(item);

            });

            Gamestack.ChainSet.informable(this);

            if (args.selected_animation)
                this.selected_animation = new Gamestack.Animation(args.selected_animation);


        }

        singleFrame() {
            var __inst = this;

            if (!__inst.selected_animation) {

                console.log('setting Animation with :' + this.image.domElement.src);

                __inst.setAnimation(new Gamestack.Animation({

                    image: __inst.image,

                    frameSize: new Gamestack.Vector(__inst.image.domElement.width, __inst.image.domElement.height),

                    frameBounds: new Gamestack.VectorFrameBounds(new Gamestack.Vector(), new Gamestack.Vector())


                }));

            }

            if (__inst.size.x == 0 && __inst.size.y == 0) {
                //take size of image
                __inst.size = new Gamestack.Vector(__inst.image.domElement.width, __inst.image.domElement.height);

            }

            return this;
        }

        /**
         * This function adds objects to the Gamestack.Sprite. Objects of Gamestack.Animation(), Projectile().
         *
         * @function
         * @memberof Sprite
         **********/

        add(obj) {

            switch (obj.constructor.name) {

                case "Shot":

                    this.shots.push(obj);

                    break;


                case "Animation":

                    this.animations.push(obj);

                    break;

                case "GSProton":

                    obj.parent = this;

                    this.particles.push(obj);

                    break;

                case "TweenMotion":

                    this.motions.push(obj);

                    break;

                case "Sound":

                    this.sounds.push(obj);

                    break;

            }


        }

        /**
         * This function initializes sprites. Call to trigger all functions previously passed to onInit().
         *
         * @function
         * @memberof Sprite
         **********/

        init() {


        }


        Scrollable(scroll)
        {

            if(scroll !== false)
            {
                this.noScroll = false;
            }
            else
            {
                this.noScroll = true;
            }

            return this;

        }


        /**
         * This function extends the init() function. Takes single function() argument OR single string argument
         * @function
         * @memberof Sprite
         * @param {function} fun the function to be passed into the init() event of the Sprite()
         **********/

        onInit(fun) {

            if (typeof fun == 'string') {

                if (this.__initializers.indexOf(fun) < 0) {

                    this.__initializers.push(fun)
                }
                ;

                var __inst = this;

                var keys = fun.split('.');

                console.log('finding init from string:' + fun);

                if (!keys.length >= 2) {
                    return console.error('need min 2 string keys separated by "."');
                }

                var f = GameStack.options.SpriteInitializers[keys[0]][keys[1]];

                if (typeof(f) == 'function') {

                    var __inst = this;

                    var f_init = this.init;

                    this.init = function () {

                        f_init(__inst);

                        f(__inst);

                    };

                }


            }

            else if (typeof fun == 'function') {

                console.log('extending init:');


                var f_init = this.init;
                var __inst = this;

                this.init = function () {

                    f_init(__inst);

                    fun(__inst);

                };


            }

            else if (typeof fun == 'object') {

                console.log('extending init:');

                console.info('Quick2D does not yet implement onInit() from arg of object type');

            }

        }

        /*****************************
         * Getters
         ***************************/

        /**
         * This function gets the 'id' of the Sprite()
         * @function
         * @memberof Sprite
         * @returns {string}
         **********/

        get_id() {
            return this.id;
        }

        to_map_object(size, framesize) {

            this.__mapSize = new Gamestack.Vector(size || this.size);

            this.frameSize = new Gamestack.Vector(framesize || this.size);

            return this;

        }

        /*****************************
         * Setters and Creators
         ***************************/

        /**
         * This function creates the 'id' of the Sprite():Called automatically on constructor()
         * @function
         * @memberof Sprite
         * @returns {string}
         **********/

        create_id() {

            return Gamestack.create_id();

        }


        /**
         * This function sets the size of the Sprite()
         * @function
         * @memberof Sprite
         **********/

        setSize(size) {

            this.size = new Gamestack.Vector(size.x, size.y, size.z);

        }

        /**
         * This function sets the position of the Sprite()
         * @function
         * @memberof Sprite
         **********/

        setPos(pos) {
            this.position = new Gamestack.Vector(pos.x, pos.y, pos.z || 0);

        }

        /**
         * This function sizes the Sprite according to minimum dimensions and existing w/h ratios
         * @param {number} mx the maximum size.x for the resize
         * @param {number} my the maximum size.y for the resize
         * @function
         * @memberof Sprite
         **********/

        getSizeByMax(mx, my) {

            var size = new Gamestack.Vector(this.size);

            var wth = size.y / size.x;

            var htw = size.x / size.y;

            if (size.x > mx) {
                size.x = mx;

                size.y = size.x * wth;

            }

            if (size.y > my) {
                size.y = my;

                size.x = size.y * htw;

            }

            return size;

        }

        /*****************************
         *  assertSpeed()
         *  -assert the existence of a speed{} object
         ***************************/

        assertSpeed() {
            if (!this.speed) {

                this.speed = new Gamestack.Vector(0, 0, 0);

            }

        }

        /*****************************
         *  setAnimation(anime)
         *  -set the select_animation of this sprite
         ***************************/

        /**
         * This function sets the 'selected_animation' property of the Sprite():: *all Sprites must have a 'selected_animation'
         * @function
         * @memberof Sprite
         * @param {Animation}
         **********/

        setAnimation(anime) {

            if (anime instanceof Gamestack.Animation && this.animations.indexOf(anime) < 0) {
                this.animations.push(anime);
            }

            this.selected_animation = anime;

            Gamestack.log('set the animation');

            return this;

        }


        /**
         * This function sets the 'selected_animation' property to a single-frame --the source image of the sprite
         * @function
         * @memberof Sprite
         * @param {Animation}
         **********/

        setToSingleFrame() {

            this.selected_animation = new Gamestack.Animation({
                image: this.image,
                frameSize: new Gamestack.Vector(this.image.domElement.width, this.image.domElement.height)
            });

            var __inst = this;

            this.selected_animation.image.domElement.onload = function () {

                __inst.size = new Gamestack.Vector(__inst.selected_animation.image.domElement.width, __inst.selected_animation.image.domElement.height);

            };


            Gamestack.log('set single-frame animation');

            return this;

        }


        /**
         * This function indicates if this Sprite is onScreen within the Gamestack.WIDTH && Gamestack.HEIGHT dimensions, OR any w & h passed as arguments
         * @function
         * @memberof Sprite
         * @param {number} w optional WIDTH argument, defaults to Gamestack.WIDTH
         * @param {number} h optional HEIGHT argument, defaults to Gamestack.HEIGHT
         **********/

        LifeSpan(value) {
            this.life = value;
        }

        Life(value) //same as LifeSpan
        {
            this.life = value;
        }

        isDead(gw) {

            gw = gw || Gamestack.game_windows[0];

            return this.hasOwnProperty('life') && this.life <= 0;
        }

        die(gw) {

       this.life = 0;

       return this;

        }

        onScreen(w, h, gw) {

            w = w || Gamestack.WIDTH;

            h = h || Gamestack.HEIGHT;

            gw = gw || Gamestack.game_windows[0];

            var camera = gw.camera || Gamestack.camera || {position: new Gamestack.Vector(0, 0, 0)},
                scrollFactor = this.noScroll ? 0 : this.scrollFactor;

            var camPos = new Gamestack.Vector(camera.position).mult(scrollFactor);

            var p = new Gamestack.Vector(this.position.x - camPos.x, this.position.y - camPos.y, this.position.z - camPos.z);

            return p.x + this.size.x > -1000 - w && p.x < w + 1000
                && p.y + this.size.y > 0 - 1000 - h && p.y < h + 1000;

        }

        /*****************************
         * Updates
         ***************************/

        /*****************************
         * update()
         * -starts empty:: is used by Quick2d.js as the main sprite update
         ***************************/

        /**
         * This function is the main update() function for the Sprite
         * @function
         * @memberof Sprite
         **********/


        update(sprite) {
        }

        /*****************************
         * def_update()
         * -applies speed and other default factors of movement::
         * -is used by Quick2d.js as the system def_update (default update)
         ***************************/

        /**
         * This function updates various speed and rotational-speed properties for the Sprite()
         * @function
         * @memberof Sprite
         **********/

        def_update(sprite) {

            if (this.hasOwnProperty('life') && !isNaN(this.life)) {

                this.life -= 1;

            }
            ;

            for (var x in this.speed) {

                if (this.speed[x] > 0 || this.speed[x] < 0) {

                    this.position[x] += this.speed[x];

                }

            }

            for (var x in this.acceleration) {

                if (this.acceleration[x] > 0 || this.acceleration[x] < 0) {

                    this.speed[x] += this.acceleration[x];

                }

            }

            for (var x in this.rot_speed) {

                if (this.rot_speed[x] > 0 || this.rot_speed[x] < 0) {

                    this.rotation[x] += this.rot_speed[x];

                }


            }

            for (var x in this.rot_accel) {


                if (this.rot_accel[x] > 0 || this.rot_accel[x] < 0) {

                    this.rot_speed[x] += this.rot_accel[x];

                }
            }
        }

        /**
         * This function resolves a function nested in an object, from a string-key, and it is applied by Gamestack.js for persistence of data and Sprite() behaviors
         * @function
         * @memberof Sprite
         **********/

        resolveFunctionFromDoubleKeys(keyString1, keyString2, obj, callback) {

            callback(typeof obj[keyString1][keyString2] == 'function' ? obj[keyString1][keyString2] : {});

        }

        /**
         * This function extends an existing function, and is applied by Gamestack in onInit();
         * @function
         * @memberof Sprite
         **********/

        extendFunc(fun, extendedFunc) {

            console.log('extending func');

            var ef = extendedFunc;

            var __inst = this;

            return function () {


                ef(__inst);

                //any new function comes after

                fun(__inst);


            };

        }


        /*****************************
         *  onUpdate(fun)
         * -args: 1 function(sprite){ } //the self-instance/sprite is passed into the function()
         * -overrides and maintains existing code for update(){} function
         ***************************/


        /**
         * Extends the update() of this sprite with a new function to be called during update()
         * @function
         * @memberof Sprite
         * @param {function} the function to apply to the Sprite:update()
         **********/


        onUpdate(fun) {
            fun = fun || function () {
                };

            let update = this.update;

            let __inst = this;

            this.update = function (__inst) {
                update(__inst);
                fun(__inst);
            };

        }

        /*****************************
         *  travelLineTwoWay()
         *  -sprite travels line: any Line() or object with property of line
         ***************************/

        travelLineTwoWay(lineObject, speed, curveKey, offset) {

            speed = speed || 1;

            var motionCurveOptions = ["linear", "quadratic", "cubic"];

            curveKey = curveKey || "linear";

            var line = lineObject;

            if (lineObject.line) {
                line = lineObject.line;
            }

            this.__crtLineIx = this.__crtLineIx || 0;

            var __inst = this,

                pctFloat = __inst.__crtLineIx % ((line.points.length - 1) / 2) / ((line.points.length - 1) / 2);

            if (__inst.__crtLineIx >= ((line.points.length - 1) / 2)) {
                pctFloat = 1.0 - pctFloat;

            }

            var ixChange = Gamestack.Curves.InOut[curveKey](pctFloat) * speed * 0.5;

            if (curveKey == 'linear') {
                ixChange = speed;
            }

            ixChange = Math.round(ixChange);

            if (ixChange < 1) {
                ixChange = 1;
            }

            __inst.position = new Gamestack.Vector(line.points[__inst.__crtLineIx]);

            console.log(ixChange);

            __inst.__crtLineIx += ixChange;

            if (__inst.__crtLineIx >= line.points.length) {

                line.points = line.points.reverse();
                __inst.__crtLineIx = 0;
            }

            if (offset instanceof Gamestack.Vector) {
                this.position = this.position.add(offset);
            }


        }


        /*****************************
         *  travelLineTwoWay()
         *  -sprite travels line: any Line() or object with property of line
         ***************************/

        travelLineOnLoop(lineObject, speed, curveKey, offset) {

            speed = speed || 1;

            var motionCurveOptions = ["linear", "quadratic", "cubic"];

            curveKey = curveKey || "linear";

            var line = lineObject;

            if (lineObject.line) {
                line = lineObject.line;
            }

            this.__crtLineIx = this.__crtLineIx || 0;

            var __inst = this,

                pctFloat = __inst.__crtLineIx % ((line.points.length - 1) / 2) / ((line.points.length - 1) / 2);

            if (__inst.__crtLineIx >= ((line.points.length - 1) / 2)) {
                pctFloat = 1.0 - pctFloat;

            }

            var ixChange = Gamestack.Curves.InOut[curveKey](pctFloat) * speed * 0.5;

            if (curveKey == 'linear') {
                ixChange = speed;
            }

            ixChange = Math.round(ixChange);

            if (ixChange < 1) {
                ixChange = 1;
            }

            __inst.position = new Gamestack.Vector(line.points[__inst.__crtLineIx]);

            console.log(ixChange);

            __inst.__crtLineIx += ixChange;

            if (__inst.__crtLineIx >= line.points.length) {
                __inst.__crtLineIx = 0;
            }

            if (offset instanceof Gamestack.Vector) {
                this.position = this.position.add(offset);
            }


        }


        /**
         *
         * <ul>
         *     <li>A rectangular style position</li>
         *      <li>Takes another sprite as argument</li>
         *       <li>Returns basic true || false during runtime</li>
         * </ul>
         * @function
         * @memberof Sprite
         * @param {sprite}
         **********/


        /**
         * Get the true || false results of a Collision between two Sprites(), based on their position Vectors and Sizes
         * @function
         * @memberof Sprite
         * @param {Sprite} sprite the alternate Sprite to process collision with
         **********/


        collidesRectangular(sprite) {

            return Gamestack.Collision.spriteRectanglesCollide(this, sprite);

        }


        /*****************************
         *  shoot(sprite)
         *  -fire a shot from the sprite:: as in a firing gun or spaceship
         *  -takes options{} for number of shots anglePerShot etc...
         *  -TODO: complete and test this code
         ***************************/

        /**
         * Sprite fires a particle object
         * <ul>
         *     <li>Easy instantiator for bullets and propelled objects in GameStack</li>
         *     <li>*TODO: This function is not-yet implemented in GameStack</li>
         * </ul>
         * @function
         * @memberof Sprite
         * @param {options} *numerous args
         **********/


        /**
         * fire a projectile-sub Sprite from the Sprite
         * @function
         * @memberof Sprite
         * @param {Object} options an object of arguments
         * @param {Gamestack.Animation} animation the animation to fire from the Sprite
         * @param {number} speed the speed of the shot that is projected
         * @param {Gamestack.Vector} position the initial position of the shot: defaults to current Sprite position
         * @param {Gamestack.Vector} size the Vector size of the shot
         * @param {Gamestack.Vector} rot_offset the rotational offset to apply: controls direction of the shot
         **********/

        shoot(options, gw) {

            //character shoots an animation

            gw = gw || Gamestack.game_windows[0];

            this.prep_key = 'shoot';

            let animation = options.bullet || options.animation || options.anime || new Gamestack.Animation();

            let speed = options.speed || options.velocity || 1;


            let size = options.size || new Gamestack.Vector(10, 10, 0);

            let position = new Gamestack.Vector(options.position) || new Gamestack.Vector(this.position);

            if(options.offset instanceof Gamestack.Vector)
            {
                var offset = options.offset;

                if(this.flipY)
                {
                  position =  new Gamestack.Vector(position.x + offset.x, position.y - offset.y);
                }
                else
                {
                    position = this.flipX ?  new Gamestack.Vector(position.x - offset.x, position.y + offset.y) : position.add(options.offset);

                }


            }


            let rot_offset = options.rot_offset || options.rotation || 0;

            let total = options.total || 1;

            let rot_disp = options.rot_disp || 0;//the full rotational-dispersion of the bullets

            let curve = options.curve, curve_size = options.curve_size, curve_growth = options.curve_growth || 1.0;

            let curve_key = options.curve_key || 'quintic';

            let life = options.life || 900;


            var shots = [];

            for (var x = 0; x < total; x++) {

                var __playerInst = this;

                if (__gameInstance.isAtPlay) {

                    var bx = position.x, by = position.y, bw = size.x, bh = size.y;

                    var shot = new Gamestack.Sprite({

                        active: true,

                        position: new Gamestack.Vector(position),

                        animation:animation,

                        size: new Gamestack.Vector(size),

                        image: animation.image,

                        rotation: new Gamestack.Vector(0, 0, 0),

                        flipX: false,

                        life: options.life

                    });

                    shot.noScroll = true;

                    shot.setAnimation(animation);

                    rot_offset = new Gamestack.Vector(rot_offset, 0, 0);

                    if(this.flipX)
                    {
                        //transpose rotation offset over -90;

                        if(rot_offset.x < 0) {

                            rot_offset.x = -90 - Math.abs(90 - Math.abs(rot_offset.x));

                        }
                        else
                        {
                            rot_offset.x = 90 + Math.abs(90 - Math.abs(rot_offset.x));

                        }

                    }

                    shot.position.x = bx, shot.position.y = by;

                    //Danger On this line: annoying math --dispersing rotation of bullets by rot_disp

                    var div = rot_disp / total;

                    var rotPlus = div * x + div / 2 - rot_disp / 2;

                    shot.rotation.x = rot_offset.x + rotPlus;

                    shot.origin = new Gamestack.Vector(position);

                    shot.speed = new Gamestack.Vector(Math.cos((shot.rotation.x) * 3.14 / 180) * speed, Math.sin((shot.rotation.x) * 3.14 / 180) * speed);

                    shots.push(shot);

                    if (!curve) {

                        shot.onUpdate(function (spr) {
                            // console.log('update:rotation:' + shot.rotation.x);


                        });
                    }
                    else {

                        shot.ticker = 0;

                        var r = shot.rotation.x + 0;

                        shot.line = new Gamestack.CurvedLine().Pos(position)
                            .Curve(curve_key).SegmentSize(curve_size)
                            .MaxSize(2000).Growth(1.5).Rotate(r).Fill();

                        shot.onUpdate(function (spr) {

                            spr.selected_animation.continuous();

                            spr.ticker += 1;

                            if (spr.ticker < spr.line.points.length)
                                spr.position = new Gamestack.Vector(spr.line.points[spr.ticker]);

                        });
                    }

                    gw.add(shot);

                }

            }

            return shots;

        }

        /**
         * create a subsprite of Sprite belonging to the current Sprite
         * @function
         * @memberof Sprite
         * @param {Object} options an object of arguments
         * @param {Animation} animation the animation to fire from the Sprite
         * @param {number} speed the speed of the shot that is projected
         * @param {Gamestack.Vector} position the initial position of the shot: defaults to current Sprite position
         * @param {Vector} size the Vector size of the shot
         * @param {Vector} offset the positional offset to apply
         **********/

        subsprite(options, gw) {

            gw = gw || Gamestack.game_windows[0];

            let animation = options.animation || new Gamestack.Animation();

            let position = options.position || new Gamestack.Vector(this.position);

            let offset = options.offset || new Gamestack.Vector(0, 0, 0);

            let size = new Gamestack.Vector(options.size || this.size);

            if (__gameInstance.isAtPlay) {

                var subsprite = gw.add(new Gamestack.Sprite({

                    active: true,

                    position: position,

                    size: size,

                    offset: offset,

                    image: animation.image,

                    rotation: new Gamestack.Vector(0, 0, 0),

                    flipX: false,

                    scrollFactor: this.scrollFactor,

                    noScroll: this.noScroll

                }));

                subsprite.setAnimation(animation);

                return subsprite;

            }
            else {
                alert('No subsprite when not at play');

            }

        }


        /**
         * animate Sprite.selected_animation  by one frame
         * @function
         * @memberof Sprite
         * @param {Animation} animation to use, defaults to Sprite.selected_animation
         **********/

        animate(animation) {

            if (__gameInstance.isAtPlay) {

                if (animation) {
                    this.setAnimation(animation)
                }

                this.selected_animation.animate();

            }

        }

        /**
         * run a function when the Sprite.selected_animation is complete
         *
         * @function
         * @memberof Sprite
         * @param {Function} fun the function to call when the animation is complete
         *
         **********/

        onAnimationComplete(fun) {
            this.selected_animation.onComplete(fun);

        }

        /*****************************
         *  accelY
         *  -accelerate on Y-Axis with 'accel' and 'max' (speed) arguments
         *  -example-use: gravitation of sprite || up / down movement
         ***************************/

        /**
         * accelerate speed on the Y-Axis
         *
         * @function
         * @memberof Sprite
         * @param {number} accel the increment of acceleration
         * @param {number} max the maximum for speed
         *
         **********/

        accelY(accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {y: max};

            }

            this.assertSpeed();

            let diff = max.y - this.speed.y;

            if (diff > 0) {
                this.speed.y += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                this.speed.y -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  accelX
         *  -accelerate on X-Axis with 'accel' and 'max' (speed) arguments
         *  -example-use: running of sprite || left / right movement
         ***************************/


        /**
         * accelerate speed on the X-Axis
         *
         * @function
         * @memberof Sprite
         * @param {number} accel the increment of acceleration
         * @param {number} max the maximum for speed
         *
         **********/


        accelX(accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {x: max};

            }

            this.assertSpeed();

            let diff = max.x - this.speed.x;

            if (diff > 0) {
                this.speed.x += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                this.speed.x -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  accel
         *  -accelerate any acceleration -key
         ***************************/


        /**
         * accelerate toward a max value on any object-property:: intended for self-use
         *
         * @function
         * @memberof Sprite
         * @param {Object} prop The object to control
         * @param {string} key the property-key for targeted property of prop argument
         *
         * @param {number} accel the increment of acceleration
         *
         * @param {number} max the max value to accelerate towards
         *
         *
         **********/

        accel(prop, key, accel, max) {

            accel = Math.abs(accel);

            if (typeof(max) == 'number') {
                max = {x: max};

            }

            let speed = prop[key];

            // this.assertSpeed();

            let diff = max.x - prop[key];

            if (diff > 0) {
                prop[key] += Math.abs(diff) >= accel ? accel : diff;

            }
            ;

            if (diff < 0) {
                prop[key] -= Math.abs(diff) >= accel ? accel : diff;

            }
            ;

        }


        /*****************************
         *  decel
         *  -deceleration -key
         ***************************/

        /**
         * decelerate toward a max value on any object-property:: intended for self-use
         *
         * @function
         * @memberof Sprite
         * @param {Object} prop The object to control
         * @param {string} key the property-key for targeted property of prop argument
         *
         * @param {number} decel the increment of deceleration
         *
         * @param {number} max the max value to decelerate towards
         *
         *
         **********/

        decel(prop, key, rate) {
            if (typeof(rate) == 'object') {

                rate = rate.rate;

            }

            rate = Math.abs(rate);

            if (Math.abs(prop[key]) <= rate) {
                prop[key] = 0;
            }

            else if (prop[key] > 0) {
                prop[key] -= rate;

            }
            else if (prop[key] < 0) {
                prop[key] += rate;

            }
            else {

                prop[key] = 0;

            }
        }


        /*****************************
         *  decelY
         *  -decelerate on the Y axis
         *  -args: 1 float:amt
         ***************************/


        /**
         * decelerate speed on the Y-Axis, toward zero
         *
         * @function
         * @memberof Sprite
         * @param {number} amt the increment of deceleration, negatives ignored
         *
         **********/

        decelY(amt) {

            amt = Math.abs(amt);

            if (Math.abs(this.speed.y) <= amt) {
                this.speed.y = 0;

            }
            else if (this.speed.y > amt) {

                this.speed.y -= amt;
            }
            else if (this.speed.y < amt * -1) {

                this.speed.y += amt;
            }

        }

        /*****************************
         *  decelX
         *  -decelerate on the X axis
         *  -args: 1 float:amt
         ***************************/


        /**
         * decelerate speed on the X-Axis, toward zero
         *
         * @function
         * @memberof Sprite
         * @param {number} amt the increment of deceleration, negatives ignored
         *
         **********/

        decelX(amt) {

            amt = Math.abs(amt);


            if (this.speed.x > amt) {

                this.speed.x -= amt;
            }
            else if (this.speed.x < amt * -1) {

                this.speed.x += amt;
            }

            if (Math.abs(this.speed.x) <= amt) {

                this.speed.x = 0;

            }

        }


        shortest_stop(item, callback) {
            var diff_min_y = item.min ? item.min.y : Math.abs(item.position.y - this.position.y + this.size.y);

            var diff_min_x = item.min ? item.min.x : Math.abs(item.position.x - this.position.x + this.size.x);

            var diff_max_y = item.max ? item.max.y : Math.abs(item.position.y + item.size.y - this.position.y);

            var diff_max_x = item.max ? item.max.x : Math.abs(item.position.x + item.size.x - this.position.y);

            var dimens = {top: diff_min_y, left: diff_min_x, bottom: diff_max_y, right: diff_max_x};

            var minkey = "", min = 10000000;

            for (var x in dimens) {
                if (dimens[x] < min) {
                    min = dimens[x];
                    minkey = x; // a key of top left bottom or right

                }
            }

            callback(minkey);

        }


        /**
         * get the center of a Sprite
         *
         * @function
         * @memberof Sprite
         *
         * @returns (Vector)
         *
         **********/

        center() {


            return new Gamestack.Vector(this.position.x + this.size.x / 2, this.position.y + this.size.y / 2, 0);

        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * determine if Sprite overlaps on X axis with another Sprite
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         * @param {number} padding the 0-1.0 float value of padding to use on self when testing overlap
         * @returns {var} a true || false var
         *
         **********/

        overlap_x(item, padding) {
            if (!padding) {
                padding = 0;
            }

            var paddingX = Math.round(padding * this.size.x),

                paddingY = Math.round(padding * this.size.y), left = this.position.x + paddingX,
                right = this.position.x + this.size.x - paddingX,

                top = this.position.y + paddingY, bottom = this.position.y + this.size.y - paddingY;

            return right > item.position.x && left < item.position.x + item.size.x;


        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * determine if Sprite overlaps on Y axis with another Sprite
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         * @param {number} padding the 0-1.0 float value of padding to use on self when testing overlap
         * @returns (true || false}
         *
         **********/

        overlap_y(item, padding) {
            if (!padding) {
                padding = 0;
            }

            var paddingX = Math.round(padding * this.size.x),

                paddingY = Math.round(padding * this.size.y), left = this.position.x + paddingX,
                right = this.position.x + this.size.x - paddingX,

                top = this.position.y + paddingY, bottom = this.position.y + this.size.y - paddingY;

            return bottom > item.position.y && top < item.position.y + item.size.y;

        }


        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/



        collide_stop_x(item) {

            var apart = false;

            var ct = 10000;

            while (!apart && ct > 0) {

                ct--;

                var diffX = this.center().sub(item.center()).x;

                var distX = Math.abs(this.size.x / 2 + item.size.x / 2 - Math.round(this.size.x * this.padding.x));

                if (Math.abs(diffX) < distX) {

                    this.position.x -= diffX > 0 ? -1 : 1;


                }
                else {

                    this.speed.x = 0;

                    apart = true;


                }


            }


        }

        Life(v) {
            this.life = v;

            return this;

        }

        /*************
         * #BE CAREFUL
         * -with this function :: change sensitive / tricky / 4 way collision
         * *************/


        /**
         * cause a fourway collision-stop between this and another Sprite :: objects will behave clastically and resist passing through one another
         *
         * @function
         * @memberof Sprite
         * @param {Sprite} item the Sprite to compare with
         *
         **********/

        collide_stop(item) {

            if (this.id == item.id) {
                return false;

            }

            // this.position = this.position.sub(this.speed);

            if (this.collidesRectangular(item)) {

                var diff = this.center().sub(item.center());

                if (this.overlap_x(item, this.padding.x + 0.1) && Math.abs(diff.x) < Math.abs(diff.y)) {

                    var apart = false;

                    var ct = 10000;

                    while (!apart && ct > 0) {

                        ct--;

                        var diffY = this.center().sub(item.center()).y;

                        var distY = Math.abs(this.size.y / 2 + item.size.y / 2 - Math.round(this.size.y * this.padding.y));

                        if (Math.abs(diffY) < distY) {

                            this.position.y -= diffY > 0 ? -1 : diffY < 0 ? 1 : 0;

                            this.position.y = Math.round(this.position.y);

                        }

                        else {

                            if (diffY <= 0) {
                                this.__inAir = false;
                            }
                            ;

                            this.speed.y = 0;

                            return apart = true;


                        }


                    }


                }


                if (this.overlap_y(item, this.padding.y) && Math.abs(diff.y) < Math.abs(diff.x)) {

                    this.collide_stop_x(item);

                }


            }


        }


        collide_stop_top(item) {


            if (this.id == item.id) {
                return false;

            }

            if (this.overlap_x(item, this.padding.x + 0.1)) {

                console.log('OVERLAP_X');

                var paddingY = this.padding.y * this.size.y;

                if (this.position.y + this.size.y - paddingY <= item.position.y) {

                    this.groundMaxY = item.position.y - this.size.y + paddingY;

                }

            }

        }


        /**
         * Restore a sprite from saved .json data
         *
         * @function
         * @memberof Sprite
         *
         * @returns (Sprite)
         **********/

        restoreFrom(data) {

            data.image = new GameImage(data.src || data.image.src);

            return new Gamestack.Sprite(data);

        }


        /*****************************
         *  fromFile(file_path)
         *  -TODO : complete this function based on code to load Sprite() from file, located in the spritemaker.html file
         *  -TODO: test this function
         ***************************/

        fromFile(file_path) {

            if (typeof file_path == 'string') {

                var __inst = this;

                $.getJSON(file_path, function (data) {

                    __inst = new Gamestack.Sprite(data);

                });
            }
        }

        toJSONString() {
            for (var x = 0; x < this.motions.length; x++) {
                this.motions[x].parent = false;
            }

            return jstr(this);
        }

    }
    ;


    /****************
     * TODO : Complete SpritePresetsOptions::
     *  Use these as options for Sprite Control, etc...
     ****************/



        //SpriteInit: A gamestack method of initializing Sprites with behaviors.
        //meant for auto-setting of Sprite behaviors from GS-PC-Tools

    class SpriteInit
    {

        constructor(args={})
        {




        }




    };

    function ControllerTestOptionArgs(args)
    {
        args= args || {};

        this.accel = args.accel || 0.2;

        this.decel = args.decel || 0.2;

        this.max = args.max || 5.0;

        this.flipX = args.flipX || false; //flipX on negativeX

        this.flipY = args.flipY || false; //flipY on negativeY

        this.threshold = args.threshold || 0.2; //minimum ctrl_stick value

    };


    function SimpleGravityArgs(args)
    {
        args= args || {};

        this.accel = args.accel || 0.2;

        this.max = args.max || 5.0;

    };



    Sprite.prototype.GravityTestOptionArgs = function(args)
    {

        this.accel = args.accel || args.gravity || 0.2;

        this.max = args.max || new Gamestack.Vector(0, 10, 0);

    };

    Gamestack.Sprite = Sprite;


    let SpriteInitializersOptions = {

        ControllerTestOptions : {

            __args:new ControllerTestOptionArgs(),

            stick_move_x: function (sprite, optionArgs = new ControllerTestOptionArgs({flipX:true})) {

                alert('applying controller-test options');

                Gamestack.GamepadAdapter.on("stick_left", 0, function (x, y) {

                    console.log('stick movement:');

                    var THRESHOLD = optionArgs.threshold || 0.2;

                    if (Math.abs(x) < THRESHOLD) {
                        sprite.movingX = false;
                        return 0;
                    }

                    sprite.movingX = true;

                    var accel = optionArgs.accel || 0.2; //todo : options for accel
                    var max = optionArgs.max || 7;

                    sprite.accelX(accel, x * max);

                    if (x < -THRESHOLD && optionArgs.flipX) {
                        sprite.flipX = true;

                    }
                    else if (x > THRESHOLD && optionArgs.flipX) {

                        sprite.flipX = false;

                    }

                });

                sprite.onUpdate(function (spr) {

                    if(!spr.movingX){spr.decelX(0.1)};

                });


            },

            stick_move_y: function (sprite, optionArgs = new ControllerTestOptionArgs()) {

                alert('applying controller-test options');

                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                    console.log('stick movement:');

                    var THRESHOLD = optionArgs.threshold || 0.2;

                    if (Math.abs(y) < THRESHOLD) {

                        sprite.movingY = false;

                        return 0;
                    }


                    sprite.movingY = true;

                    var accel = optionArgs.accel || 0.2; //todo : options for accel
                    var max = optionArgs.max || 7;

                    sprite.accelY(accel, y * max);

                    if (y < -THRESHOLD && optionArgs.flipY) {

                        sprite.flipY = true;

                    }
                    else if (y > THRESHOLD && optionArgs.flipY) {

                        sprite.flipY = false;

                    }

                });

                var decel = optionArgs.decel || 0.2;

                sprite.onUpdate(function (spr) {

                    if (!spr.__falling && !spr.movingY) {
                        spr.decelY(decel)
                    }
                    ;

                });
            }

        },

        MainGravity: {

            __args:new SimpleGravityArgs(),

            basic2D_gravity: function (sprite, gravityArgs = new SimpleGravityArgs()) {

                var gw =Gamestack.game_windows[0];
                //Add a gravity to the game

                var gravity = gw.add(new Gamestack.Force({

                    accel: gravityArgs.accel ||  0.05,

                    max: gravityArgs.max || new Gamestack.Vector(0, 3.5, 0),

                    subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                    clasticObjects: [] //an empty array of collideable objects

                }));

                sprite.onUpdate(function () {


                });

            }
        },

    collision : {

        fourway_stop:function (sprite) {

            sprite = sprite || __inst;

            sprite.collision_settings.Fourway();

            var gameWindow = Gamestack.game_windows[0];

            for (var x in gameWindow.forces) {

                var force = gameWindow.forces[x];

                force.clasticObjects.push(sprite);

            }

            sprite.onUpdate(function () {


            });

        }
    ,

        top_stop:function (sprite) {

            sprite = sprite || __inst;

            sprite.collision_settings.Top();

            var gameWindow = Gamestack.game_windows[0];

            for (var x in gameWindow.forces) {

                var force = gameWindow.forces[x];

                force.clasticObjects.push(sprite);

            }

            sprite.onUpdate(function () {


            });

        }
    }

    };



    Gamestack.Sprite = Sprite;


    Gamestack.options = Gamestack.options || {};

    Gamestack.options.SpriteInitializers = SpriteInitializersOptions;


})();
;(function () {
    console.log('Vector class... creating');


    /**
     * Gamestack.Vector: Takes arguments of x, y, and (optionally) z, instantiates Vector object

     <ul>
     <li>Optional: use a Vector as the 'x' argument, and instantiate new distinct Vector from the argument</li>
     </ul>

     * @param   {number} x the x coordinate
     * @param   {number} y the y coordinate
     * @param   {number} z the z coordinate
     * @returns {Vector} a Vector object
     */

    class Vector {
        constructor(x, y, z, r) {

            if (typeof(x) == 'object' && x.hasOwnProperty('x') && x.hasOwnProperty('y')) //optionally pass vector3
            {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z || 0;

                if (this.z == null) {
                    this.z = 0;
                }

                this.valid_check();

                return this;
            }

            if (z == null) {
                z = 0;
            }

            this.x = x;
            this.y = y;
            this.z = z;
            this.r = r;

            this.valid_check();

        }

        valid_check() {
            if (this.x == undefined || this.y == undefined || this.z == undefined) {
                this.x = 0;
                this.y = 0;
                this.z = 0;
            }


        }

        sub(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x - v.x, this.y - v.y, this.z - v.z);

        }

        add(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x + v.x, this.y + v.y, this.z + v.z);

        }

        mult(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x * v.x, this.y * v.y, this.z * v.z);

        }

        div(v) {
            if (typeof(v) == 'number') {
                v = {x: v, y: v, z: v};
            }
            ;

            return new Gamestack.Vector(this.x / v.x, this.y / v.y, this.z / v.z);
        }

        round() {
            return new Gamestack.Vector(Math.round(this.x), Math.round(this.y), Math.round(this.z));

        }

        floor() {
            return new Gamestack.Vector(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));

        }

        ceil() {
            return new Gamestack.Vector(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));

        }

        equals(v) {

            return this.x == v.x && this.y == v.y && this.z == v.z;
        }

        trig_distance_xy(v) {

            var dist = this.sub(v);

            return Math.sqrt(dist.x * dist.x + dist.y * dist.y);

        }

        diff() {
            //TODO:this function


        }

        abs_diff() {
            //TODO:this function

        }

        is_between(v1, v2) {
            //TODO : overlap vectors return boolean

            return this.x >= v1.x && this.x <= v2.x &&
                this.y >= v1.y && this.y <= v2.y &&
                this.z >= v1.z && this.z <= v2.z;


        }

        randomize(minFloat, maxFloat)
        {

            var random = (Math.random() * (maxFloat - minFloat) + minFloat) * 1000 / 1000;

            return this.mult(random);

        }

        rotationalSpeedPoint(rotation, speed)
        {
            var r = rotation;

            if(typeof(rotation) == 'object' && rotation.x)
            {
                r = rotation.x;
            }

           return new Gamestack.Vector(Math.cos((r) * 3.14 / 180) * speed, Math.sin((r) * 3.14 / 180) * speed);

        }

        angleBetween(p1, p2)
        {

            return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
        }

    }
    ;


    let Vector3 = Vector, Pos = Vector, Size = Vector, Position = Vector, Vector2 = Vector, Rotation = Vector;

    Gamestack.Vector = Vector;

    Gamestack.Rotation = Vector;

    Gamestack.Pos = Vector;

    Gamestack.Position = Vector;

    Gamestack.Size = Vector;


//The above are a list of synonymous expressions for Vector. All of these do the same thing in this library (store x,y,z values)


//SuperVector() : handles all advanced Vector mathematics for any class requiring Vector math

var VectorMath = {

    rotatePointsXY(x, y, angle) {

        var theta = angle * Math.PI / 180;

        var point = {};
        point.x = x * Math.cos(theta) - y * Math.sin(theta);
        point.y = x * Math.sin(theta) + y * Math.cos(theta);

        point.z = 0;

        return point
    }

}

Gamestack.VectorMath = VectorMath;

})();;class Background extends Gamestack.Sprite {

    constructor(args = {}, arg2, arg3) {
        super(args, arg2, arg3); //init as Gamestack.Sprite()

        this.type = args.type || "parallax" || "basic" || false;

        this.source_objects = args.objects || args.source_objects || [];

        this.members = [];

        this.rows = args.rows || 1;//The Y number of repititions

        this.cols = args.cols || 1; //The X number of repetitions of the images

        this.flip = args.flip || false;

        this.fill = args.fill || false;

        this.noScroll = args.noScroll || false;

        this.scrollFactor = args.scrollFactor || 1.0;

        if(this.noScroll){ this.scrollFactor = 0; };

        this.flip = args.flip || false;

        var __inst = this;

    }

    Flip(value)
    {
        if(value == undefined)
        {
            this.flip = true;
        }
        else if (value == true || value == false) {
            this.flip = value;

        }

        return this;
    }

    Rows(r)
    {
        this.rows = r;
        return this;
    }

    Cols(c)
    {
        this.cols = c;
        return this;
    }

    ScrollFactor(sf)
    {
        this.scrollFactor = sf;
        return this;
    }

    Fill(approxRows, approxCols, gw)
    {


        approxRows = approxRows || this.rows || 1;

        approxCols = approxCols || this.cols || 1;

        this.members.push(new Background(this)); //"This" or base image is always applied

        for(var x = 0; x < this.source_objects.length; x++)
        {
            this.members.push(new Background(this.source_objects[x]));//src strings OR Sprites()
        }

        gw = gw || Gamestack.game_windows[0];

        var w= gw.canvas.width, h = gw.canvas.height,
            xBacksTotal = Math.floor(approxRows / 2), yBacksTotal =  Math.floor(approxCols / 2);

        var __inst = this;

        //create first row:

        for(var y = -yBacksTotal; y <= yBacksTotal + 1; y++)
        {
            console.log('adding background:' + y);


            for(var x = -xBacksTotal; x <= xBacksTotal + 1; x++)
            {

                this.members.push(new Background(this));

                var b = this.members[this.members.length - 1];

                b.setSize(this.size);

                var __inst = this;


                b.position.x = x * this.size.x;

                b.position.y = y * this.size.y;



                b.minX = -xBacksTotal * b.size.x + b.size.x;

                b.maxX = (xBacksTotal + 1) * b.size.x ;

                b.minY = -yBacksTotal * b.size.y + b.size.y;

                b.maxY = yBacksTotal * b.size.y ;


                if(x % 2 == 0)
                {
                    b.flipX = true;

                }

                if(y % 2 == 0)
                {
                    b.flipY = true;

                }



                b.onUpdate(function(spr){

                    spr.campos = gw.camera.position;

                    var cx = spr.campos.x - (spr.campos.x  % spr.size.x), cy = spr.campos.y - ( spr.campos.y % spr.size.y );

                    if(spr.position.x - cx < spr.minX)
                    {

                        spr.position.x = spr.maxX + cx;

                    }

                    if(spr.position.x - cx > spr.maxX)
                    {

                        spr.position.x = spr.minX + cx;

                    }

                    if(spr.position.y - cy < spr.minY)
                    {

                        spr.position.y = spr.maxY + cy;

                    }

                    if(spr.position.y - cy > spr.maxY)
                    {

                        spr.position.y = spr.minY + cy;

                    }

                });

                gw.add(b); //add to window

            }

        }

        return this;
    }

    add(object)
    {
        var cleanCheck = object instanceof Gamestack.Sprite || object instanceof Array && object[0] instanceof Gamestack.Sprite; //is Sprite

        if(!cleanCheck)
        {
            return console.error('Must have: valid contents (Gamestack.Sprite OR [] of Gamestack.Sprite())');
        }

        if(object instanceof Array)
        {
            this.source_objects.cancat(object)
        }
        else
        {
            this.source_objects.push(object);
        }

        return this;
    }

}

Gamestack.Background = Background;;


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


})();;


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


})();;


/**
 * Takes array of image-src (string) and returns MultiSource

 * @param   {number} x the x coordinate
 * @param   {number} y the y coordinate
 * @param   {number} z the z coordinate
 * @returns {MultiSourceImage} a MultiSourceImage object
 */

class MultiSourceImage {

    constructor(sources, maxWidth, maxHeight) {

        var ctload = 0;

        var sprites = [];

        var canvas = document.createElement('CANVAS');

        this.canvas  = canvas;

        this.canvas.width = maxWidth || 14000;

        this.canvas.height = maxHeight || 14000;

        this.ctx = this.canvas.getContext('2d');

        this.sources = [];

        var __inst = this;

        this.animation = {};

        Gamestack.Canvas.allowOffscreen(10000);

        function getMax(objList, key1, key2)
        {
            var max = 0;

            for(var x in objList)
            {

                if(objList[x][key1][key2] > max)
                {

                    max = objList[x][key1][key2];
                }

            }

            return max;
        };

        for(var x = 0; x < sources.length; x++)
        {
            if(sources[x] instanceof File)
            {
                handleFile(URL.createObjectURL(sources[x]));
            }
            else
            {
                handleFile(sources[x]);
            }

            function handleFile(source)
            {
                __inst.sources.push(source);

                sprites.push(new Gamestack.Sprite(source));

                var sprite = sprites[sprites.length - 1];

                sprite.__imageIx = x;

                sprite.noScroll = true;


                function load(){

                    ctload += 1;

                    if(ctload >= sources.length) {

                        __inst.ctx = __inst.canvas.getContext('2d');


                        var greatestWidth = greatestWidth || 0, greatestHeight = greatestHeight || 0;

                        __inst.xfactor = 0;

                        __inst.yfactor = 0;

                        Gamestack.each(sprites, function (ix, s) {

                            s.size = new Gamestack.Vector( s.image.domElement.width,  s.image.domElement.height);

                            __inst.frameSize = s.size;

                            s.xfactor = Math.floor(__inst.canvas.width / s.size.x);

                            s.yfactor = Math.floor(s.__imageIx / s.xfactor);

                            if(s.xfactor > __inst.xfactor)
                            {
                                __inst.xfactor = s.xfactor;
                            }

                            if(s.yfactor > __inst.yfactor)
                            {
                                __inst.yfactor = s.yfactor;
                            }

                            var posX = (s.__imageIx % s.xfactor) * s.size.x,

                                posY = Math.floor(s.__imageIx / s.xfactor) * s.size.y;

                            //TEST MODE Using first gameWindow

                            s.position = new Gamestack.Vector(posX, posY);


                        });

                        greatestHeight = getMax(sprites, 'position', 'y') + sprites[0].size.y;

                        greatestWidth = getMax(sprites, 'position', 'x') + sprites[0].size.x;

                        __inst.width = greatestWidth;

                        __inst.height = greatestHeight;

                        __inst.canvas.width = greatestWidth;

                        __inst.canvas.height = greatestHeight;


                        Gamestack.each(sprites, function (ix, s) {

                            Gamestack.Canvas.draw(s, __inst.ctx);

                        });

                        if (__inst.load) {

                            __inst.load(__inst);

                        }

                    }

                }

                sprite.afterLoad(function(spr){

                    load();

                });
            };


        }
    }

    onLoad(callback)
    {

        this.load = callback;

    }
}



Gamestack.MultiSourceImage = MultiSourceImage;

Gamestack.MultiSource = MultiSourceImage;
;


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
;
var THREE_EXT = {

    defaults:{

        DodecahedronGeometry:{radius:1, detail:0},

        SphereGeometry:{radius:5, widthSegments:32, heightSegments:32},

        BoxGeometry:{

            width:20,

            height:20,

            depth:20

        },

        CylinderGeometry:{radiusTop:5, radiusBottom:5, height:20, heightSegments:32},

        TorusGeometry:{radius:10, tube:3, radialSegments:16, tubularSegments:100 }
    }

}

class Three extends Gamestack.Sprite //dependency: THREE.js
{
    constructor(args = {}, arg2, arg3) {
        super(args, arg2, arg3); //init as Gamestack.Sprite()

       if(!THREE) //THREE.js library must be loaded
       {
           return console.error('ThreeJSObject():Library: Three.js is required for this object.');

       }

        this.scene =  new THREE.Scene();

       if(args.geometry instanceof String && THREE[args.geometry])
       {
           this.geometry = new THREE[args.geometry]();
       }
       else {

           this.geometry = args.geometry || new THREE.TorusGeometry(50, 10, 16, 100);
       }

        this.scene.add( new THREE.AmbientLight( 0xffffff, 1.0  ) );


        this.renderer = Gamestack.renderer || new THREE.WebGLRenderer({
                preserveDrawingBuffer: true,
                alpha:true
            });

        this.renderer.setSize(1000, 1000);

        this.camera = new THREE.PerspectiveCamera(70, 1, 1, 1000);

        this.camera.position.z = 1000 / 8;

        var __inst = this;

        var src = args.src || "../assets/game/image/tiles/perlin_3.png";

        __inst.loader = new THREE.TextureLoader();

        __inst.loader.load( src, function ( texture ) {

            __inst.material = args.material || new THREE.MeshPhongMaterial({
                    map: texture
                });

            if(!__inst.__init) {

                __inst.mesh = new THREE.Mesh(__inst.geometry, __inst.material);

                __inst.scene.add(__inst.mesh);

                __inst.__init = true;

            }

            //__inst.mesh.size.set(__inst.size);

            __inst.renderer.render(__inst.scene, __inst.camera);

            __ServerSideFile.file_upload('test.png', __inst.renderer.domElement.toDataURL('image/png'), function(relpath, content){

                relpath = relpath.replace('client/', '../');

                __inst.selected_animation = new Animation({src:relpath, frameSize:new Vector(1000, 1000), frameBounds:new VectorFrameBounds(new Vector(0, 0, 0), new Vector(0, 0, 0),new Vector(0, 0, 0))}).singleFrame();

                __inst.selected_animation.image.domElement.onload = function()
                {

                    __inst.setSize(new Vector(__inst.selected_animation.image.domElement.width, __inst.selected_animation.image.domElement.height));

                    __inst.selected_animation.animate();


                    console.log(jstr(__inst.selected_animation.frames));

                };

            });



        } );




    }

    three_update()
    {
        console.log('THREE --GS-Object UPDATE');

        this.mesh.rotation.y += 0.05;

        this.renderer.clear();

        this.renderer.setSize(this.size.x, this.size.y);

        var pixels = new Uint8Array(this.size.x * this.size.y * 4);

        this.renderer.render(this.scene, this.camera);

        var gl = this.renderer.getContext();

        gl.readPixels( 0, 0, this.size.x, this.size.y, gl.RGBA, gl.UNSIGNED_BYTE, pixels );

        this.selected_animation.selected_frame = {image:{}};

        this.selected_animation.selected_frame.image.data = new ImageData(new Uint8ClampedArray(pixels), this.size.x, this.size.y);

    }
    applyAnimativeState()
    {


    }
};if (typeof JSON.decycle !== 'function') {
    JSON.decycle = function decycle(object) {
        "use strict";

        var objects = [],   // Keep a reference to each unique object or array
            paths = [];     // Keep the path to each unique object or array

        return (function derez(value, path) {


            var i,          // The loop counter
                name,       // Property name
                nu;         // The new object or array

            switch (typeof value) {
            case 'object':

                if (!value) {
                    return null;
                }


                for (i = 0; i < objects.length; i += 1) {
                    if (objects[i] === value) {
                        return {$ref: paths[i]};
                    }
                }

// Otherwise, accumulate the unique value and its path.

                objects.push(value);
                paths.push(path);

// If it is an array, replicate the array.

                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    nu = [];
                    for (i = 0; i < value.length; i += 1) {
                        nu[i] = derez(value[i], path + '[' + i + ']');
                    }
                } else {

// If it is an object, replicate the object.

                    nu = {};
                    for (name in value) {
                        if (Object.prototype.hasOwnProperty.call(value, name)) {
                            nu[name] = derez(value[name],
                                path + '[' + JSON.stringify(name) + ']');
                        }
                    }
                }
                return nu;
            case 'number':
            case 'string':
            case 'boolean':
                return value;
            }
        }(object, '$'));
    };
}

if (typeof JSON.retrocycle !== 'function') {
    JSON.retrocycle = function retrocycle($) {
        "use strict";

        var px =
            /^\$(?:\[(?:\d?|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

        (function rez(value) {

            var i, item, name, path;

            if (value && typeof value === 'object') {
                if (Object.prototype.toString.apply(value) === '[object Array]') {
                    for (i = 0; i < value.length; i += 1) {
                        item = value[i];
                        if (item && typeof item === 'object') {
                            path = item.$ref;
                            if (typeof path === 'string' && px.test(path)) {
                                value[i] = eval(path);
                            } else {
                                rez(item);
                            }
                        }
                    }
                } else {
                    for (name in value) {
                        if (typeof value[name] === 'object') {
                            item = value[name];
                            if (item) {
                                path = item.$ref;
                                if (typeof path === 'string' && px.test(path)) {
                                    value[name] = eval(path);
                                } else {
                                    rez(item);
                                }
                            }
                        }
                    }
                }
            }
        }($));
        return $;
    };
}



;/**
 * @author mrdoob / http://mrdoob.com/
 *
 * @ignore
 *
 */

var Stats = function () {

	var mode = 0;

	var container = document.createElement( 'div' );
	container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
	container.addEventListener( 'click', function ( event ) {

		event.preventDefault();
		showPanel( ++ mode % container.children.length );

	}, false );

	//

	function addPanel( panel ) {

		container.appendChild( panel.dom );
		return panel;

	}

	function showPanel( id ) {

		for ( var i = 0; i < container.children.length; i ++ ) {

			container.children[ i ].style.display = i === id ? 'block' : 'none';

		}

		mode = id;

	}

	//

	var beginTime = ( performance || Date ).now(), prevTime = beginTime, frames = 0;

	var fpsPanel = addPanel( new Stats.Panel( 'FPS', '#0ff', '#002' ) );
	var msPanel = addPanel( new Stats.Panel( 'MS', '#0f0', '#020' ) );

	if ( self.performance && self.performance.memory ) {

		var memPanel = addPanel( new Stats.Panel( 'MB', '#f08', '#201' ) );

	}

	showPanel( 0 );

	return {

		REVISION: 16,

		dom: container,

		addPanel: addPanel,
		showPanel: showPanel,

		begin: function () {

			beginTime = ( performance || Date ).now();

		},

		end: function () {

			frames ++;

			var time = ( performance || Date ).now();

			msPanel.update( time - beginTime, 200 );

			if ( time >= prevTime + 1000 ) {

				fpsPanel.update( ( frames * 1000 ) / ( time - prevTime ), 100 );

				prevTime = time;
				frames = 0;

				if ( memPanel ) {

					var memory = performance.memory;
					memPanel.update( memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576 );

				}

			}

			return time;

		},

		update: function () {

			beginTime = this.end();

		},

		// Backwards Compatibility

		domElement: container,
		setMode: showPanel

	};

};

Stats.Panel = function ( name, fg, bg ) {

	var min = Infinity, max = 0, round = Math.round;
	var PR = round( window.devicePixelRatio || 1 );

	var WIDTH = 80 * PR, HEIGHT = 48 * PR,
			TEXT_X = 3 * PR, TEXT_Y = 2 * PR,
			GRAPH_X = 3 * PR, GRAPH_Y = 15 * PR,
			GRAPH_WIDTH = 74 * PR, GRAPH_HEIGHT = 30 * PR;

	var canvas = document.createElement( 'canvas' );
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	canvas.style.cssText = 'width:80px;height:48px';

	var context = canvas.getContext( '2d' );
	context.font = 'bold ' + ( 9 * PR ) + 'px Helvetica,Arial,sans-serif';
	context.textBaseline = 'top';

	context.fillStyle = bg;
	context.fillRect( 0, 0, WIDTH, HEIGHT );

	context.fillStyle = fg;
	context.fillText( name, TEXT_X, TEXT_Y );
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	context.fillStyle = bg;
	context.globalAlpha = 0.9;
	context.fillRect( GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT );

	return {

		dom: canvas,

		update: function ( value, maxValue ) {

			min = Math.min( min, value );
			max = Math.max( max, value );

			context.fillStyle = bg;
			context.globalAlpha = 1;
			context.fillRect( 0, 0, WIDTH, GRAPH_Y );
			context.fillStyle = fg;
			context.fillText( round( value ) + ' ' + name + ' (' + round( min ) + '-' + round( max ) + ')', TEXT_X, TEXT_Y );

			context.drawImage( canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT );

			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT );

			context.fillStyle = bg;
			context.globalAlpha = 0.9;
			context.fillRect( GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round( ( 1 - ( value / maxValue ) ) * GRAPH_HEIGHT ) );

		}

	};

};
;/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 *
 * @ignore
 *
 */

var TWEEN = TWEEN || (function () {

	var _tweens = [];

	return {

		getAll: function () {

			return _tweens;

		},

		removeAll: function () {

			_tweens = [];

		},

		add: function (tween) {

			_tweens.push(tween);

		},

		remove: function (tween) {

			var i = _tweens.indexOf(tween);

			if (i !== -1) {
				_tweens.splice(i, 1);
			}

		},

		update: function (time, preserve) {

			if (_tweens.length === 0) {
				return false;
			}

			var i = 0;

			time = time !== undefined ? time : TWEEN.now();

			while (i < _tweens.length) {

				if (_tweens[i].update(time) || preserve) {
					i++;
				} else {
					_tweens.splice(i, 1);
				}

			}

			return true;

		}
	};

})();

//removed polyfill

TWEEN.now = Date.now;

TWEEN.Tween = function (object) {

	var _object = object;
	var _valuesStart = {};
	var _valuesEnd = {};
	var _valuesStartRepeat = {};
	var _duration = 1000;
	var _repeat = 0;
	var _repeatDelayTime;
	var _yoyo = false;
	var _isPlaying = false;
	var _reversed = false;
	var _delayTime = 0;
	var _startTime = null;
	var _easingFunction = TWEEN.Easing.Linear.None;
	var _interpolationFunction = TWEEN.Interpolation.Linear;
	var _chainedTweens = [];
	var _onStartCallback = null;
	var _onStartCallbackFired = false;
	var _onUpdateCallback = null;
	var _onCompleteCallback = null;
	var _onStopCallback = null;

	// Set all starting values present on the target object
	for (var field in object) {
		_valuesStart[field] = parseFloat(object[field], 10);
	}

	this.to = function (properties, duration) {

		if (duration !== undefined) {
			_duration = duration;
		}

		_valuesEnd = properties;

		return this;

	};

	this.start = function (time) {

		TWEEN.add(this);

		_isPlaying = true;

		_onStartCallbackFired = false;

		_startTime = time !== undefined ? time : TWEEN.now();
		_startTime += _delayTime;

		for (var property in _valuesEnd) {

			// Check if an Array was provided as property value
			if (_valuesEnd[property] instanceof Array) {

				if (_valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				_valuesEnd[property] = [_object[property]].concat(_valuesEnd[property]);

			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (_object[property] === undefined) {
				continue;
			}

			_valuesStart[property] = _object[property];

			if ((_valuesStart[property] instanceof Array) === false) {
				_valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			_valuesStartRepeat[property] = _valuesStart[property] || 0;

		}

		return this;

	};

	this.stop = function () {

		if (!_isPlaying) {
			return this;
		}

		TWEEN.remove(this);
		_isPlaying = false;

		if (_onStopCallback !== null) {
			_onStopCallback.call(_object, _object);
		}

		this.stopChainedTweens();
		return this;

	};

	this.end = function () {

		this.update(_startTime + _duration);
		return this;

	};

	this.stopChainedTweens = function () {

		for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
			_chainedTweens[i].stop();
		}

	};

	this.delay = function (amount) {

		_delayTime = amount;
		return this;

	};

	this.repeat = function (times) {

		_repeat = times;
		return this;

	};

	this.repeatDelay = function (amount) {

		_repeatDelayTime = amount;
		return this;

	};

	this.yoyo = function (yoyo) {

		_yoyo = yoyo;
		return this;

	};


	this.easing = function (easing) {

		_easingFunction = easing;
		return this;

	};

	this.interpolation = function (interpolation) {

		_interpolationFunction = interpolation;
		return this;

	};

	this.chain = function () {

		_chainedTweens = arguments;
		return this;

	};

	this.onStart = function (callback) {

		_onStartCallback = callback;
		return this;

	};

	this.onUpdate = function (callback) {

		_onUpdateCallback = callback;
		return this;

	};

	this.onComplete = function (callback) {

		_onCompleteCallback = callback;
		return this;

	};

	this.onStop = function (callback) {

		_onStopCallback = callback;
		return this;

	};

	this.update = function (time) {

		var property;
		var elapsed;
		var value;

		if (time < _startTime) {
			return true;
		}

		if (_onStartCallbackFired === false) {

			if (_onStartCallback !== null) {
				_onStartCallback.call(_object, _object);
			}

			_onStartCallbackFired = true;
		}

		elapsed = (time - _startTime) / _duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = _easingFunction(elapsed);

		for (property in _valuesEnd) {

			// Don't update properties that do not exist in the source object
			if (_valuesStart[property] === undefined) {
				continue;
			}

			var start = _valuesStart[property] || 0;
			var end = _valuesEnd[property];

			if (end instanceof Array) {

				_object[property] = _interpolationFunction(end, value);

			} else {

				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end, 10);
					} else {
						end = parseFloat(end, 10);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					_object[property] = start + (end - start) * value;
				}

			}

		}

		if (_onUpdateCallback !== null) {
			_onUpdateCallback.call(_object, value);
		}

		if (elapsed === 1) {

			if (_repeat > 0) {

				if (isFinite(_repeat)) {
					_repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in _valuesStartRepeat) {

					if (typeof (_valuesEnd[property]) === 'string') {
						_valuesStartRepeat[property] = _valuesStartRepeat[property] + parseFloat(_valuesEnd[property], 10);
					}

					if (_yoyo) {
						var tmp = _valuesStartRepeat[property];

						_valuesStartRepeat[property] = _valuesEnd[property];
						_valuesEnd[property] = tmp;
					}

					_valuesStart[property] = _valuesStartRepeat[property];

				}

				if (_yoyo) {
					_reversed = !_reversed;
				}

				if (_repeatDelayTime !== undefined) {
					_startTime = time + _repeatDelayTime;
				} else {
					_startTime = time + _delayTime;
				}

				return true;

			} else {

				if (_onCompleteCallback !== null) {

					_onCompleteCallback.call(_object, _object);
				}

				for (var i = 0, numChainedTweens = _chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					_chainedTweens[i].start(_startTime + _duration);
				}

				return false;

			}

		}

		return true;

	};

};


TWEEN.Easing = {

	Linear: {

		None: function (k) {

			return k;

		}

	},

	Quadratic: {

		In: function (k) {

			return k * k;

		},

		Out: function (k) {

			return k * (2 - k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k;
			}

			return - 0.5 * (--k * (k - 2) - 1);

		}

	},

	Cubic: {

		In: function (k) {

			return k * k * k;

		},

		Out: function (k) {

			return --k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k + 2);

		}

	},

	Quartic: {

		In: function (k) {

			return k * k * k * k;

		},

		Out: function (k) {

			return 1 - (--k * k * k * k);

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k;
			}

			return - 0.5 * ((k -= 2) * k * k * k - 2);

		}

	},

	Quintic: {

		In: function (k) {

			return k * k * k * k * k;

		},

		Out: function (k) {

			return --k * k * k * k * k + 1;

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return 0.5 * k * k * k * k * k;
			}

			return 0.5 * ((k -= 2) * k * k * k * k + 2);

		}

	},

	Sinusoidal: {

		In: function (k) {

			return 1 - Math.cos(k * Math.PI / 2);

		},

		Out: function (k) {

			return Math.sin(k * Math.PI / 2);

		},

		InOut: function (k) {

			return 0.5 * (1 - Math.cos(Math.PI * k));

		}

	},

	Exponential: {

		In: function (k) {

			return k === 0 ? 0 : Math.pow(1024, k - 1);

		},

		Out: function (k) {

			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			if ((k *= 2) < 1) {
				return 0.5 * Math.pow(1024, k - 1);
			}

			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

		}

	},

	Circular: {

		In: function (k) {

			return 1 - Math.sqrt(1 - k * k);

		},

		Out: function (k) {

			return Math.sqrt(1 - (--k * k));

		},

		InOut: function (k) {

			if ((k *= 2) < 1) {
				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
			}

			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

		}

	},

	Elastic: {

		In: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

		},

		Out: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

		},

		InOut: function (k) {

			if (k === 0) {
				return 0;
			}

			if (k === 1) {
				return 1;
			}

			k *= 2;

			if (k < 1) {
				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
			}

			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

		}

	},

	Back: {

		In: function (k) {

			var s = 1.70158;

			return k * k * ((s + 1) * k - s);

		},

		Out: function (k) {

			var s = 1.70158;

			return --k * k * ((s + 1) * k + s) + 1;

		},

		InOut: function (k) {

			var s = 1.70158 * 1.525;

			if ((k *= 2) < 1) {
				return 0.5 * (k * k * ((s + 1) * k - s));
			}

			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

		}

	},

	Bounce: {

		In: function (k) {

			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

		},

		Out: function (k) {

			if (k < (1 / 2.75)) {
				return 7.5625 * k * k;
			} else if (k < (2 / 2.75)) {
				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
			} else if (k < (2.5 / 2.75)) {
				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
			} else {
				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
			}

		},

		InOut: function (k) {

			if (k < 0.5) {
				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
			}

			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

		}

	}

};

TWEEN.Interpolation = {

	Linear: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.Linear;

		if (k < 0) {
			return fn(v[0], v[1], f);
		}

		if (k > 1) {
			return fn(v[m], v[m - 1], m - f);
		}

		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

	},

	Bezier: function (v, k) {

		var b = 0;
		var n = v.length - 1;
		var pw = Math.pow;
		var bn = TWEEN.Interpolation.Utils.Bernstein;

		for (var i = 0; i <= n; i++) {
			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
		}

		return b;

	},

	CatmullRom: function (v, k) {

		var m = v.length - 1;
		var f = m * k;
		var i = Math.floor(f);
		var fn = TWEEN.Interpolation.Utils.CatmullRom;

		if (v[0] === v[m]) {

			if (k < 0) {
				i = Math.floor(f = m * (1 + k));
			}

			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

		} else {

			if (k < 0) {
				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
			}

			if (k > 1) {
				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
			}

			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

		}

	},

	Utils: {

		Linear: function (p0, p1, t) {

			return (p1 - p0) * t + p0;

		},

		Bernstein: function (n, i) {

			var fc = TWEEN.Interpolation.Utils.Factorial;

			return fc(n) / fc(i) / fc(n - i);

		},

		Factorial: (function () {

			var a = [1];

			return function (n) {

				var s = 1;

				if (a[n]) {
					return a[n];
				}

				for (var i = n; i > 1; i--) {
					s *= i;
				}

				a[n] = s;
				return s;

			};

		})(),

		CatmullRom: function (p0, p1, p2, p3, t) {

			var v0 = (p2 - p0) * 0.5;
			var v1 = (p3 - p1) * 0.5;
			var t2 = t * t;
			var t3 = t * t2;

			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

		}

	}

};

// UMD (Universal Module Definition)
(function (root) {

	if (typeof define === 'function' && define.amd) {

		// AMD
		define([], function () {
			return TWEEN;
		});

	} else if (typeof module !== 'undefined' && typeof exports === 'object') {

		// Node.js
		module.exports = TWEEN;

	} else if (root !== undefined) {

		// Global variable
		root.TWEEN = TWEEN;

	}

})(this);
