'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

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

var Gamestack = {};

var GamestackEngine = function GamestackEngine() {

        var lib = {

                game_windows: [],

                all_objects: [],

                DEBUG: false,

                gui_mode: true,

                __gameWindow: {},

                __sprites: [],

                __animations: [],

                spriteTypes: [],

                systemSpriteTypes: ['player', 'enemy', 'background', 'interactive', 'terrain', 'weapon', 'subsprite'],

                samples: {},

                log_modes: ['reqs', 'info', 'warning'],

                log_mode: "all",

                recursionCount: 0,

                __gameWindowList: [],

                getObjectById: function getObjectById(id) {

                        for (var x = 0; x < this.all_objects.length; x++) {
                                if (this.all_objects[x].id == id) {

                                        return this.all_objects[x];
                                }
                        }
                },


                interlog: function interlog(message, div) //recursive safe :: won't go crazy with recursive logs
                {
                        this.recursionCount++;

                        if (!isNaN(div) && this.recursionCount % div == 0) {
                                //   console.log('Interval Log:'+  message);

                        }
                },

                create_id: function create_id() {
                        var S4 = function S4() {
                                return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
                        };
                        return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
                },

                error: function error(quit, message) {

                        if (quit) {
                                throw new Error(message);
                        } else {
                                console.error('E!' + message);
                        }
                },

                info: function info(m) {

                        if (GameStack.DEBUG) {

                                console.info('Info:' + m);
                        }
                },

                log: function log(m) {

                        if (GameStack.DEBUG) {

                                console.log('GameStack:' + m);
                        }
                },

                Extendors: {

                        hasInit: function hasInit(obj, args, f) {},

                        hasOnComplete: function hasOnComplete(obj, args, f) {},

                        hasMultiOnComplete: function hasMultiOnComplete(obj, args, f) {},

                        hasOnRun: function hasOnRun(obj, args, f) {},

                        hasMultiOnRun: function hasMultiOnRun(obj, args, f) {},

                        hasOnCollide: function hasOnCollide(obj, args, f) {},
                        hasMultiOnCollide: function hasMultiOnCollide(obj, args, f) {},
                        collideable: function collideable(obj, args) {

                                obj.collision_callback = function () {};

                                obj.onCollide = args.onCollide || function (collideables, callback) {
                                        if (typeof collideables == 'function') {
                                                callback = collideables;
                                        }

                                        this.collision_callback = callback || function () {};
                                };
                        },
                        spatial: function spatial(obj) {
                                obj.Size = function (s) {
                                        this.size = new Gamestack.Vector(s, s, s);
                                        return this;
                                };

                                obj.Pos = function (p) {
                                        this.position = new Gamestack.Vector(p, p, p);
                                        return this;
                                };

                                obj.Rot = function (r) {
                                        this.rotation = new Gamestack.Vector(r, r, r);
                                        return this;
                                };

                                obj.Position = obj.Pos;

                                obj.Rotate = obj.Rot;

                                obj.Rotation = obj.Rot;
                        },
                        informable: function informable(obj, args) {
                                obj.name = Gamestack.getArg(args, 'name', "__");

                                obj.description = Gamestack.getArg(args, 'description', false);
                        },
                        tweenable: function tweenable(obj, args) {

                                obj.curve_string = args.curve_string || "linearNone";

                                obj.setTweenCurve = function (c) {

                                        c = c || "linear_none";

                                        var cps = c.split('_');

                                        alert(cps);

                                        var s1 = cps[0].toLowerCase(),
                                            s2 = cps[1].toLowerCase();

                                        var curve = TWEEN.Easing.Linear.None;

                                        obj.curve_string = 'linear_none';

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

                                obj.curvesToArray = function () {

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
                        applyParentalArgs: function applyParentalArgs(obj, args) {

                                if (args.parent instanceof Gamestack.Sprite) {
                                        alert('parent was Sprite()');

                                        obj.parent = args.parent;

                                        obj.parent_id = obj.parent.id;
                                } else {
                                        obj.parent_id = args.parent_id || args.object_id || "__blank"; //The parent object

                                        obj.parent = Gamestack.getObjectById(obj.parent_id);
                                }

                                return obj.parent;
                        }
                },

                ChainSet: {

                        informable: function informable(obj) {

                                obj.Info = function (name, description) {

                                        this.name = name;

                                        this.description = description;

                                        return this;
                                };
                        },

                        posable: function posable(obj) {

                                obj.Position = function () {
                                        if (typeof p == 'number') {
                                                this.position = new Gamestack.Vector(p, p, p);
                                        } else if ((typeof p === 'undefined' ? 'undefined' : _typeof(p)) == 'object') {

                                                this.position = p;
                                        }

                                        return this;
                                };
                        },

                        rotable: function rotable(obj) {

                                obj.Rotation = function () {
                                        if (typeof p == 'number') {
                                                this.position = new Gamestack.Vector(p, p, p);
                                        } else if ((typeof p === 'undefined' ? 'undefined' : _typeof(p)) == 'object') {

                                                this.position = p;
                                        }

                                        return this;
                                };
                        }
                },

                //animate() : main animation call, run the once and it will recurse with requestAnimationFrame(this.animate);


                Collision: {
                        spriteRectanglesCollide: function spriteRectanglesCollide(obj1, obj2, gw) {
                                gw = gw || Gamestack.game_windows[0];

                                var camPos = new Gamestack.Vector(0, 0, 0);

                                obj1.padding = obj1.padding || new Gamestack.Vector(0, 0, 0);

                                var paddingX = Math.round(obj1.padding.x * obj1.size.x),
                                    paddingY = Math.round(obj1.padding.y * obj1.size.y),
                                    left = obj1.position.x + paddingX + camPos.x,
                                    right = obj1.position.x + obj1.size.x - paddingX + camPos.x,
                                    top = obj1.position.y + camPos.y + paddingY,
                                    bottom = obj1.position.y + obj1.size.y - paddingY + camPos.y;

                                if (right > obj2.position.x && left < obj2.position.x + obj2.size.x && bottom > obj2.position.y && top < obj2.position.y + obj2.size.y) {

                                        return true;
                                }
                        }
                },

                _gameWindow: {},

                setGameWindow: function setGameWindow(gameWindow) {

                        this._gameWindow = gameWindow;
                },

                ExtendEvents: function ExtendEvents(extendedObject, extendedKey, extendor, extendorKey) {
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

                removeOffscreenObjects: function removeOffscreenObjects(gw) {

                        gw = gw || Gamestack.game_windows[0];

                        Gamestack.each(Gamestack.all_objects, function (ix, item) {

                                if (item instanceof Gamestack.Sprite && item.onScreen() == false && !item.__keepAlive && !item.keepAlive) {

                                        gw.remove(item);
                                }
                        });
                },

                removeDeadObjects: function removeDeadObjects(gw) {

                        gw = gw || Gamestack.game_windows[0];

                        Gamestack.each(Gamestack.all_objects, function (ix, item) {

                                if (item instanceof Gamestack.Sprite && item.isDead()) {

                                        // console.log('removing:' + item.image.domElement.src);
                                        gw.remove(item);
                                }
                        });
                },

                getGameWindow: function getGameWindow() {

                        return this._gameWindow;
                },

                assignAll: function assignAll(object, args, keys) {

                        __gameStack.each(keys, function (ix, item) {

                                object[ix] = args[ix];
                        });
                },

                each: function each(list, onResult, onComplete) {
                        for (var i in list) {
                                onResult(i, list[i]);
                        }

                        if (typeof onComplete === 'function') {
                                onComplete(false, list);
                        }
                        ;
                },

                ready_callstack: [],

                ready: function ready(callback) {

                        this.ready_callstack.push(callback);
                },

                reload: function reload() {
                        this.callReady();
                },

                callReady: function callReady() {

                        var funx = this.ready_callstack;

                        var gameWindow = this._gameWindow,
                            lib = this,
                            objects = this.__gameWindow.objects;

                        //call every function in the ready_callstack


                        this.each(funx, function (ix, call) {

                                call(lib, gameWindow, objects);
                        });

                        this.InputSystem.init();

                        this.__running = true;
                },

                getArg: function getArg(args, keys, fallback) {

                        if (typeof keys == 'string') {
                                keys = [keys]; //always array
                        }
                        for (var x = 0; x < keys.length; x++) {
                                var k = keys[x];

                                if (args && args.hasOwnProperty(k)) {
                                        return args[k]; //return first argument match
                                }
                        }
                        return fallback;
                },

                normalArgs: function normalArgs(args) {

                        var a = {};

                        function normal(str) {
                                return str.toLowerCase().replace('-', '').replace(' ', '').replace('_', '');
                        };

                        for (var x in args) {
                                a[normal(x)] = args[x];
                        }

                        return a;
                },

                isNormalStringMatch: function isNormalStringMatch(str1, str2) {

                        return str1.toLowerCase().replace(' ', '') == str2.toLowerCase().replace(' ', '');
                },

                instance_type_pairs: function instance_type_pairs() {

                        //get an array of all instance/type pairs added to the library

                        //example : [ {constructor_name:Sprite, type:enemy_basic}, {constructor_name:Animation, type:enemy_attack}  ];

                        var objectList = [];

                        this.each(this.all_objects, function (ix, item) {

                                objectList.push({ constructor_name: item.constructor.name, type: item.type });
                        });

                        return objectList;
                },

                getById: function getById(id) {

                        for (var x in this.all_objects) {
                                if (this.all_objects[x].id == id) {
                                        return this.all_objects[x];
                                }
                        }
                },

                select: function select(constructor_name, name, type /*ignoring spaces and CAPS/CASE on type match*/) {

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
        };

        return lib;
};

var GamestackApi = {
        get: function get() {},

        post: function post(object) {
                //TODO decycle the object before saving

                if (!object.id) {
                        object.id = Gamestack.create_id();
                }

                var name = object.name,
                    type = object.constructor.name,
                    contents = jstr(object),
                    id = object.id;
        }

};

var GSO //Gamestack-Overrideable
= function () {
        function GSO() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, GSO);

                this.run_ext = args.run_ext || [];

                this.complete_ext = args.complete_ext || [];
        }

        /*****
         * Overridable / Extendable functions
         * -allows stacking of external object-function calls
         ******/

        _createClass(GSO, [{
                key: 'onRun',
                value: function onRun(caller, callkey) {
                        this.run_ext = this.run_ext || [];

                        if (this.run_ext.indexOf(caller[callkey]) == -1) {
                                this.run_ext.push({ caller: caller, callkey: callkey });
                        }
                }
        }, {
                key: 'onComplete',
                value: function onComplete(caller, callkey) {
                        this.complete_ext = this.complete_ext || [];

                        if (this.complete_ext.indexOf(caller[callkey]) == -1) {
                                this.complete_ext.push({ caller: caller, callkey: callkey });
                        }
                }
        }, {
                key: 'call_on_run',
                value: function call_on_run() {
                        //call any function extension that is present
                        for (var x = 0; x < this.run_ext.length; x++) {
                                this.run_ext[x].caller[this.run_ext[x].callkey]();
                        }
                }
        }, {
                key: 'call_on_complete',
                value: function call_on_complete() {
                        //call any function extension that is present
                        for (var x = 0; x < this.complete_ext.length; x++) {
                                this.complete_ext[x].caller[this.complete_ext[x].callkey]();
                        }
                }
        }]);

        return GSO;
}();

/**
 * GameImage
 *
 * Simple GameImage
 * @param   {string} src source name/path of the targeted image-file

 * @returns {GameImage} object of GameImage()

 * */

var GameImage = function () {
        function GameImage(src, onCreate) {
                _classCallCheck(this, GameImage);

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
                } else if (typeof src == 'string') {

                        var ext = src.substring(src.lastIndexOf('.'), src.length);

                        this.image = document.createElement('IMG');

                        this.image.src = src;

                        this.src = this.image.src;
                }

                if (!this.image) {
                        this.image = { error: "Image not instantiated, set to object by default" };

                        return {};
                } else {
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

                        if (typeof this.onCreate == 'function') {

                                this.onCreate(this.image);
                        }
                };
        }

        _createClass(GameImage, [{
                key: 'getImage',
                value: function getImage() {
                        return this.image;
                }
        }]);

        return GameImage;
}();

//GameStack: a main / game lib object::
//TODO: fix the following set of mixed references:: only need to refer to (1) lib-object-instance


var GameStack = new GamestackEngine();
Gamestack = GameStack;
var __gameStack = GameStack;
var Quick2d = GameStack; //Exposing 'Quick2d' as synonymous reference to Gamestack
var __gameInstance = Gamestack;

Gamestack.Sound = Sound;
Gamestack.GameImage = GameImage;

if (typeof module !== 'undefined' && module.exports) {

        //This library is being instaniated via require() aka node.js require or similar library loader
        module.exports = Gamestack;
} else {}

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

                var __targetType = "*",
                    __targetName = "*";

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

                                                if (typeof item1.onUpdate == 'function') {

                                                        item1.onUpdate(function (sprite) {

                                                                if (item1.collidesRectangular(item2, padding)) {

                                                                        callback(item1, item2);
                                                                }
                                                                ;
                                                        });
                                                }
                                        });
                                });
                        } else {
                                console.info('Rigging a property event');

                                //TODO: test property-watch events:

                                console.info('detected property threshhold event key in:' + evt_profile.evt_key);

                                console.info('TODO: rig property events');

                                var condition = "_",
                                    key = criterion || evt_profile.evt_key;

                                if (key.indexOf('[') >= 0 || key.indexOf(']') >= 0) {
                                        key = $Q.between('[', ']', key);
                                }

                                var evt_parts = [];

                                var run = function run() {
                                        console.error('Sprite property check was not set correctly');
                                };

                                if (key.indexOf('>=') >= 0) {
                                        condition = ">=";
                                } else if (key.indexOf('<=') >= 0) {
                                        condition = "<=";
                                } else if (key.indexOf('>') >= 0) {
                                        condition = ">";
                                } else if (key.indexOf('<') >= 0) {
                                        condition = "<";
                                } else if (key.indexOf('=') >= 0) {
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
                                } catch (e) {
                                        console.log(e);
                                }

                                console.info('Gamestack:Processing condition with:' + condition);

                                switch (condition) {

                                        case ">=":

                                                run = function run(obj, key) {
                                                        if (obj[key] >= number) {
                                                                callback();
                                                        }
                                                };

                                                break;

                                        case "<=":

                                                run = function run(obj, key) {
                                                        if (obj[key] <= number) {
                                                                callback();
                                                        }
                                                };

                                                break;

                                        case ">":

                                                run = function run(obj, key) {
                                                        if (obj[key] > number) {
                                                                callback();
                                                        }
                                                };

                                                break;

                                        case "<":

                                                run = function run(obj, key) {
                                                        if (obj[key] < number) {
                                                                callback();
                                                        }
                                                };

                                                break;

                                        case "=":

                                                run = function run(obj, key) {
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

                                var keys = mykey.split('.'),
                                    propkey = "";

                                this.each(function (ix, item) {

                                        var object = {};

                                        if (keys.length == 1) {
                                                object = item;

                                                propkey = mykey;
                                        } else if (keys.length == 2) {
                                                object = item[keys[0]];

                                                propkey = keys[1];
                                        } else if (keys.length == 3) {
                                                object = item[keys[0]][keys[1]];

                                                propkey = keys[2];
                                        } else {
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

        if (typeof selector !== 'string') {

                if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) !== 'object') {
                        selector = {};
                }

                object_out = selector;
        } else {

                if (selector && selector !== '*') {

                        var s = selector || '';

                        console.info('selector:' + s);

                        var mainSelector = $Q.before('[', s).trim(),
                            msfChar = mainSelector.substring(0, 1);

                        var __targetClassName = "*";

                        var output = [];

                        var cleanSelectorString = function cleanSelectorString(str) {
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

                        var criterion = $Q.between('[', ']', s),
                            cparts = criterion.split('=');

                        var __targetType = "*",
                            __targetName = "*";

                        var getParts = function getParts() {

                                if (cparts.length >= 2) {

                                        switch (cparts[0].toLowerCase()) {

                                                case "name":

                                                        //get all objects according to name=name

                                                        console.log('Q():Detected parts in selector:' + jstr(cparts));

                                                        __targetName = cleanSelectorString(cparts[1]);

                                                        break;

                                                case "type":

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

                                                case "type":

                                                        console.log('Q():Detected parts in selector:' + jstr(cparts));

                                                        __targetType = cleanSelectorString(cparts[3]);

                                                        break;

                                        }
                                }
                        };

                        getParts(cparts);

                        object_out = GameStack.select(__targetClassName, __targetName, __targetType);
                } else if (selector == '*') {
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

        if (typeof complete == 'function') {
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
        return test_str.substring(start_pos, end_pos);
};

$Q.test_selector_method = function () {
        //leftover method of hand-testing
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

        events: {

                mousemove: [],
                leftclick: {},
                rightclick: {},
                middleclick: [],
                wheelup: [],
                wheelDown: []
        },

        keymap: {},

        keyReplace: function keyReplace(str) {
                return str.toLowerCase().replace('space', ' ').replace('left', String.fromCharCode(37)).replace('left', String.fromCharCode(37)).replace('up', String.fromCharCode(38)).replace('right', String.fromCharCode(39)).replace('down', String.fromCharCode(40));
        },

        extendKey: function extendKey(evt_key, _callback, onFinish) {

                evt_key = this.keyReplace(evt_key);

                Gamestack.InputSystem.keymap[evt_key] = {

                        down: false,

                        callback: function callback() {
                                _callback(evt_key);
                        }

                };

                return Gamestack.InputSystem.keymap[evt_key];
        },

        extend: function extend(evt_key, downCall, upCall, onFinish) {

                evt_key = evt_key.toLowerCase();

                Gamestack.InputSystem[evt_key] = {

                        down: downCall,

                        up: upCall

                };

                return Gamestack.InputSystem[evt_key];
        },

        init: function init() {

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
                            evt_object = Gamestack.InputSystem['keymap'][gs_key_string] || Gamestack.InputSystem['keymap'][gs_key_string.toLowerCase()];

                        if (evt_object) {
                                evt_object.down = e.type == 'keydown';
                        }
                };

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
                        return { x: x, y: y };
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
                        var applyMouseMove = function applyMouseMove(e) {
                                fullMoveInputSystem(e, c);
                        };

                        var c = canvases[x];

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
};

Gamestack.file_system = {

        localizedSource: function localizedSource(src, hostUrl) {

                hostUrl = hostUrl || "../";

                var gs_folder_ix = src.indexOf('assets/game');

                return hostUrl + src.substring(gs_folder_ix, src.length);
        },

        loadJSON: function loadJSON(filepath, callback) {

                $.getJSON(filepath, function (data) {

                        callback(false, data);
                });
        },

        loadJSONLevel: function loadJSONLevel(filepath, gw, callback) {

                if (typeof gw == 'function' || !gw) {
                        callback = gw || callback || function () {};

                        gw = Gamestack.game_windows[0];
                }

                $.getJSON(filepath, function (data) {

                        //localize .src up to three levels of recursion (.src must be altered to refer locally)

                        $.each(data.sprites, function (ix, xitem) {

                                if (typeof xitem.src == 'string') {

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

                                xitem = new Gamestack.Sprite(xitem);

                                gw.add(xitem);
                                //sprite.image = sprite.selected_animation.image;


                                if (ix >= data.sprites.length - 1) {

                                        //last sprite is loaded //WHY DOESN't this work?

                                        callback(false, data);
                                }
                        });
                });
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

var GameWindow = function () {
        function GameWindow() {
                var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref$canvas = _ref.canvas,
                    canvas = _ref$canvas === undefined ? false : _ref$canvas,
                    objects = _ref.objects,
                    update = _ref.update,
                    camera = _ref.camera;

                _classCallCheck(this, GameWindow);

                this.objects = objects || [];

                this.canvas = canvas || false;

                if (!canvas) {
                        console.info('GameWindow() had no {canvas:canvas} argument. Creating a new canvas in document.body...');
                        this.canvas = document.createElement('CANVAS');
                        document.body.append(this.canvas);
                }

                document.body.style.position = "absolute";

                document.body.style.width = "100%";

                document.body.style.height = "100%";

                this.camera = new Gamestack.Camera();

                this.camera.target = false;

                __gameStack.camera = this.camera;

                if (typeof update == 'function') {
                        this.onUpdate(update);
                }

                var __inst = this;

                this.adjustSize();

                this.update_ext = [];

                window.onresize = function () {

                        __inst.adjustSize();
                };

                this.ctx = this.canvas.getContext('2d');

                Gamestack.game_windows.push(this);
        }

        _createClass(GameWindow, [{
                key: 'uniques',
                value: function uniques(list) {

                        var listout = [];

                        $Q.each(list, function (ix, item) {

                                if (!listout.indexOf(item.id) >= 0) {

                                        var str = item.name;

                                        listout.push({ "sprite": item });
                                }
                        });

                        return listout;
                }
        }, {
                key: 'setPlayer',
                value: function setPlayer(player) {
                        this.player = player;

                        if (!this.objects.indexOf(player) >= 0) {
                                this.objects.push(player);
                        }
                }
        }, {
                key: 'onUpdate',
                value: function onUpdate(f) {

                        this.update_ext.push(f);
                }
        }, {
                key: 'update',
                value: function update() {

                        GameStack.each(this.objects, function (ix, item) {

                                if (item && typeof item.def_update == 'function') {

                                        item.def_update(item);
                                }

                                if (item && typeof item.update == 'function') {
                                        item.update(item);
                                }
                        });

                        for (var x in this.update_ext) {
                                this.update_ext[x]();
                        }
                }
        }, {
                key: 'draw',
                value: function draw() {

                        var _gw = this;

                        if (this.before_draw_ext) {
                                this.before_draw_ext();
                        }

                        GameStack.each(this.objects, function (ix, item) {

                                if (['Sprite', 'Background', 'Interactive', 'Terrain'].indexOf(item.constructor.name) >= 0 || item.__isDrawable) {

                                        Gamestack.Canvas.draw(item, _gw.ctx);
                                }
                        });

                        if (this.draw_ext) {
                                this.draw_ext();
                        }
                }
        }, {
                key: 'onDraw',
                value: function onDraw(f) {

                        this.draw_ext = function () {
                                f();
                        };
                }
        }, {
                key: 'onBeforeDraw',
                value: function onBeforeDraw(f) {

                        this.before_draw_ext = function () {
                                f();
                        };
                }
        }, {
                key: 'adjustSize',
                value: function adjustSize(w, h) {
                        //fill to parent size

                        w = w || this.canvas.parentNode.clientWidth;

                        h = h || this.canvas.parentNode.clientHeight;

                        var c = document.getElementById('#gs-container');

                        if (c) {
                                c.setAttribute('width', w);
                        }
                        ;

                        if (c) {
                                c.setAttribute('height', h);
                        }
                        ;

                        __gameStack.WIDTH = w;

                        __gameStack.HEIGHT = h;

                        this.canvas.width = w;

                        this.canvas.height = h;
                }
        }, {
                key: 'add',
                value: function add(obj, onBottom) {
                        //1: if Sprite(), Add object to the existing __gameWindow

                        var __inst = this;

                        if (obj instanceof Gamestack.Camera) {

                                this.camera = obj;
                        } else if (obj instanceof Gamestack.GSEvent) {

                                if (__gameStack.__running) {

                                        return console.error('Events can only be added before Gamstack.animate() is called::aka before the main update / loop begins');
                                } else {

                                        obj.apply();
                                }
                        } else {

                                if (onBottom) {
                                        this.objects.splice(0, 0, obj);
                                } else {

                                        this.objects.push(obj);
                                }
                        }

                        this.collect(obj);

                        return obj;
                }
        }, {
                key: 'remove',
                value: function remove(obj) {

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
        }, {
                key: 'collect',
                value: function collect(obj) {

                        Gamestack.all_objects.push(obj);
                }
        }, {
                key: 'animate',
                value: function animate(time) {

                        var __inst = this;

                        requestAnimationFrame(function () {

                                __inst.animate();
                        });

                        if (Gamestack.__stats) {
                                Gamestack.__stats.begin();
                                Gamestack.__statsMS.begin();
                                Gamestack.__statsMB.update();
                        }

                        __gameStack.isAtPlay = true;

                        if (window.TWEEN) TWEEN.update(time);

                        __inst.update();

                        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                        this.draw();

                        if (Gamestack.__stats) {
                                Gamestack.__stats.end();
                                Gamestack.__statsMS.end();
                        }
                }
        }, {
                key: 'start',
                value: function start() {

                        if (typeof Stats == 'function') //Stats library exists
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
        }]);

        return GameWindow;
}();

var FullScreenGameWindow = function (_GameWindow) {
        _inherits(FullScreenGameWindow, _GameWindow);

        function FullScreenGameWindow() {
                var _ref2, _ref2$canvas;

                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (_ref2 = {}, _ref2$canvas = _ref2.canvas, canvas = _ref2$canvas === undefined ? false : _ref2$canvas, objects = _ref2.objects, update = _ref2.update, camera = _ref2.camera, _ref2);

                _classCallCheck(this, FullScreenGameWindow);

                var _this = _possibleConstructorReturn(this, (FullScreenGameWindow.__proto__ || Object.getPrototypeOf(FullScreenGameWindow)).call(this, args));

                if (!_this.canvas) {
                        console.info('creating new canvas');
                        _this.canvas = document.createElement('CANVAS');

                        document.body.append(_this.canvas);
                }

                _this.canvas.style.position = 'absolute';

                _this.canvas.style.width = '100%';

                _this.canvas.style.height = '100%';

                _this.canvas.style.background = 'black';

                var c = _this.canvas;

                _this.ctx = _this.canvas.getContext('2d');

                __gameStack.canvas = _this.canvas;

                __gameStack.ctx = _this.ctx;

                _this.adjustSize();

                __gameStack.__gameWindow = _this;
                return _this;
        }

        _createClass(FullScreenGameWindow, [{
                key: 'adjustSize',
                value: function adjustSize(w, h) {
                        w = w || this.canvas.clientWidth;

                        h = h || this.canvas.clientHeight;

                        var c = document.getElementById('#gs-container');

                        if (c) {
                                c.setAttribute('width', w);
                        }
                        ;

                        if (c) {
                                c.setAttribute('height', h);
                        }
                        ;

                        __gameStack.WIDTH = w;

                        __gameStack.HEIGHT = h;

                        this.canvas.width = w;

                        this.canvas.height = h;
                }
        }]);

        return FullScreenGameWindow;
}(GameWindow);

;

Gamestack.GameWindow = GameWindow;

;
(function () {
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

        var Animation = function () {
                function Animation() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, Animation);

                        args = args || {};

                        if (typeof args == 'string') {

                                this.image = new Gamestack.GameImage(args);
                                args = {};
                        }

                        for (var x in this.args) {
                                this[x] = args[x];
                        }

                        this.name = args.name || "__animationName";

                        this.description = args.description || "__animationDesc";

                        if (!this.image) {
                                this.image = new Gamestack.GameImage(args.src || args.image);
                        }

                        var __inst = this,
                            imgDom = this.image.domElement;

                        this.frameSize = new Gamestack.Vector(args.frameSize || new Gamestack.Vector(0, 0));

                        this.image.domElement.onload = function () {
                                if (__inst.frameSize.x == 0 && __inst.frameSize.y == 0) {

                                        __inst.frameSize = new Gamestack.Vector(imgDom.width, imgDom.height);
                                }
                        };

                        if (args.frameBounds && args.frameBounds.min && args.frameBounds.max) {

                                this.frameBounds = new Gamestack.VectorFrameBounds(args.frameBounds.min, args.frameBounds.max, args.frameBounds.termPoint);
                        } else {
                                this.frameBounds = new Gamestack.VectorFrameBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0));
                        }

                        this.frameOffset = this.getArg(args, 'frameOffset', new Gamestack.Vector(0, 0, 0));

                        this.apply2DFrames();

                        this.flipX = this.getArg(args, 'flipX', false);

                        this.cix = 0;

                        this.selected_frame = this.frames[0] || {};

                        this.timer = 0;

                        this.duration = args.duration || 2000;

                        this.seesaw_mode = args.seesaw_mode || false;

                        this.reverse_frames = args.reverse_frames || false;

                        this.run_ext = args.run_ext || [];

                        this.complete_ext = args.complete_ext || [];

                        Gamestack.ChainSet.informable(this);
                }

                /*****
                * Overridable / Extendable functions
                * -allows stacking of external object-function calls
                ******/

                _createClass(Animation, [{
                        key: 'onRun',
                        value: function onRun(call) {

                                if (this.run_ext.indexOf(call) == -1) {
                                        this.run_ext.push(call);
                                }
                        }
                }, {
                        key: 'onComplete',
                        value: function onComplete(call) {

                                if (this.complete_ext.indexOf(call) == -1) {
                                        this.complete_ext.push(call);
                                }
                        }
                }, {
                        key: 'call_on_run',
                        value: function call_on_run() {
                                //call any function extension that is present
                                for (var x = 0; x < this.run_ext.length; x++) {
                                        this.run_ext[x]();
                                }
                        }
                }, {
                        key: 'call_on_complete',
                        value: function call_on_complete() {
                                //call any function extension that is present
                                for (var x = 0; x < this.complete_ext.length; x++) {
                                        this.complete_ext[x]();
                                }
                        }
                }, {
                        key: 'reverseFrames',
                        value: function reverseFrames() {

                                this.frames.reverse();
                        }
                }, {
                        key: 'singleFrame',
                        value: function singleFrame(frameSize) {

                                this.__frametype = 'single';

                                this.frameSize = frameSize || this.frameSize;

                                this.selected_frame = {
                                        image: this.image,
                                        frameSize: this.frameSize,
                                        framePos: { x: 0, y: 0 }
                                };

                                this.frames[0] = this.selected_frame;

                                return this;
                        }
                }, {
                        key: 'getArg',
                        value: function getArg(args, key, fallback) {

                                if (args.hasOwnProperty(key)) {

                                        return args[key];
                                } else {
                                        return fallback;
                                }
                        }
                }, {
                        key: 'apply2DFrames',
                        value: function apply2DFrames() {

                                this.frames = [];

                                var fcount = 0;

                                var quitLoop = false;

                                for (var y = this.frameBounds.min.y; y <= this.frameBounds.max.y; y++) {

                                        for (var _x5 = this.frameBounds.min.x; _x5 <= this.frameBounds.max.x; _x5++) {

                                                var framePos = {
                                                        x: _x5 * this.frameSize.x + this.frameOffset.x,
                                                        y: y * this.frameSize.y + this.frameOffset.y
                                                };

                                                this.frames.push({ image: this.image, frameSize: this.frameSize, framePos: framePos });

                                                if (_x5 >= this.frameBounds.termPoint.x && y >= this.frameBounds.termPoint.y) {

                                                        quitLoop = true;

                                                        break;
                                                }

                                                fcount += 1;

                                                if (quitLoop) break;
                                        }
                                }

                                this.frames[0] = !this.frames[0] ? {
                                        image: this.image,
                                        frameSize: this.frameSize,
                                        framePos: { x: this.frameBounds.min.x, y: this.frameBounds.min.y }
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
                }, {
                        key: 'update',
                        value: function update() {

                                this.selected_frame = this.frames[Math.round(this.cix) % this.frames.length];
                        }
                }, {
                        key: 'reset',
                        value: function reset() {

                                this.apply2DFrames();

                                this.cix = 0;
                        }
                }, {
                        key: 'continuous',
                        value: function continuous() {

                                if (this.__frametype == 'single') {
                                        return 0;
                                }

                                this.apply2DFrames();

                                //update once:
                                this.update();

                                if (this.cix == 0) {

                                        this.engage();
                                }
                        }
                }, {
                        key: 'engage',
                        value: function engage(duration, complete) {

                                this.call_on_run();

                                duration = duration || this.duration || this.frames.length * 20;

                                if (this.__frametype == 'single') {
                                        return 0;
                                }

                                var __inst = this;

                                //we have a target
                                this.tween = new TWEEN.Tween(this).easing(__inst.curve || TWEEN.Easing.Linear.None).to({ cix: __inst.frames.length - 1 }, duration).onUpdate(function () {
                                        //console.log(objects[0].position.x,objects[0].position.y);

                                        //   __inst.cix = Math.ceil(__inst.cix);

                                        __inst.update();
                                }).onComplete(function () {
                                        //console.log(objects[0].position.x, objects[0].position.y);

                                        __inst.cix = 0;

                                        __inst.call_on_complete();

                                        __inst.isComplete = true;
                                });

                                this.tween.start();
                        }
                }, {
                        key: 'animate',
                        value: function animate() {

                                this.apply2DFrames();

                                this.timer += 1;

                                if (this.delay == 0 || this.timer % this.delay == 0) {

                                        if (this.cix >= this.frames.length - 1) {
                                                this.call_on_complete();
                                        }

                                        this.cix = this.cix >= this.frames.length - 1 ? this.frameBounds.min.x : this.cix + 1;

                                        this.update();
                                }
                        }
                }]);

                return Animation;
        }();

        ;

        Gamestack.Animation = Animation;
})();
;

(function () {
        console.log('Camera class... creating');

        /**
         * Gamestack.Camera : has simple x, y, z, position / Vector values
         *
         * @returns {Vector}
         */

        var Camera = function Camera(args) {
                _classCallCheck(this, Camera);

                this.position = new Gamestack.Vector(0, 0, 0);
        };

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

(function () {
        console.log('CanvasStack class... creating');

        var CanvasStack = function CanvasStack() {
                _classCallCheck(this, CanvasStack);

                return {

                        __levelMaker: false,

                        draw: function draw(sprite, ctx, camera) {

                                camera = camera || Gamestack.game_windows[0].camera || { position: new Gamestack.Vector(0, 0, 0) };

                                if (sprite.active && (this.__levelMaker || sprite.onScreen(__gameStack.WIDTH, __gameStack.HEIGHT))) {

                                        this.drawPortion(sprite, ctx, camera);
                                }
                        },
                        drawFrameWithRotation: function drawFrameWithRotation(img, fx, fy, fw, fh, x, y, width, height, deg, canvasContextObj, flipX, flipY) {

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
                                } else {}

                                if (flipY) {

                                        canvasContextObj.scale(1, -1);
                                } else {}

                                //draw the image
                                canvasContextObj.drawImage(img, fx, fy, fw, fh, width / 2 * -1, height / 2 * -1, width, height);
                                //reset the canvas

                                canvasContextObj.restore();
                        },

                        drawData: function drawData(x, y, w, h, data, ctx) {

                                ctx.putImageData(data, x, y, 0, 0, w, h);
                        },

                        /*
                         * drawPortion:
                         *
                         *   expects: (sprite{selected_animation{selected_frame{frameSize, framePos } offset?, gameSize? }  })
                         *
                         *
                         * */

                        drawPortion: function drawPortion(sprite, ctx, camera) {

                                var frame;

                                if (sprite.active) {

                                        if (sprite.selected_animation instanceof Object && sprite.selected_animation.hasOwnProperty('selected_frame')) {

                                                frame = sprite.selected_animation.selected_frame;
                                        } else {

                                                // console.error('Sprite is missing arguments');
                                                //delay the draw

                                                return;
                                        }

                                        var p = sprite.position;

                                        var camera_pos = camera.position || { x: 0, y: 0, z: 0 };

                                        if (!sprite.hasOwnProperty('scrollFactor')) {
                                                sprite.scrollFactor = 1.0;
                                        }

                                        var x = p.x,
                                            y = p.y,
                                            scrollFactor = sprite.scrollFactor >= 0 && sprite.scrollFactor <= 1.0 ? sprite.scrollFactor : 1.0;

                                        if (sprite.noScroll) {
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

                                        if (_typeof(sprite.rotation) == 'object') {

                                                rotation = sprite.rotation.x;
                                        } else {
                                                rotation = sprite.rotation;
                                        }

                                        var frame = sprite.selected_animation.selected_frame;

                                        if (frame && frame.image && frame.image.data) {

                                                ctx.putImageData(frame.image.data, x, y, 0, 0, sprite.size.x, sprite.size.y);
                                        } else {

                                                if (sprite.selected_animation.image.domElement instanceof HTMLImageElement) {

                                                        this.drawFrameWithRotation(sprite.selected_animation.image.domElement, frame.framePos.x, frame.framePos.y, frame.frameSize.x, frame.frameSize.y, Math.round(x + realWidth / 2), Math.round(y + realHeight / 2), realWidth, realHeight, rotation % 360, ctx, sprite.flipX, sprite.flipY);
                                                }
                                        }
                                }
                        }

                };
        };

        Gamestack.Canvas = new CanvasStack();

        Gamestack.CanvasStack = CanvasStack;
})();

;

(function () {
        console.log('CollisionSettings class... creating');

        var CollisionSettings = function CollisionSettings() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, CollisionSettings);

                this.fourway = args.fourway || args.four_way || false;

                this.top = this.four_way || args.top || false;

                this.bottom = this.four_way || args.bottom || false;

                this.left = this.four_way || args.left || false;

                this.right = this.four_way || args.right || false;

                this.pixel = args.pixel || false;

                this.stop = args.stop || false;

                this.padding = args.padding || new Gamestack.Vector(0, 0, 0); // 0-1.0
        };

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

(function () {
        console.log('Force class... creating');

        var GravityForce = function () {
                function GravityForce(args) {
                        _classCallCheck(this, GravityForce);

                        this.name = args.name || "";

                        this.description = args.description || "";

                        this.subjects = args.subjects || [];

                        this.clasticObjects = args.clasticObjects || [];

                        this.topClastics = args.topClastics || [];

                        this.max = args.max || new Vector3(3, 3, 3);
                        this.accel = args.accel || new Vector3(1.3, 1.3, 1.3);

                        for (var x in this.clasticObjects) {
                                if (!this.clasticObjects[x] instanceof Gamestack.Sprite) {
                                        this.clasticObjects[x] = Gamestack.getById(this.clasticObjects[x].id);
                                }
                        }

                        for (var x in this.topClastics) {
                                if (!this.topClastics[x] instanceof Gamestack.Sprite) {
                                        this.topClastics[x] = Gamestack.getById(this.topClastics[x].id);
                                }
                        }

                        for (var x in this.subjects) {
                                if (!this.subjects[x] instanceof Gamestack.Sprite) {
                                        this.subjects[x] = Gamestack.getById(this.subjects[x].id);
                                }
                        }
                }

                _createClass(GravityForce, [{
                        key: 'getArg',
                        value: function getArg(args, key, fallback) {

                                if (args.hasOwnProperty(key)) {

                                        return args[key];
                                } else {
                                        return fallback;
                                }
                        }
                }, {
                        key: 'update',
                        value: function update() {

                                var subjects = this.subjects;

                                var clasticObjects = this.clasticObjects;

                                var topClastics = this.topClastics;

                                var accel = this.accel || {};

                                var max = this.max || {};

                                __gameStack.each(subjects, function (ix, itemx) {

                                        itemx.accelY(accel, max);

                                        itemx.__inAir = true;

                                        if (itemx.position.y >= itemx.groundMaxY) {

                                                itemx.position.y = itemx.groundMaxY;
                                        }

                                        itemx.groundMaxY = 3000000; //some crazy number you'll never reach in-game

                                        __gameStack.each(clasticObjects, function (iy, itemy) {

                                                itemx.collide_stop(itemy);
                                        });

                                        __gameStack.each(topClastics, function (iy, itemy) {

                                                itemx.collide_stop_top(itemy);
                                        });
                                });
                        }
                }]);

                return GravityForce;
        }();

        ;

        var Force = GravityForce;

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

var ControllerEventKeys = function ControllerEventKeys() {
        _classCallCheck(this, ControllerEventKeys);

        return {

                left_stick: false,

                right_stick: false,

                0: false,

                1: false,

                2: false,

                3: false,

                4: false,

                5: false,

                6: false,

                7: false,

                8: false,

                9: false,

                10: false,

                11: false,

                12: false,

                13: false,

                14: false,

                15: false,

                16: false,

                17: false,

                18: false,

                19: false

        };
};

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

var GamepadAdapter = function () {
        function GamepadAdapter() {
                _classCallCheck(this, GamepadAdapter);

                this.__gamepads = [];

                this.intervals = [];

                var controller_stack = this;

                var __gamepadMaster = this;

                this.events = [];

                window.addEventListener("gamepadconnected", function (e) {
                        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);

                        if (__gamepadMaster.mainLoop) {
                                window.clearInterval(__gamepadMaster.mainLoop);
                        }

                        __gamepadMaster.mainLoop = window.setInterval(function () {

                                var gps = navigator.getGamepads();

                                __gamepadMaster.gps = gps;

                                for (var x = 0; x < gps.length; x++) {

                                        var events = __gamepadMaster.__gamepads[x] ? __gamepadMaster.__gamepads[x] : {};

                                        __gamepadMaster.process(__gamepadMaster.gps[x], events);
                                }
                        }, 20);
                });
        }

        _createClass(GamepadAdapter, [{
                key: 'gamepads',
                value: function gamepads() {

                        return navigator.getGamepads();
                }
        }, {
                key: 'disconnect_all',
                value: function disconnect_all() {

                        for (var x = 0; x < this.intervals.length; x++) {

                                window.clearInterval(this.intervals[x]);
                        }
                }
        }, {
                key: 'disconnect_by_index',
                value: function disconnect_by_index(game_pad_index) {

                        window.clearInterval(this.intervals[game_pad_index]);
                }
        }, {
                key: 'hasAnyPad',
                value: function hasAnyPad() {
                        return "getGamepads" in navigator;
                }
        }, {
                key: 'Event',
                value: function Event(key, game_pad, callback) {
                        return {

                                key: key, game_pad: game_pad, callback: callback

                        };
                }
        }, {
                key: 'GamepadEvents',
                value: function GamepadEvents(args) {

                        var gp = {};

                        gp.stick_left = args.stick_left || function (x, y) {

                                //  console.log('Def call');

                        };

                        gp.stick_right = args.stick_right || function (x, y) {};

                        gp.buttons = [];

                        gp.extendFunc = function (f1, f2) {

                                var fc = f2;

                                return function (x, y) {

                                        f2(x, y);

                                        f1(x, y);
                                };
                        };

                        gp.on = function (key, callback) {

                                if (this[key] && key !== "on") {

                                        var current_cb = typeof this[key] == 'function' ? this[key] : function (x, y) {};

                                        this[key] = this.extendFunc(callback, current_cb);
                                } else if (key.indexOf('button') >= 0 && key.indexOf('_') >= 0) {
                                        var parts = key.split('_');

                                        var number;

                                        try {

                                                number = parseInt(parts[1]);

                                                var current_cb = typeof this['buttons'][number] == 'function' ? this['buttons'][number] : function (x, y) {};

                                                this['buttons'][number] = this.extendFunc(callback, current_cb);
                                        } catch (e) {
                                                console.error('could not parse "on" event with ' + key);
                                        }
                                }
                        };

                        gp.constructor = { name: "GamepadEvents" };

                        this.__gamepads.push(gp);

                        Gamestack.gamepads = this.__gamepads;

                        return gp;
                }
        }, {
                key: 'getGamepads',
                value: function getGamepads() {
                        return Gamestack.gamepads;
                }
        }, {
                key: 'process',
                value: function process(gp, gpEvents) {

                        this.process_buttons(gp, gpEvents);

                        this.process_axes(gp, gpEvents);
                }
        }, {
                key: 'process_axes',
                value: function process_axes(gp, events) {

                        if (!gp || !gp['axes']) {

                                return false;
                        }

                        for (var i = 0; i < gp.axes.length; i += 2) {

                                var axis1 = gp.axes[i],
                                    axia2 = gp.axes[i + 1];

                                var ix = Math.ceil(i / 2) + 1,
                                    x = gp.axes[i],
                                    y = gp.axes[i + 1];

                                if (ix == 1 && events.stick_left) {
                                        events.stick_left(x, y);
                                }

                                if (ix == 2 && events.stick_right) {
                                        events.stick_right(x, y);
                                }

                                if (this.events && this.events['stick_' + i] && typeof this.events['stick_' + i].callback == 'function') {
                                        this.events['stick_' + i].callback();
                                }
                        }
                }
        }, {
                key: 'process_buttons',
                value: function process_buttons(gp, events) {

                        if (!gp || !gp['buttons']) {
                                return false;
                        }

                        for (var i = 0; i < gp.buttons.length; i++) {

                                if (!events.buttons) break;else if (events.buttons.length > i && typeof events.buttons[i] == 'function') {
                                        events.buttons[i](gp.buttons[i].pressed);
                                } else if (events.buttons.length > i && _typeof(events.buttons[i]) == 'object' && typeof events.buttons[i].update == 'function') {
                                        events.buttons[i].update(events.buttons[i].pressed);
                                }
                                var clearance_1 = this.events && this.events[i],
                                    gpc,
                                    bkey = "button_" + i;

                                if (clearance_1) {
                                        gpc = this.events[bkey] && !isNaN(this.events[bkey].game_pad) ? this.gamepads[this.events[bkey].game_pad] : this.events[bkey].game_pad;
                                }
                                ;

                                if (clearance_1 && gpc && typeof this.events[bkey].callback == 'function') {
                                        //call the callback
                                        this.events[i].callback();
                                }
                        }
                }
        }, {
                key: 'on',
                value: function on(key, gpix, callback) {

                        if (gpix >= this.__gamepads.length) {

                                this.__gamepads.push(this.GamepadEvents({}));
                        }

                        this.__gamepads[gpix].on(key, callback);
                }
        }]);

        return GamepadAdapter;
}();

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

if (!__gameInstance.GamepadAdapter) {
        Gamestack.GamepadAdapter = new GamepadAdapter();

        // __gameInstance.gamepads.push(gamepad);
}
;function makeArray(obj) {

        if (obj instanceof Array) {} else {
                obj = [obj];
        }
        return obj;
};

(function () {
        console.log('GSEvent class... creating');

        var GSEvent = function GSEvent() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, GSEvent);

                this.name = args.name || "blankEvent";

                this.objects = args.objects || args.object || args.obj || [];

                this.siblings = args.siblings || args.sibling || args.sibs || args.sib || [];
        };

        function GSEventLink(extendedObject, extendedKey, extendor, extendorKey) {
                this.parent_id = extendedObject.id, this.child_id = extendor.id, this.parent_key = extendedKey, this.child_key = extendorKey;
        };

        var InputEvent = function (_GSEvent) {
                _inherits(InputEvent, _GSEvent);

                function InputEvent(args) {
                        _classCallCheck(this, InputEvent);

                        //Run the Q() function

                        var _this2 = _possibleConstructorReturn(this, (InputEvent.__proto__ || Object.getPrototypeOf(InputEvent)).call(this, args));

                        var btnix = args.btnix || args.button_ix || false,
                            gpix = args.gpix || args.gamepad_ix || 0,
                            callback = args.callback || function () {};

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

                        return _this2;
                }

                return InputEvent;
        }(GSEvent);

        ;

        var CollisionEvent = function (_GSEvent2) {
                _inherits(CollisionEvent, _GSEvent2);

                function CollisionEvent() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                        var arg2 = arguments[1];
                        var arg3 = arguments[2];

                        _classCallCheck(this, CollisionEvent);

                        //TODO:error if Gamestack is animating :: only before animate

                        var _this3 = _possibleConstructorReturn(this, (CollisionEvent.__proto__ || Object.getPrototypeOf(CollisionEvent)).call(this, args));

                        var callback = function callback() {};

                        if (args && arg2 && arg3) {
                                _this3.objects = makeArray(args);

                                _this3.siblings = makeArray(arg2);

                                callback = arg3;
                        } else {

                                callback = args.callback || function () {};
                        }

                        $Q(_this3.objects).on('collide', $Q(_this3.siblings), function (obj1, obj2) {

                                callback(obj1, obj2);
                        });

                        return _this3;
                }

                return CollisionEvent;
        }(GSEvent);

        ;

        var BoolEvent = function (_GSEvent3) {
                _inherits(BoolEvent, _GSEvent3);

                function BoolEvent(args) {
                        _classCallCheck(this, BoolEvent);

                        var _this4 = _possibleConstructorReturn(this, (BoolEvent.__proto__ || Object.getPrototypeOf(BoolEvent)).call(this, args));

                        _this4.on = args.on || function () {
                                console.info('CustomBoolEvent():needs .on function(){} returning bool argument');
                        };
                        /*Defaults to false to avoid broken code*/

                        _this4.callback = args.callback || function () {
                                console.info('CustomBoolEvent():needs .callback function(){} argument');
                        };

                        var __inst = _this4;

                        console.info('CustomBoolEvent():: this class is due for completion soon, still in development.');

                        return _this4;
                }

                return BoolEvent;
        }(GSEvent);

        ;

        Gamestack.GSEvent = GSEvent;

        Gamestack.GSEventLink = GSEventLink;

        Gamestack.InputEvent = InputEvent;

        Gamestack.CollisionEvent = CollisionEvent;

        Gamestack.BoolEvent = BoolEvent;
})();; /*
       * Gamestack.GSProton: -An implementation of the Proton.js particle engine.
       * :instantiable
       * :data-persistent / json format
       * :reloadable
       * :__presets : various GSProton objects for in-game-use
       *
       * */

(function () {
        console.log('CanvasStack class... creating');

        /**
         * Gamestack.GSProton: Takes arguments of image, canvas, parent, collideables?
           * @param   {image} the img
         * @param   {canvas} canvas to draw on
         * @param   {parent} the parent, either a position{x,y,z} or object with a 'position' property having x,y,z
         * @returns {GSProton} a GSProton object
         */

        var GSProton = function () {
                function GSProton(image, canvas, parent, collideables) {
                        _classCallCheck(this, GSProton);

                        var args = { image: image, canvas: canvas, parent: parent, collideables: collideables };

                        if (image.image && image.canvas) //image is a GS Proton passed back through constructor as first argument --enable data persistence
                                {

                                        args = image;
                                }

                        args.canvas = args.canvas || Gamestack.canvas;

                        args.parent = args.parent || new Gamestack.Vector(0, 0, 0);

                        args.image = args.image || new Gamestack.GameImage();

                        this.name = args.name || "__NO-Name";

                        this.description = args.description || "__NO-Description";

                        this.image = args.image;

                        this.active = false;

                        this.image = args.image;

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

                                position: new Vector(0, 0),

                                min: 0,

                                max: 0

                        };

                        this.repulsion = {

                                position: new Gamestack.Vector(0, 0),

                                min: 0,

                                max: 0

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

                        for (var x in this) {
                                if (args.hasOwnProperty(x)) {

                                        this[x] = args[x];
                                }
                        }

                        //the following instantiate to empty []

                        this.initializers = [];

                        this.behaviors = [];
                }

                _createClass(GSProton, [{
                        key: 'replaceBehaviorByType',
                        value: function replaceBehaviorByType(constructor, replacement) {

                                for (var x in this.behaviors) //remove any existing object by type
                                {
                                        if (this.behaviors[x] instanceof constructor) {

                                                this.behaviors.splice(x, 1);
                                        }
                                }

                                this.behaviors.push(replacement);

                                this.ticker = 0;
                        }
                }, {
                        key: 'Collideables',
                        value: function Collideables(collideableArray) {
                                this.collideables = collideableArray;
                        }
                }, {
                        key: 'Rotation',
                        value: function Rotation(minRot, maxRot) {

                                maxRot = maxRot || minRot; //they are either positive-number or the same
                                this.vSpeedRotationMin = minRot;

                                this.vSpeedRotationMax = maxRot;

                                this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));
                        }
                }, {
                        key: 'Gravity',
                        value: function Gravity(grav) {

                                this.gravity = grav;

                                this.replaceBehaviorByType(Proton.Gravity, new Proton.Gravity(this.gravity));
                        }
                }, {
                        key: 'Velocity',
                        value: function Velocity(minV, maxV) {

                                maxV = maxV || minV; //they are either positive-number or the same
                                this.vSpeedMin = minV;

                                this.vSpeedMax = maxV;

                                this.replaceBehaviorByType(Proton.V, new Proton.V(new Proton.Span(this.vSpeedMin, this.vSpeedMax), new Proton.Span(this.vSpeedRotationMin, this.vSpeedRotationMax), 'polar'));
                        }
                }, {
                        key: 'Attraction',
                        value: function Attraction(position, min, max) {
                                this.usingAttraction = true;

                                this.attraction.position = position;

                                this.attraction.min = min;

                                this.attraction.max = max;
                        }
                }, {
                        key: 'Repulsion',
                        value: function Repulsion(x, y, min, max) {
                                this.usingRepulsion = true;

                                this.repulsion.position = position;

                                this.repulsion.min = min;

                                this.repulsion.max = max;
                        }
                }, {
                        key: 'onUpdate',
                        value: function onUpdate() {}
                }, {
                        key: 'isRectangularCollision',
                        value: function isRectangularCollision(obj1, obj2) {

                                return obj1.position.x + obj1.size.x > obj2.position.x && obj1.position.y + obj1.size.y > obj2.position.y && obj1.position.x < obj2.position.x + obj2.size.x && obj1.position.y < obj2.position.y + obj2.size.y;
                        }
                }, {
                        key: 'collide',
                        value: function collide(obj1, obj2) {
                                console.log('collide() function UNSET');
                        }
                }, {
                        key: 'update',
                        value: function update(collideables) {

                                collideables = collideables || this.collideables || [];

                                this.ticker += 1;

                                if (this.ticker % 100 == 0) {

                                        console.log('Proton:update():');
                                        console.log(this.emitter);
                                }

                                if (this.positionX_asRandom) {
                                        this.emitter.p.x = Math.floor(Math.random() * canvas.width);
                                } else {
                                        this.emitter.p.x = this.positionX;
                                }

                                if (this.positionY_asRandom) {
                                        this.emitter.p.y = Math.floor(Math.random() * canvas.width);
                                } else {
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

                                                        this.collide(p, collideables[y]);
                                                }
                                        }
                                }
                        }
                }, {
                        key: 'init',
                        value: function init() {

                                this.proton = new Proton();

                                this.emit_mode = this.emit_mode || "";

                                this.emitter = new Proton.Emitter();

                                this.emission_amount = this.emission_amount || 10;

                                this.emissions_frequency = this.emissions_frequency || 10;

                                var rps = 5 / this.emissions_frequency;

                                this.emitter.rate = new Proton.Rate([this.emission_amount_min, this.emission_amount_max], rps);

                                function allNumbers(list) {
                                        for (var x in list) {
                                                if (typeof list[x] == 'number') {} else {
                                                        return false;
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

                                if (this.usingPointZone) {

                                        this.initializers.push(new Proton.Position(new Proton.PointZone(this.pointZoneX, this.pointZoneY)));
                                }

                                this.behaviors.push(new Proton.Gravity(this.gravity));

                                this.behaviors.push(new Proton.Alpha(1, [this.startAlpha, this.endAlpha]));

                                this.behaviors.push(new Proton.Color(this.startColor_asRandom ? 'random' : this.startColor, this.endColor_asRandom ? 'random' : this.endColor, Infinity, Proton.easeInSine));

                                this.behaviors.push(new Proton.Scale(this.startScale, this.endScale));

                                if (allNumbers([this.attractionX, this.attractionY, this.attractionMin, this.attractionMax])) {
                                        console.info('Creating attraction');

                                        this.behaviors.push(new Proton.Attraction({ x: this.attractionX, y: this.attractionY }, this.attractionMin, this.attractionMax));
                                }

                                if (allNumbers([this.repulsionX, this.repulsionY, this.repulsionMin, this.repulsionMax])) {
                                        console.info('Creating repulsion');

                                        this.behaviors.push(new Proton.Repulsion({ x: this.repulsionX, y: this.repulsionY }, this.repulsionMin, this.repulsionMax));
                                }

                                if (this.usingAttraction) {
                                        this.behaviors.push(new Proton.Attraction(this.attraction.position, this.attraction.min, this.attraction.max));
                                }

                                if (this.usingRepulsion) {
                                        this.behaviors.push(new Proton.Repulsion(this.repulsion.position, this.repulsion.min, this.repulsion.max));
                                }

                                if (this.radius > 0) {
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

                                this.emitter.p = this.parent && this.parent.hasOwnProperty('position') && this.parent.position.hasOwnProperty('x') ? new Vector(this.parent.position) : this.emitter.p;

                                this.emitter.p.x += this.positionX;
                                this.emitter.p.y += this.positionY;

                                this.emitter.emit();

                                this.proton.addEmitter(this.emitter);

                                this.renderer = new Proton.Renderer('canvas', this.proton, this.canvas);

                                if (this.usingBlendAlpha) {
                                        this.renderer.blendFunc("SRC_ALPHA", "ONE");
                                }

                                var __inst = this;

                                this.renderer.start();

                                this.tick();
                        }
                }, {
                        key: 'on',
                        value: function on() {
                                this.init();
                        }
                }, {
                        key: 'off',
                        value: function off() {
                                if (this.emitter && this.emitter.stopEmit) this.emitter.stopEmit();
                        }
                }, {
                        key: 'tick',
                        value: function tick() {

                                requestAnimationFrame(function () {
                                        __inst.tick();
                                });

                                var __inst = this;

                                this.proton.update();
                                // this.update();
                        }
                }]);

                return GSProton;
        }();

        var ProtonPresets = {

                //particleDemoName:new GSProton();   //add particleDemoObjects


        };

        Gamestack.GSProton = GSProton;
})();
;
var head = document.head || document.getElementsByTagName('head')[0];

head.innerHTML += '<style>' + '\r\n' + '.speech-triangle { overflow:visible; }' + '.speech-triangle:before { content: "";' + 'position: absolute;' + 'z-index:-1;' + 'width: 0;' + 'height: 0;' + 'left: 38px;' + 'bottom: -18px;' + 'border-width: 8px 8px;' + 'border-style: solid;' + 'border-color: #fff transparent transparent #fff;' + ' } .farLeft:after{ right:0px; left:20px; } .farRight:after{ left:0px; right:20px; }   .flipX:after{  -moz-transform: scaleX(-1); -webkit-transform: scaleX(-1); -o-transform: scaleX(-1); transform: scaleX(-1); -ms-filter: fliph; /*IE*/ filter: fliph; /*IE*/  } ' + ' </style>';

(function () {
        console.log('HtmlExtra classes... creating');

        var HtmlExtra //to do apply a super object 'Extra'
        = function () {
                function HtmlExtra() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, HtmlExtra);

                        this.applyCSSArgs(args);
                }

                _createClass(HtmlExtra, [{
                        key: 'applyCSSArgs',
                        value: function applyCSSArgs(args) {
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

                                if (this.bottomFloat >= 0) {

                                        this.targetBottom = this.get_float_pixels(this.bottomFloat, document.body.clientHeight);
                                } else {

                                        this.targetTop = this.get_float_pixels(this.topFloat, document.body.clientHeight);
                                }

                                this.fadeTime = {

                                        in: 200,

                                        out: 200
                                };
                        }
                }, {
                        key: 'Top',
                        value: function Top(v) {

                                this.targetTop = this.get_float_pixels(v, document.body.clientHeight);

                                this.domElement.style.bottom = 'auto';
                                this.domElement.style.top = this.targetTop;

                                return this;
                        }
                }, {
                        key: 'Left',
                        value: function Left(v) {

                                this.targetLeft = this.get_float_pixels(v, document.body.clientWidth);

                                this.domElement.style.right = 'auto';
                                this.domElement.style.left = this.targetLeft;

                                return this;
                        }
                }, {
                        key: 'Bottom',
                        value: function Bottom(v) {

                                this.targetBottom = this.get_float_pixels(v, document.body.clientHeight);

                                this.domElement.style.top = 'auto';
                                this.domElement.style.bottom = this.targetBottom;

                                return this;
                        }
                }, {
                        key: 'Right',
                        value: function Right(v) {

                                this.targetRight = this.get_float_pixels(v, document.body.clientWidth);

                                this.domElement.style.left = 'auto';
                                this.domElement.style.right = this.targetRight;

                                return this;
                        }
                }, {
                        key: 'FontSize',
                        value: function FontSize(v) {

                                this.domElement.style.fontSize = v;

                                return this;
                        }
                }, {
                        key: 'FontFamily',
                        value: function FontFamily(v) {

                                this.domElement.style.fontFamily = v;

                                return this;
                        }
                }, {
                        key: 'FontSize',
                        value: function FontSize(v) {

                                this.domElement.style.fontSize = v;

                                return this;
                        }
                }, {
                        key: 'Text',
                        value: function Text(v) {
                                this.domElement.innerText = v;

                                return this;
                        }
                }, {
                        key: 'Background',
                        value: function Background(v) {
                                this.domElement.style.background = v;

                                return this;
                        }
                }, {
                        key: 'Duration',
                        value: function Duration(d) {

                                this.duration = d;

                                return this;
                        }
                }, {
                        key: 'FadeTime',
                        value: function FadeTime(fadeInTime, fadeOutTime) {

                                this.fadeTime = {

                                        in: fadeInTime || 250,

                                        out: fadeOutTime || 250

                                };

                                return this;
                        }
                }, {
                        key: 'Color',
                        value: function Color(c) {
                                this.domElement.style.color = c;

                                return this;
                        }
                }, {
                        key: 'get_float_pixels',
                        value: function get_float_pixels(float, dimen) {
                                return Math.round(dimen * float) + 'px';
                        }
                }, {
                        key: 'onComplete',
                        value: function onComplete(fun) {

                                this.complete = fun;

                                return this;
                        }
                }, {
                        key: 'show',
                        value: function show(text, duration) {
                                //create an html element

                                document.body.append(this.domElement);

                                var __inst = this;

                                if (this.show_interval) {
                                        clearInterval(this.show_interval);
                                }

                                this.show_interval = setInterval(function () {

                                        var o = parseFloat(__inst.domElement.style.opacity);

                                        if (o < 1.0) {
                                                o += 1.0 * (20 / __inst.fadeTime.in);

                                                __inst.domElement.style.opacity = o;
                                        }
                                }, 20);

                                setTimeout(function () {

                                        clearInterval(__inst.show_interval);

                                        __inst.hide_interval = setInterval(function () {

                                                var o = parseFloat(__inst.domElement.style.opacity);

                                                if (o > 0) {
                                                        o -= 1.0 * (20 / __inst.fadeTime.out);

                                                        __inst.domElement.style.opacity = o;
                                                } else {

                                                        __inst.domElement.style.opacity = o;

                                                        if (typeof __inst.complete == 'function') {
                                                                __inst.complete();
                                                        }

                                                        clearInterval(__inst.hide_interval);
                                                }
                                        }, 20);
                                }, __inst.duration);
                        }
                }, {
                        key: 'update',
                        value: function update() {}
                }]);

                return HtmlExtra;
        }();

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

        var TextDisplay = function (_HtmlExtra) {
                _inherits(TextDisplay, _HtmlExtra);

                function TextDisplay() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, TextDisplay);

                        var _this5 = _possibleConstructorReturn(this, (TextDisplay.__proto__ || Object.getPrototypeOf(TextDisplay)).call(this, args));

                        if (!args) {
                                args = {};
                        }

                        _this5.duration = args.duration || 5000;

                        _this5.complete = args.complete || function () {};

                        _this5.create_dom();
                        return _this5;
                }

                _createClass(TextDisplay, [{
                        key: 'create_dom',
                        value: function create_dom() {
                                this.domElement = document.createElement('SPAN');

                                this.domElement.style.position = "fixed";

                                this.domElement.style.color = this.color;

                                this.domElement.style.padding = "10px";

                                if (!this.targetBottom >= 0) {

                                        this.domElement.style.top = Math.round(document.body.clientHeight * this.topFloat) + 'px';
                                } else {

                                        this.domElement.style.bottom = Math.round(document.body.clientHeight * this.bottomFloat) + 'px';
                                }

                                if (!this.targetRight >= 0) {

                                        this.domElement.style.left = Math.round(document.body.clientWidth * this.leftFloat) + 'px';
                                } else {

                                        this.domElement.style.right = Math.round(document.body.clientWidth * this.rightFloat) + 'px';
                                }

                                this.domElement.style.width = '90%';

                                this.domElement.style.left = "5%";

                                this.domElement.style.height = 'auto';

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
                }]);

                return TextDisplay;
        }(HtmlExtra);

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

        var ImageStatDisplay = function (_HtmlExtra2) {
                _inherits(ImageStatDisplay, _HtmlExtra2);

                function ImageStatDisplay() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, ImageStatDisplay);

                        var _this6 = _possibleConstructorReturn(this, (ImageStatDisplay.__proto__ || Object.getPrototypeOf(ImageStatDisplay)).call(this, args));

                        _this6.src = args.src || "__NONE";

                        _this6.size = args.size || new Vector3(50, 50);

                        _this6.text_id = GameStack.create_id();

                        _this6.id = GameStack.create_id();

                        _this6.img_id = GameStack.create_id();

                        _this6.create_dom();

                        return _this6;
                }

                _createClass(ImageStatDisplay, [{
                        key: 'setValue',
                        value: function setValue(value) {
                                document.getElementById(this.text_id);
                        }
                }, {
                        key: 'get_float_pixels',
                        value: function get_float_pixels(float, dimen) {
                                return Math.round(dimen * float) + 'px';
                        }
                }, {
                        key: 'get_id',
                        value: function get_id() {
                                return this.id;
                        }
                }, {
                        key: 'update',
                        value: function update(v) {
                                var e = document.getElementById(this.text_id);

                                this.text = v + "";

                                e.innerText = this.text;
                        }
                }, {
                        key: 'create_dom',
                        value: function create_dom() {
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
                }, {
                        key: 'show',
                        value: function show(x, y) {

                                this.domElement.style.left = x + "px";

                                this.domElement.style.top = y + "px";

                                document.body.append(this.domElement);
                        }
                }]);

                return ImageStatDisplay;
        }(HtmlExtra);

        Gamestack.ImageStatDisplay = ImageStatDisplay;

        var Bar = function () {
                function Bar(background, border) {
                        _classCallCheck(this, Bar);

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

                _createClass(Bar, [{
                        key: 'width',
                        value: function width(w) {
                                this.domElement.style.width = w;

                                return this;
                        }
                }, {
                        key: 'height',
                        value: function height(h) {
                                this.domElement.style.height = h;

                                return this;
                        }
                }]);

                return Bar;
        }();

        Gamestack.Bar = Bar;

        var BarFill = function () {
                function BarFill(background) {
                        _classCallCheck(this, BarFill);

                        this.background = background;
                        var e = document.createElement("SPAN");

                        e.style.background = this.background;

                        e.style.position = 'fixed';

                        e.style.zIndex = "9995";

                        this.domElement = e;
                }

                _createClass(BarFill, [{
                        key: 'width',
                        value: function width(w) {
                                this.domElement.style.width = w;

                                return this;
                        }
                }, {
                        key: 'height',
                        value: function height(h) {
                                this.domElement.style.height = h;

                                return this;
                        }
                }]);

                return BarFill;
        }();

        Gamestack.BarFill = BarFill;

        var BarDisplay = function (_HtmlExtra3) {
                _inherits(BarDisplay, _HtmlExtra3);

                //show BarDisplay as in 'health-bar'

                function BarDisplay() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, BarDisplay);

                        var _this7 = _possibleConstructorReturn(this, (BarDisplay.__proto__ || Object.getPrototypeOf(BarDisplay)).call(this, args));

                        _this7.border = args.border || "none";

                        if (args.fill_src) {
                                _this7.fill = new BarFill(args.fill_src).width(args.fill_width || "80px").height(args.fill_height || "10px");
                        } else {
                                _this7.fill = args.fill || new BarFill(args.fill_color || 'green').width(args.fill_width || "80px").height(args.fill_height || "10px");
                        }

                        if (args.bar_src) {
                                _this7.bar = new Bar(args.bar_src, _this7.border).width(args.bar_width || "80px").height(args.bar_height || "10px");
                        } else {
                                _this7.bar = new Bar(args.bar_color || 'goldenrod', _this7.border).width(args.bar_width || "80px").height(args.bar_height || "10px");
                        }

                        return _this7;
                }

                _createClass(BarDisplay, [{
                        key: 'show',
                        value: function show() {

                                document.body.append(this.fill.domElement);

                                document.body.append(this.bar.domElement);
                        }
                }, {
                        key: 'get_float_pixels',
                        value: function get_float_pixels(float, dimen) {
                                return Math.round(dimen * float) + 'px';
                        }
                }, {
                        key: 'portion_top',
                        value: function portion_top(v) {

                                this.fill.domElement.style.top = this.get_float_pixels(v || this.topFloat, GameStack.HEIGHT);

                                this.bar.domElement.style.top = this.get_float_pixels(v || this.topFloat, GameStack.HEIGHT);
                        }
                }, {
                        key: 'portion_left',
                        value: function portion_left(v) {

                                this.fill.domElement.style.left = this.get_float_pixels(v || this.leftFloat, GameStack.WIDTH);

                                this.bar.domElement.style.left = this.get_float_pixels(v || this.leftFloat, GameStack.WIDTH);
                        }
                }, {
                        key: 'portion_width',
                        value: function portion_width(w) {

                                this.fill.domElement.style.width = this.get_float_pixels(w || this.widthFloat, GameStack.WIDTH);

                                this.bar.domElement.style.width = this.get_float_pixels(w || this.widthFloat, GameStack.WIDTH);
                        }
                }, {
                        key: 'portion_height',
                        value: function portion_height(h) {
                                this.fill.domElement.style.height = this.get_float_pixels(h || this.heightFloat, GameStack.HEIGHT);

                                this.bar.domElement.style.height = this.get_float_pixels(h || this.heightFloat, GameStack.HEIGHT);
                        }
                }, {
                        key: 'update',
                        value: function update(f) {
                                this.fill.domElement.style.width = this.get_float_pixels(f || 0, parseFloat(this.bar.domElement.style.width));
                        }
                }]);

                return BarDisplay;
        }(HtmlExtra);

        Gamestack.BarDisplay = BarDisplay;

        var TextBubble = function (_HtmlExtra4) {
                _inherits(TextBubble, _HtmlExtra4);

                function TextBubble() //merely an element of text
                {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, TextBubble);

                        var _this8 = _possibleConstructorReturn(this, (TextBubble.__proto__ || Object.getPrototypeOf(TextBubble)).call(this, args));

                        _this8.opacity = args.opacity || 0.85;

                        _this8.create_dom();

                        _this8.duration = args.stay || args.duration || _this8.text.length * 100;

                        return _this8;
                }

                _createClass(TextBubble, [{
                        key: 'create_dom',
                        value: function create_dom() {
                                this.domElement = document.createElement('SPAN');

                                this.domElement.setAttribute('class', 'speech-triangle');

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
                }]);

                return TextBubble;
        }(HtmlExtra);

        Gamestack.TextBubble = TextBubble;
})();
;

var Level = function () {
        function Level() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, Level);

                this.sprites = args.sprites || [];

                this.backgrounds = args.backgrounds || [];

                this.terrains = args.terrains || [];

                this.interactives = args.interactives || [];

                this.threes = args.threes || []; //3d objects
        }

        _createClass(Level, [{
                key: 'add',
                value: function add() {}
        }, {
                key: 'add_all_to_game',
                value: function add_all_to_game() {}
        }]);

        return Level;
}();

;
(function () {
        console.log('Line() class... creating');

        var Curves = { //ALL HAVE INPUT AND OUTPUT OF: 0-1.0
                // no easing, no acceleration
                linearNone: function linearNone(t) {
                        return t;
                },

                // accelerating from zero velocity
                easeInQuadratic: function easeInQuadratic(t) {
                        return t * t;
                },
                // decelerating to zero velocity
                easeOutQuadratic: function easeOutQuadratic(t) {
                        return t * (2 - t);
                },
                // acceleration until halfway, then deceleration
                easeInOutQuadratic: function easeInOutQuadratic(t) {
                        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                },
                // accelerating from zero velocity
                easeInCubic: function easeInCubic(t) {
                        return t * t * t;
                },
                // decelerating to zero velocity
                easeOutCubic: function easeOutCubic(t) {
                        return --t * t * t + 1;
                },
                // acceleration until halfway, then deceleration
                easeInOutCubic: function easeInOutCubic(t) {
                        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                },
                // accelerating from zero velocity
                easeInQuartic: function easeInQuartic(t) {
                        return t * t * t * t;
                },
                // decelerating to zero velocity
                easeOutQuartic: function easeOutQuartic(t) {
                        return 1 - --t * t * t * t;
                },
                // acceleration until halfway, then deceleration
                easeInOutQuartic: function easeInOutQuartic(t) {
                        return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
                },
                // accelerating from zero velocity
                easeInQuintic: function easeInQuintic(t) {
                        return t * t * t * t * t;
                },
                // decelerating to zero velocity
                easeOutQuintic: function easeOutQuintic(t) {
                        return 1 + --t * t * t * t * t;
                },
                // acceleration until halfway, then deceleration
                easeInOutQuintic: function easeInOutQuintic(t) {
                        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
                }
        };

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

                quadratic: function quadratic(t) {
                        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                },

                cubic: function cubic(t) {
                        return t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                },

                quartic: function quartic(t) {
                        return t < .5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t;
                },

                quintic: function quintic(t) {
                        return t < .5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t;
                },

                linear: function linear(t) {
                        return t;
                } //provided for consistency / in case 'linear' is needed

        };

        Gamestack.Curves.InOut = inOutCurves;

        var Line = function () {
                function Line() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, Line);

                        this.points = [];

                        this.pointDisp = 1;

                        this.size = args.size || new Gamestack.Vector(100, 100, 0);

                        this.position = new Gamestack.Vector(0, 0, 0);
                }

                _createClass(Line, [{
                        key: 'Rot',
                        value: function Rot(r) {

                                this.rotation = r;

                                return this;
                        }
                }, {
                        key: 'Pos',
                        value: function Pos(p) {

                                this.position = p;

                                if (typeof p == 'number') {
                                        this.position = new Gamestack.Vector(p, p, p);
                                } else {

                                        this.position = p;
                                }

                                return this;
                        }
                }, {
                        key: 'Size',
                        value: function Size(s) {

                                this.size = s;

                                if (typeof s == 'number') {
                                        this.size = new Gamestack.Vector(s, s, s);
                                }

                                return this;
                        }
                }, {
                        key: 'Dispersion',
                        value: function Dispersion(num) {
                                this.pointDisp = num;
                                return this;
                        }
                }, {
                        key: 'Curve',
                        value: function Curve(c, size) {
                                this.curve = c;

                                this.curveMethod = Gamestack.Curves.InOut[this.curve.toLowerCase()];

                                if (c) this.curve_size = new Gamestack.Vector(size);

                                return this;
                        }
                }, {
                        key: 'CurveSize',
                        value: function CurveSize(s) {

                                if (typeof s == 'number') {
                                        this.curve_size = new Gamestack.Vector(s, s, s);
                                } else {

                                        this.curve_size = s;
                                }

                                return this;
                        }
                }, {
                        key: 'Duration',
                        value: function Duration(d) {
                                this.duration = d;

                                return this;
                        }
                }, {
                        key: 'Fill',
                        value: function Fill() {

                                var current_point = new Gamestack.Vector(0, 0, 0);

                                for (var x = 0; x <= Math.abs(this.size.x); x++) {

                                        var position = new Gamestack.Vector(x, 0, 0);

                                        if (current_point.trig_distance_xy(position) >= this.pointDisp) {
                                                this.points.push(new Gamestack.Vector(position));

                                                current_point = new Gamestack.Vector(position);
                                        }
                                }

                                this.TransposeByRotation(this.rotation);

                                return this;
                        }
                }, {
                        key: 'TransposeByRotation',
                        value: function TransposeByRotation(rotation) {

                                this.rotation = rotation;

                                function rotate(cx, cy, x, y, angle) {
                                        var radians = Math.PI / 180 * angle,
                                            cos = Math.cos(radians),
                                            sin = Math.sin(radians),
                                            nx = cos * (x - cx) + sin * (y - cy) + cx,
                                            ny = cos * (y - cy) - sin * (x - cx) + cy;
                                        return new Gamestack.Vector(nx, ny);
                                }

                                for (var x = 0; x < this.points.length; x++) {

                                        var p = this.points[x];

                                        var np = rotate(this.position.x, this.position.y, p.x, p.y, this.rotation);

                                        this.points[x] = np;
                                }

                                return this;
                        }
                }, {
                        key: 'Highlight',
                        value: function Highlight(sprite, ctx, gameWindow) {

                                this.highlight_sprites = this.highlight_sprites || [];

                                ctx = ctx || Gamestack.ctx;

                                var points = this.points;

                                gameWindow = gameWindow || Gamestack.game_windows[0];

                                for (var x in points) {

                                        console.log(points[x]);

                                        if (!this.highlight_sprites[x]) {
                                                this.highlight_sprites[x] = gameWindow.add(new Gamestack.Sprite(sprite), ctx);
                                        }

                                        var point = points[x];

                                        this.highlight_sprites[x].position = new Gamestack.Vector(point.sub(this.highlight_sprites[x].size.div(2)));
                                }

                                return this;
                        }
                }, {
                        key: 'RemoveHighlight',
                        value: function RemoveHighlight(sprite, ctx, gameWindow) {
                                gameWindow = gameWindow || Gamestack.game_windows[0];

                                for (var x in this.highlight_sprites) {
                                        gameWindow.remove(this.highlight_sprites[x]);
                                }

                                this.highlight_sprites = [];

                                return this;
                        }
                }]);

                return Line;
        }();

        Gamestack.Line = Line;

        var WaveLine = function (_Line) {
                _inherits(WaveLine, _Line);

                function WaveLine(pos, size, curve_key) {
                        _classCallCheck(this, WaveLine);

                        var args = {};

                        if (typeof size == 'number' || size instanceof Gamestack.Vector) {
                                var _this9 = _possibleConstructorReturn(this, (WaveLine.__proto__ || Object.getPrototypeOf(WaveLine)).call(this, {}));
                        } else if (size instanceof Object) {
                                var _this9 = _possibleConstructorReturn(this, (WaveLine.__proto__ || Object.getPrototypeOf(WaveLine)).call(this, size));

                                args = size;
                        }

                        _this9.Pos(pos);

                        _this9.Size(size);

                        _this9.curve_options = Curves; //Curves Object (of functions)

                        curve_key = curve_key || args.curve_key || "quadratic";

                        _this9.curve = curve_key ? curve_key.toLowerCase() : "quadratic";

                        _this9.curve_options = ['cubic', 'quartic', 'quadratic', 'quintic', 'sine'];

                        _this9.curveMethod = Gamestack.Curves.InOut[_this9.curve.toLowerCase()];

                        _this9.points = args.points || [];

                        _this9.is_highlighted = args.is_highlighted || false;

                        _this9.offset = args.offset || new Gamestack.Vector(0, 0, 0);

                        _this9.pointDisp = args.pointDisp || 5;

                        _this9.rotation = args.rotation || 0;

                        _this9.iterations = args.iterations || 1;

                        _this9.max_size = args.max_size || _this9.size || new Gamestack.Vector(5000, 5000);

                        _this9.growth = args.growth || 1.0;

                        return _possibleConstructorReturn(_this9);
                }

                _createClass(WaveLine, [{
                        key: 'Max',
                        value: function Max(p) {

                                this.target = p;

                                if (typeof p == 'number') {
                                        this.target = new Gamestack.Vector(p, p, p);
                                } else {

                                        this.target = p;
                                }

                                this.max = this.target; //'max' is synonymous with 'target'

                                return this;
                        }
                }, {
                        key: 'Min',
                        value: function Min(p) {

                                this.position = p;

                                if (typeof p == 'number') {
                                        this.position = new Gamestack.Vector(p, p, p);
                                } else {

                                        this.tposition = p;
                                }

                                this.min = this.position; //'max' is synonymous with 'target'

                                return this;
                        }
                }, {
                        key: 'Decay',
                        value: function Decay(n) {
                                if (n < -1.0) n = -1.0;

                                if (n > 1.0) {
                                        n = 1.0;
                                }

                                this.growth = 1.0 - n;

                                return this;
                        }
                }, {
                        key: 'next',
                        value: function next(position) {

                                var found = false;

                                for (var x = 0; x < this.points.length; x++) {

                                        if (position.equals(this.points[x]) && x < this.points.length - 1) {
                                                found = true;
                                                return new Gamestack.Vector(this.points[x + 1]);
                                        }

                                        if (x == this.points.length - 1 && !found) {

                                                return new Gamestack.Vector(this.points[0]);
                                        }
                                }
                        }
                }, {
                        key: 'getGraphCanvas',
                        value: function getGraphCanvas(curveCall, existing_canvas) {

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

                                var position = { x: 0, y: 80 };
                                var position_old = { x: 0, y: 80 };

                                this.test_graph_size = new Gamestack.Vector(185, 80 - 20);

                                var points = this.get_line_segment(this.test_graph_size, 5, curveCall);

                                for (var x in points) {
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
                }, {
                        key: 'Fill',
                        value: function Fill() {
                                this.size = new Gamestack.Vector(this.size);

                                var __inst = this;

                                this.points = [];

                                var current_point = new Gamestack.Vector(this.position),
                                    yTrack = 0;

                                var x = 1,
                                    max_recursion = 300;

                                var position = current_point;

                                var dist = new Gamestack.Vector(20, 20, 20);

                                var size = new Gamestack.Vector(this.curve_size || this.size);

                                while (Math.abs(position.x) <= Math.abs(this.max_size.x) && size.x > 2 && dist.x > 2) {

                                        position = new Gamestack.Vector(current_point);

                                        var target = new Gamestack.Vector(position.add(size)),
                                            start = new Gamestack.Vector(position),
                                            curveMethod = this.curveMethod,
                                            ptrack = new Gamestack.Vector(start);

                                        for (position.x = position.x; position.x < Math.abs(target.x); position.x += 1) {

                                                dist = position.sub(start);

                                                var pct = dist.x / size.x;

                                                position.y = start.y + curveMethod(pct) * (x % 2 == 0 ? size.y : size.y * -1);

                                                //  position = position.round();

                                                if (current_point.trig_distance_xy(position) >= this.pointDisp) {

                                                        var p = new Gamestack.Vector(position);

                                                        this.points.push(p);

                                                        current_point = new Gamestack.Vector(position);
                                                }
                                        }

                                        size = size.mult(this.growth);

                                        if (x > max_recursion) {
                                                return console.error('Too much recursion in SwagLine');
                                        }

                                        x += 1;
                                }

                                this.TransposeByRotation(this.rotation);

                                return this;
                        }
                }, {
                        key: 'Rotate',
                        value: function Rotate(rotation) {
                                this.rotation = rotation;

                                if (_typeof(this.rotation) == 'object') {

                                        this.rotation = this.rotation.x;
                                }

                                return this;
                        }
                }]);

                return WaveLine;
        }(Line);

        Gamestack.WaveLine = WaveLine;

        var ShapeLine = function (_Line2) {
                _inherits(ShapeLine, _Line2);

                function ShapeLine() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, ShapeLine);

                        var _this10 = _possibleConstructorReturn(this, (ShapeLine.__proto__ || Object.getPrototypeOf(ShapeLine)).call(this, args));

                        _this10.targetTotalPoints = args.total || 200;

                        return _this10;
                }

                _createClass(ShapeLine, [{
                        key: 'Total',
                        value: function Total(t) {

                                this.targetTotalPoints = t;
                                return this;
                        }
                }, {
                        key: 'Eliptical',
                        value: function Eliptical(pos, size, rotation) {
                                this.Pos(pos || this.position);

                                this.Size(size || this.size);

                                this.Rot(rotation || this.rotation);

                                function fill(elipse) {

                                        elipse.points = [];

                                        var center = elipse.position.add(elipse.size.div(2));

                                        var current_point = new Gamestack.Vector(0, 0, 0);

                                        var a = Math.abs(elipse.size.x / 2),
                                            b = Math.abs(elipse.size.y / 2);

                                        var perim = 2 * Math.PI * Math.sqrt(a * a + b * b);

                                        var step = 2 * Math.PI / elipse.targetTotalPoints;

                                        for (var i = 0 * Math.PI; i < 2 * Math.PI; i += step) {

                                                var p = new Gamestack.Vector(center.x - a * Math.cos(i), center.y + b * Math.sin(i));

                                                elipse.points.push(new Gamestack.Vector(p));

                                                current_point = new Gamestack.Vector(p);
                                        }
                                }

                                fill(this);

                                this.Fill = function () {

                                        fill(this);

                                        return this;
                                };

                                return this;
                        }
                }, {
                        key: 'Quadrilateral',
                        value: function Quadrilateral(pos, size, rotation) {
                                this.Pos(pos || this.position);

                                this.Size(size || this.size);

                                this.Rot(rotation || this.rotation);

                                function fill(quad) {

                                        quad.points = [];

                                        var current_point = new Gamestack.Vector(0, 0, 0);

                                        var perim = 2 * quad.size.x + 2 * quad.size.y,
                                            stepX = quad.size.x / (quad.targetTotalPoints * (quad.size.x / perim)),
                                            stepY = quad.size.y / (quad.targetTotalPoints * (quad.size.y / perim));

                                        for (var x = 0; x < quad.size.x; x += stepX) {
                                                var p1 = new Gamestack.Vector(x, 0).add(quad.position);

                                                quad.points.push(new Gamestack.Vector(p1));
                                        }

                                        for (var y = 0; y < quad.size.y; y += stepY) {
                                                var p1 = new Gamestack.Vector(quad.size.x, y).add(quad.position);

                                                quad.points.push(new Gamestack.Vector(p1));
                                        }

                                        for (var x = quad.size.x; x >= 0; x -= stepX) {
                                                var p1 = new Gamestack.Vector(x, quad.size.y).add(quad.position);

                                                quad.points.push(new Gamestack.Vector(p1));
                                        }

                                        for (var y = quad.size.y; y >= 0; y -= stepY) {
                                                var p1 = new Gamestack.Vector(0, y).add(quad.position);

                                                quad.points.push(new Gamestack.Vector(p1));
                                        }
                                }

                                fill(this);

                                this.Fill = function () {

                                        fill(this);

                                        return this;
                                };

                                return this;
                        }
                }]);

                return ShapeLine;
        }(Line);

        ;

        Gamestack.ShapeLine = ShapeLine;
})();; /**
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

        var Motion = function (_GSO) {
                _inherits(Motion, _GSO);

                function Motion() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, Motion);

                        var _this11 = _possibleConstructorReturn(this, (Motion.__proto__ || Object.getPrototypeOf(Motion)).call(this, args));

                        _this11.state_save = false;

                        _this11.parent = args.parent || Gamestack.Extendors.applyParentalArgs(_this11, args);

                        Gamestack.Extendors.informable(_this11, args);

                        Gamestack.Extendors.tweenable(_this11, args);

                        return _this11;
                }

                _createClass(Motion, [{
                        key: 'restoreState',
                        value: function restoreState() {
                                for (var x in this.state_save) {
                                        this.parent[x] = this.state_save[x];
                                }
                        }
                }]);

                return Motion;
        }(GSO //extends GSO || GamestackOverrideable
        );

        ;

        var TweenMotion = function (_Motion) {
                _inherits(TweenMotion, _Motion);

                //tween the state of an object, including 'position', 'size', and 'rotation' --rotation.x, etc..

                function TweenMotion() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, TweenMotion);

                        var _this12 = _possibleConstructorReturn(this, (TweenMotion.__proto__ || Object.getPrototypeOf(TweenMotion)).call(this, args));

                        _this12.getArg = $Q.getArg;

                        _this12.transition = args.trans || args.transition || "literal" || "add";
                        _this12.transition_options = ['literal', 'add'];

                        if (typeof args.curve == 'string') {
                                args.curve_string = args.curve;
                        }

                        _this12.setTweenCurve(args.curve_string);

                        _this12.target = false;

                        if (args.target) {

                                _this12.target = args.target;
                        }

                        _this12.curvesList = _this12.curvesToArray(); //Tween.Easing

                        _this12.duration = Gamestack.getArg(args, 'duration', 500);

                        _this12.delay = Gamestack.getArg(args, 'delay', 0);
                        return _this12;
                }

                _createClass(TweenMotion, [{
                        key: 'targetCheck',
                        value: function targetCheck(parent) {

                                if (!this.target.position) {
                                        this.target.position = new Vector();
                                }

                                if (!this.target.size) {
                                        this.target.size = new Vector();
                                }

                                if (!this.target.rotation) {
                                        this.target.rotation = new Vector();
                                }
                        }
                }, {
                        key: 'engage',
                        value: function engage() {

                                var __inst = this;

                                __inst.call_on_run(); //call any on-run extensions

                                this.tweens = [];

                                var object = this.parent;

                                this.targetCheck();

                                if (!this.state_save) {

                                        this.state_save = {
                                                position: new Gamestack.Vector(this.parent.position),
                                                rotation: new Gamestack.Vector(this.parent.rotation),
                                                size: new Gamestack.Vector(this.parent.size)
                                        };
                                }

                                if (this.parent && !this.target) {

                                        this.target = {

                                                position: new Gamestack.Vector(this.parent.position),

                                                rotation: new Gamestack.Vector(this.parent.rotation),

                                                size: new Gamestack.Vector(this.parent.size)

                                        };
                                } else if (!this.target) {

                                        this.target = {

                                                position: new Gamestack.Vector(),

                                                rotation: new Gamestack.Vector(),

                                                size: new Gamestack.Vector()

                                        };
                                };

                                if (this.transition !== 'literal') {
                                        //transition is assumed to be additive

                                        this.target.position = object.position.add(this.target.position);
                                        this.target.rotation = object.rotation.add(this.target.rotation);
                                        this.target.size = object.size.add(this.target.size);
                                };

                                //we always have a targetPosition
                                //construct a tween::
                                this.tweens.push(new TWEEN.Tween(object.position).easing(__inst.curve || __inst.motion_curve).to(this.target.position, __inst.duration).onUpdate(function () {
                                        //console.log(objects[0].position.x,objects[0].position.y);


                                }).onComplete(function () {
                                        //console.log(objects[0].position.x, objects[0].position.y);
                                        if (__inst.complete) {

                                                __inst.call_on_complete(); //only call once
                                        }
                                }));

                                this.tweens.push(new TWEEN.Tween(object.rotation).easing(__inst.curve || __inst.motion_curve).to(this.target.rotation, __inst.duration).onUpdate(function () {
                                        //console.log(objects[0].position.x,objects[0].position.y);


                                }).onComplete(function () {
                                        //console.log(objects[0].position.x, objects[0].position.y);
                                        if (__inst.complete) {

                                                __inst.call_on_complete(); //only call once
                                        }
                                }));

                                this.tweens.push(new TWEEN.Tween(object.size).easing(__inst.curve || __inst.motion_curve).to(this.target.size, __inst.duration).onUpdate(function () {
                                        //console.log(objects[0].position.x,objects[0].position.y);


                                }).onComplete(function () {
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

                }, {
                        key: 'start',
                        value: function start() {

                                this.engage();
                        }

                        // obj.getGraphCanvas( $(c.domElement), value.replace('_', '.'), TWEEN.Easing[parts[0]][parts[1]] );

                }, {
                        key: 'getGraphCanvas',
                        value: function getGraphCanvas(t, f, c) {

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

                                var position = { x: 5, y: 80 };
                                var position_old = { x: 5, y: 80 };

                                new TWEEN.Tween(position).to({ x: 175 }, 2000).easing(TWEEN.Easing.Linear.None).start();
                                new TWEEN.Tween(position).to({ y: 20 }, 2000).easing(f).onUpdate(function () {

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
                }, {
                        key: 'getTweenPoints',
                        value: function getTweenPoints(size, line) {

                                //must have line.minPointDist

                                var curve = line.curve,
                                    duration = line.duration;

                                var points = [];

                                var position = new Vector(line.position);

                                var target = new Vector(position).add(size);

                                var start = new Vector(position);

                                var dist = new Vector(0, 0, 0);

                                var ptrack;

                                var easeInOutQuad = function easeInOutQuad(t) {
                                        return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                                };

                                return points;

                                var t1 = new TWEEN.Tween(position).to({ x: target.x }, 2000).easing(TWEEN.Easing.Linear.None).start();

                                if (t2) {
                                        t2.stop();
                                }

                                var t2 = new TWEEN.Tween(position).to({ y: target.y }, 2000).easing(curve).onUpdate(function () {

                                        if (ptrack) {

                                                dist = ptrack.sub(p);

                                                var d = Math.sqrt(dist.x * dist.x + dist.y * dist.y);

                                                if (d >= line.minPointDist) {

                                                        points.push(p);

                                                        ptrack = new Vector(p);
                                                }
                                        } else {
                                                ptrack = p;

                                                points.push(p);
                                        }
                                        ;
                                }).onComplete(function () {

                                        // alert(line.minPointDist);

                                        line.first_segment = points.slice();

                                        var extendLinePoints = function extendLinePoints(segment, points, ix) {

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
                }]);

                return TweenMotion;
        }(Motion);

        Gamestack.TweenMotion = TweenMotion;

        var LineMotion = function (_Motion2) {
                _inherits(LineMotion, _Motion2);

                function LineMotion() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, LineMotion);

                        var _this13 = _possibleConstructorReturn(this, (LineMotion.__proto__ || Object.getPrototypeOf(LineMotion)).call(this, args));

                        Gamestack.Extendors.spatial(_this13);

                        _this13.Size(args.size || new Gamestack.Vector(200, 200));

                        _this13.Pos(args.size || new Gamestack.Vector(200, 200));

                        _this13.Rot(args.size || new Gamestack.Vector(200, 200));

                        return _this13;
                }

                _createClass(LineMotion, [{
                        key: 'Highlight',
                        value: function Highlight(spr, ctx, gameWindow) {
                                this.line.Highlight(spr, ctx, gameWindow);

                                return this;
                        }
                }, {
                        key: 'Eliptical',
                        value: function Eliptical(pos, size) {
                                size = size || this.size;

                                pos = pos || this.position;

                                this.line = new Gamestack.ShapeLine().Eliptical(pos, size, 0).Fill();

                                return this;
                        }
                }, {
                        key: 'Box',
                        value: function Box(pos, size) {
                                size = size || this.size;

                                pos = pos || this.position;

                                this.line = new Gamestack.ShapeLine().Quadrilateral(pos, size, 0).Fill();

                                return this;
                        }
                }, {
                        key: 'QuadraticWave',
                        value: function QuadraticWave(pos, size) {
                                size = size || this.size;

                                pos = pos || this.position;

                                this.line = new Gamestack.WaveLine(pos, size, 'quadratic').Fill();

                                return this;
                        }
                }, {
                        key: 'CubicWave',
                        value: function CubicWave(pos, size) {
                                size = size || this.size;

                                pos = pos || this.position;

                                this.line = new Gamestack.WaveLine(pos, size, 'cubic').Fill();

                                return this;
                        }
                }, {
                        key: 'QuinticWave',
                        value: function QuinticWave(pos, size) {
                                size = size || this.size;

                                pos = pos || this.position;

                                this.line = new Gamestack.WaveLine(pos, size, 'quintic').Fill();

                                return this;
                        }
                }]);

                return LineMotion;
        }(Motion);

        Gamestack.LineMotion = LineMotion;
})();

; /**
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

var Projectile = function () {
        function Projectile() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, Projectile);

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

                if (args.size) {
                        this.size = new Vector(args.size);
                } else if (this.animation && this.animation.frameSize) {
                        this.size = new Vector(this.animation.frameSize);
                } else {
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

        _createClass(Projectile, [{
                key: 'onComplete',
                value: function onComplete(fun) {
                        this.complete = fun;
                }
        }, {
                key: 'onCollide',
                value: function onCollide(fun) {
                        this.collide = fun;
                }
        }, {
                key: 'setAnimation',
                value: function setAnimation(anime) {

                        this.animation = anime;

                        return this;
                }
        }, {
                key: 'setMotionCurve',
                value: function setMotionCurve(c) {

                        this.motion_curve = c;

                        return this;
                }
        }, {
                key: 'kill_one',
                value: function kill_one() {

                        var spr = this.sprites[this.sprites.length - 1];

                        Gamestack.remove(spr);
                }
        }, {
                key: 'onRun',
                value: function onRun(caller, callkey) {

                        this.run_ext = this.run_ext || [];

                        this.run_ext.push({ caller: caller, callkey: callkey });
                }
        }, {
                key: 'shoot_basic',
                value: function shoot_basic(position, size, rot_offset, speed, numberShots, disp) {

                        var __playerInst = this;

                        var bx = position.x,
                            by = position.y,
                            bw = size.x,
                            bh = size.y;

                        var half = numberShots / 2;

                        for (var x = half * -1; x <= half; x++) {
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

                                rot_offset = new Vector(rot_offset + x * disp, 0, 0);

                                shot.position.x = bx, shot.position.y = by;
                                shot.rotation.x = 0 + rot_offset.x;

                                shot.stats = {

                                        damage: 1

                                };

                                if (!options.line) {

                                        shot.onUpdate(function () {

                                                shot.position.x += Math.cos(shot.rotation.x * 3.14 / 180) * speed;

                                                shot.position.y += Math.sin(shot.rotation.x * 3.14 / 180) * speed;
                                        });
                                }
                        }
                }
        }, {
                key: 'fire',
                value: function fire(origin, rotation) {

                        for (var x = 0; x < this.run_ext.length; x++) {

                                this.run_ext[x].caller[this.run_ext[x].callkey]();
                        }

                        this.line.origin = origin;

                        this.line.rotation = rotation;

                        console.log('FIRING FROM:' + jstr(origin));

                        var sprite = new Sprite({ image: this.animation.image });

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
        }]);

        return Projectile;
}();

Gamestack.Projectile = Projectile;

;

var Shapes = {

        circle: function circle(radius, freq) {

                return {

                        radius: radius,

                        points: [],

                        fill: function fill(center, freq) {}

                };
        },

        square: function square(s, freq) {
                console.error('STILL NEED TO BUILD THIS SQUARE IN GS-API');

                return {

                        size: new Gamestack.Vector(s, s),

                        width: w,

                        height: h,

                        freq: freq,

                        points: [],

                        fill: function fill(start, freq) {}
                };
        },

        rect: function rect(w, h, freq) {
                console.error('STILL NEED TO BUILD THIS TRIANGLE');

                return {

                        size: new Gamestack.Vector(w, h),

                        width: w,

                        height: h,

                        freq: freq,

                        points: [],

                        fill: function fill(start, freq) {}
                };
        },

        triangle: function triangle(base, h, freq) {

                console.error('STILL NEED TO BUILD THIS TRIANGLE');

                return {

                        base: base,

                        height: height,

                        freq: freq,

                        points: [],

                        fill: function fill(start, freq) {}
                };
        }
};

Gamestack.Shapes = Shapes;
;

var Shot = function () {
        function Shot(name, imageOrAnimation) {
                _classCallCheck(this, Shot);

                this.name = name || 'No-Name';

                if (imageOrAnimation instanceof Gamestack.GameImage) {
                        this.anime = new Animation(imageOrAnimation);
                } else if (imageOrAnimation instanceof Gamestack.Animation) {
                        this.anime = imageOrAnimation;
                }

                this.rotation = 0;

                this.rot_disp = 0;

                var args = name instanceof Object ? name : {};

                //is name / first arg an entire instance of shot?

                this.init(args);
        }

        _createClass(Shot, [{
                key: 'init',
                value: function init(args) {
                        if (args instanceof Object) {

                                for (var x in args) {

                                        this[x] = args[x];

                                        if (args[x] instanceof Object && args[x].hasOwnProperty('x')) //process as Vector
                                                {
                                                        this[x] = new Vector(args[x]);
                                                }
                                }
                        }

                        Gamestack.ChainSet.informable(this);
                }
        }, {
                key: 'Image',
                value: function Image(image) {

                        this.anime = new Animation(image);
                }
        }, {
                key: 'Animation',
                value: function Animation(anime) {
                        this.anime = anime;
                        return this;
                }
        }, {
                key: 'Total',
                value: function Total(total, rot_disp_per_unit) {

                        this.total = total;

                        this.rot_disp = rot_disp_per_unit;

                        return this;
                }
        }, {
                key: 'WaveGrowth',
                value: function WaveGrowth(growth) {
                        if (growth > 0) this.curve_growth = growth;
                }
        }, {
                key: 'CurveMode',
                value: function CurveMode(key, size, growth) {
                        this.curve = Gamestack.Curves.InOut[key.toLowerCase()];

                        this.curve_key = key.toLowerCase();

                        this.curve_size = size;

                        if (growth > 0) this.curve_growth = growth;

                        if (typeof this.curve_size == 'number') this.curve_size = new Gamestack.Vector(this.curve_size, this.curve_size);

                        return this;
                }
        }, {
                key: 'RotDisp',
                value: function RotDisp(rot_disp) {
                        this.rot_disp = rot_disp;

                        return this;
                }
        }, {
                key: 'Velocity',
                value: function Velocity(v) {
                        this.velocity = v;

                        return this;
                }
        }, {
                key: 'Position',
                value: function Position(p) {
                        if (typeof p == 'number') {
                                this.position = new Gamestack.Vector(p, p, p);
                        } else {

                                this.position = p;
                        }

                        return this;
                }
        }, {
                key: 'Size',
                value: function Size(s) {
                        if (typeof s == 'number') {
                                this.size = new Gamestack.Vector(s, s, s);
                        } else {

                                this.size = s;
                        }

                        return this;
                }
        }, {
                key: 'Rotation',
                value: function Rotation(r) {
                        this.rotation = r;

                        return this;
                }
        }, {
                key: 'onCollide',
                value: function onCollide(collideables, callback) {}
        }]);

        return Shot;
}();

Gamestack.Shot = Shot;;

/**
 * Takes the min and max vectors of rectangular shape and returns Rectangle Object.
 * @param   {Object} args object of arguments
 * @param   {Gamestack.Vector} args.min the minimum vector point (x,y)
 * @param   {Gamestack.Vector} args.max the maximum vector point (x,y)
 *
 * @returns {Rectangle} a Rectangle object
 */

var Rectangle = function () {
        function Rectangle(min, max) {
                _classCallCheck(this, Rectangle);

                this.min = new Gamestack.Vector(min);
                this.max = new Gamestack.Vector(max);
        }

        _createClass(Rectangle, [{
                key: 'toLine',
                value: function toLine() {}
        }]);

        return Rectangle;
}();

;

var VectorBounds = Rectangle;

Gamestack.VectorBounds = VectorBounds;

Gamestack.Rectangle = Rectangle;

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

var VectorFrameBounds = function (_Rectangle) {
        _inherits(VectorFrameBounds, _Rectangle);

        function VectorFrameBounds(min, max, termPoint) {
                _classCallCheck(this, VectorFrameBounds);

                var _this14 = _possibleConstructorReturn(this, (VectorFrameBounds.__proto__ || Object.getPrototypeOf(VectorFrameBounds)).call(this, min, max));

                _this14.termPoint = termPoint || new Gamestack.Vector(_this14.max.x, _this14.max.y, _this14.max.z);

                return _this14;
        }

        return VectorFrameBounds;
}(Rectangle);

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

var Line = function () {
        function Line() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, Line);

                this.curve_options = Curves; //Curves Object (of functions)
                this.curve_string = args.curve_string || "linearNone";

                this.curve = this.get_curve_from_string(this.curve_string);

                this.motion_curve = args.motion_curve || TWEEN.Easing.Linear.None;

                if (typeof args.curve == 'function') {
                        this.curve = args.curve;
                }

                this.points = args.points || [];

                this.position = args.position || new Gamestack.Vector();

                this.is_highlighted = args.is_highlighted || false;

                this.offset = args.offset || new Gamestack.Vector();

                this.pointDist = 5;

                this.size = args.size || new Gamestack.Vector();

                this.rotation = args.rotation || 0;

                this.origin = args.origin || new Gamestack.Vector(0, 0);

                this.iterations = 1;

                this.growth = args.growth || 1.2;
        }

        _createClass(Line, [{
                key: 'Iterations',
                value: function Iterations(n) {

                        this.iterations = n;
                        return this;
                }
        }, {
                key: 'Growth',
                value: function Growth(n) {
                        this.growth = n;

                        return this;
                }
        }, {
                key: 'Origin',
                value: function Origin(o) {
                        this.position = o;
                        this.origin = o;

                        return this;
                }
        }, {
                key: 'Pos',
                value: function Pos(p) {
                        this.origin = p;
                        this.position = p;
                        return this;
                }
        }, {
                key: 'PointDisp',
                value: function PointDisp(num) {
                        this.minPointDist = num;
                        return this;
                }
        }, {
                key: 'Curve',
                value: function Curve(c) {
                        this.curve = c;
                        this.curve_string = this.get_curve_string(c);
                        return this;
                }
        }, {
                key: 'Duration',
                value: function Duration(d) {
                        this.duration = d;

                        return this;
                }
        }, {
                key: 'Rotation',
                value: function Rotation(r) {
                        this.rotation = r;
                        return this;
                }
        }, {
                key: 'next',
                value: function next(position) {

                        var found = false;

                        for (var x = 0; x < this.points.length; x++) {

                                if (position.equals(this.points[x]) && x < this.points.length - 1) {
                                        found = true;
                                        return new Gamestack.Vector(this.points[x + 1]);
                                }

                                if (x == this.points.length - 1 && !found) {

                                        return new Gamestack.Vector(this.points[0]);
                                }
                        }
                }
        }, {
                key: 'get_curve_from_string',
                value: function get_curve_from_string(str) {

                        console.log('Applying Line():curve:' + str);

                        for (var x in this.curve_options) {

                                if (x.toLowerCase() == str.toLowerCase()) {
                                        return this.curve_options[x];
                                }
                        }
                }
        }, {
                key: 'get_curve_string',
                value: function get_curve_string(c) {
                        for (var x in this.curve_options) {

                                if (this.curve_options[x] == c) {
                                        return x;
                                }
                        }
                }
        }, {
                key: 'getGraphCanvas',
                value: function getGraphCanvas(curveCall, existing_canvas) {

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

                        var position = { x: 0, y: 80 };
                        var position_old = { x: 0, y: 80 };

                        this.test_graph_size = new Gamestack.Vector(185, 80 - 20);

                        var points = this.get_line_segment(this.test_graph_size, 5, curveCall);

                        for (var x in points) {
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
        }, {
                key: 'transpose',
                value: function transpose(origin, rotation) {

                        this.rotation = rotation;

                        this.origin = origin;

                        var t_points = [];

                        for (var x = 0; x < this.points.length; x++) {

                                var p = this.points[x];

                                var np = new Gamestack.Vector(Gamestack.GeoMath.rotatePointsXY(p.x, p.y, this.rotation));

                                t_points.push(np.add(origin));

                                console.log(np);
                        }

                        return t_points;
                }
        }, {
                key: 'add_segment',
                value: function add_segment(next_segment, offset) {
                        for (var x = 0; x < next_segment.length; x++) {

                                next_segment[x] = new Gamestack.Vector(next_segment[x]).add(offset);

                                this.points.push(next_segment[x]);
                        }
                }
        }, {
                key: 'get_flipped_segment',
                value: function get_flipped_segment(points) {

                        var t_points = points.slice(),
                            t_len = t_points.length;

                        for (var x = 0; x < points.length; x++) {

                                t_points[t_len - x].x = points[x].x;
                        }

                        return t_points;
                }
        }, {
                key: 'Highlight',
                value: function Highlight(origin, ctx) {

                        ctx = ctx || Gamestack.ctx;

                        var points = this.transpose(origin);

                        for (var x in points) {

                                var point = points[x];

                                var dist = point.sub(Gamestack.point_highlighter.position);

                                var d = Math.sqrt(dist.x * dist.x + dist.y * dist.y);

                                if (d >= 10) {
                                        Gamestack.point_highlighter.position = new Gamestack.Vector(points[x]);
                                }

                                Canvas.draw(Gamestack.point_highlighter, ctx);
                        }

                        return this;
                }
        }]);

        return Line;
}();

var GeoMath = {

        rotatePointsXY: function rotatePointsXY(x, y, angle) {

                var theta = angle * Math.PI / 180;

                var point = {};
                point.x = x * Math.cos(theta) - y * Math.sin(theta);
                point.y = x * Math.sin(theta) + y * Math.cos(theta);

                point.z = 0;

                return point;
        }

};

Gamestack.GeoMath = GeoMath;
;

/**
 * Simple Sound object:: implements Jquery: Audio()
 * @param   {string} src : source path / name of the targeted sound-file

 * @returns {Sound} object of Sound()
 * */

var Sound = function () {
        function Sound(src, data) {
                _classCallCheck(this, Sound);

                if ((typeof src === 'undefined' ? 'undefined' : _typeof(src)) == 'object') {

                        this.sound = document.createElement('audio');

                        this.sound.src = src.src;

                        this.src = src.src;
                } else if (typeof src == 'string') {

                        this.sound = document.createElement('audio');

                        this.sound.src = src;

                        this.src = src;
                }

                if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) == 'object') {
                        for (var x in data) {
                                if (x !== 'sound') {
                                        this[x] = data[x];
                                }
                        }
                }

                this.onLoad = this.onLoad || function () {};

                if (typeof this.onLoad == 'function') {

                        this.onLoad(this.sound);
                }
        }

        _createClass(Sound, [{
                key: 'Loop',
                value: function Loop(loop) {
                        this.sound.loop = loop || true;

                        return this;
                }
        }, {
                key: 'loop',
                value: function loop(_loop) //same as Loop()
                {
                        this.sound.loop = _loop || true;

                        return this;
                }
        }, {
                key: 'Volume',
                value: function Volume(val) {

                        this.sound.volume = val;

                        return this;
                }
        }, {
                key: 'volume',
                value: function volume(val) //same as Volume()
                {

                        this.sound.volume = val;

                        return this;
                }
        }, {
                key: 'Play',
                value: function Play() {
                        if (_typeof(this.sound) == 'object' && typeof this.sound.play == 'function') {

                                this.sound.play();
                        }

                        return this;
                }
        }, {
                key: 'play',
                value: function play() {
                        //same as Play()
                        if (_typeof(this.sound) == 'object' && typeof this.sound.play == 'function') {

                                this.sound.play();
                        }

                        return this;
                }
        }]);

        return Sound;
}();

var SoundList = function () {
        function SoundList(list) {
                _classCallCheck(this, SoundList);

                this.cix = 1;

                this.sounds = [];

                if (list instanceof Array) {
                        for (var x in list) {
                                if (list[x].src) {
                                        this.sounds.push(new Sound(list[x].src, list[x]));
                                } else if (typeof list[x] == 'string') {
                                        this.sounds.push(new Sound(list[x]));
                                }
                        }
                }
        }

        _createClass(SoundList, [{
                key: 'add',
                value: function add(src, name) {
                        if ((typeof src === 'undefined' ? 'undefined' : _typeof(src)) == 'object' && src.src) {
                                this.sounds.push(new Sound(src.src, src));
                        } else if (typeof src == 'string') {
                                var data = {};

                                if (name) {
                                        data.name = name;
                                }

                                this.sounds.push(new Sound(list[x], data));
                        }
                }
        }, {
                key: 'Volume',
                value: function Volume(v) {
                        for (var x = 0; x < this.sounds.length; x++) {
                                this.sounds[x].volume(v);
                        }

                        return this;
                }
        }, {
                key: 'volume',
                value: function volume(v) {
                        for (var x = 0; x < this.sounds.length; x++) {
                                this.sounds[x].volume(v);
                        }

                        return this;
                }
        }, {
                key: 'PlayNext',
                value: function PlayNext() {
                        this.sounds[this.cix % this.sounds.length].play();

                        this.cix += 1;
                }
        }, {
                key: 'Play',
                value: function Play() {

                        this.sounds[this.cix % this.sounds.length].play();

                        this.cix += 1;
                }
        }, {
                key: 'playNext',
                value: function playNext() //same as PlayNext()
                {
                        this.sounds[this.cix % this.sounds.length].play();

                        this.cix += 1;
                }
        }, {
                key: 'play',
                value: function play() //same as Play()
                {

                        this.sounds[this.cix % this.sounds.length].play();

                        this.cix += 1;
                }
        }]);

        return SoundList;
}();

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

        var Sprite = function () {
                function Sprite() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
                        var arg2 = arguments[1];
                        var arg3 = arguments[2];

                        _classCallCheck(this, Sprite);

                        var a = {};

                        if (args instanceof Gamestack.Animation) //instantiate from animation
                                {
                                        args = { selected_animation: args, size: new Gamestack.Vector(args.frameSize) };
                                } else if (typeof args == 'string') //load with image 'src' argument
                                {
                                        //apply image from string 'src'

                                        this.image = new Gamestack.GameImage(args);

                                        var __inst = this;

                                        var img = this.image.domElement;

                                        img.onload = function () {

                                                __inst.singleFrame();

                                                if (__inst.after_load) {
                                                        __inst.after_load();
                                                }
                                        };

                                        if (typeof arg2 == 'number') //image plus 'scale' argument
                                                {
                                                        this.scale = arg2;

                                                        var img = this.image.domElement;

                                                        this.image.domElement.onload = function () {
                                                                __inst.size = new Gamestack.Vector(Math.round(img.width * scale), Math.round(img.width / img.height * scale));
                                                        };
                                                }

                                        if ((typeof arg2 === 'undefined' ? 'undefined' : _typeof(arg2)) == 'object' && arg2.hasOwnProperty('x') && arg2.hasOwnProperty('y')) //image plus 'size' argument
                                                {

                                                        this.size = arg2;
                                                }
                                }

                        if ((typeof arg2 === 'undefined' ? 'undefined' : _typeof(arg2)) == 'object' && arg2.hasOwnProperty('x')) {
                                this.size = arg2;
                        }

                        Gamestack.Extendors.spatial(this);

                        this.active = true; //active sprites are visible

                        if ((typeof args === 'undefined' ? 'undefined' : _typeof(args)) == 'object') {

                                this.apply_args(args);
                        } else {
                                this.apply_args(a);
                        }
                }

                _createClass(Sprite, [{
                        key: 'afterLoad',
                        value: function afterLoad(f) {
                                this.after_load = f;
                        }
                }, {
                        key: 'apply_args',
                        value: function apply_args() {
                                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};


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

                                this.speed = Gamestack.getArg(args, 'speed', new Gamestack.Vector(0, 0, 0));

                                this.size = new Gamestack.Vector(Gamestack.getArg(args, 'size', new Gamestack.Vector(0, 0)));

                                this.position = new Gamestack.Vector(Gamestack.getArg(args, 'position', new Gamestack.Vector(0, 0, 0)));

                                this.collision_bounds = Gamestack.getArg(args, 'collision_bounds', new Gamestack.VectorBounds(new Gamestack.Vector(0, 0, 0), new Gamestack.Vector(0, 0, 0)));

                                this.rotation = new Gamestack.Vector(Gamestack.getArg(args, 'rotation', new Gamestack.Vector(0, 0, 0)));

                                this.acceleration = Gamestack.getArg(args, 'acceleration', new Gamestack.Vector(0, 0, 0));

                                this.rot_speed = Gamestack.getArg(args, 'rot_speed', new Gamestack.Vector(0, 0, 0));

                                this.rot_accel = Gamestack.getArg(args, 'rot_accel', new Gamestack.Vector(0, 0, 0));

                                this.padding = Gamestack.getArg(args, 'padding', new Gamestack.Vector(0, 0, 0));

                                var __inst = this;

                                if (args.src) {
                                        this.src = args.src;
                                        console.log('image src:' + args.src);
                                        this.image = new Gamestack.GameImage(args.src);
                                } else if (args.image instanceof Gamestack.GameImage) {
                                        this.image = args.image;
                                } else if (args.image && args.image.domElement && args.image.domElement.src) {
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

                                if (args.selected_animation) this.selected_animation = new Gamestack.Animation(args.selected_animation);
                        }
                }, {
                        key: 'singleFrame',
                        value: function singleFrame() {
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

                }, {
                        key: 'add',
                        value: function add(obj) {

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

                }, {
                        key: 'init',
                        value: function init() {}

                        /**
                         * This function extends the init() function. Takes single function() argument OR single string argument
                         * @function
                         * @memberof Sprite
                         * @param {function} fun the function to be passed into the init() event of the Sprite()
                         **********/

                }, {
                        key: 'onInit',
                        value: function onInit(fun) {

                                if (typeof fun == 'string') {

                                        if (this.__initializers.indexOf(fun) < 0) {

                                                this.__initializers.push(fun);
                                        }
                                        ;

                                        var __inst = this;

                                        var keys = fun.split('.');

                                        console.log('finding init from string:' + fun);

                                        if (!keys.length >= 2) {
                                                return console.error('need min 2 string keys separated by "."');
                                        }

                                        var f = GameStack.options.SpriteInitializers[keys[0]][keys[1]];

                                        if (typeof f == 'function') {

                                                var __inst = this;

                                                var f_init = this.init;

                                                this.init = function () {

                                                        f_init(__inst);

                                                        f(__inst);
                                                };
                                        }
                                } else if (typeof fun == 'function') {

                                        console.log('extending init:');

                                        var f_init = this.init;
                                        var __inst = this;

                                        this.init = function () {

                                                f_init(__inst);

                                                fun(__inst);
                                        };
                                } else if ((typeof fun === 'undefined' ? 'undefined' : _typeof(fun)) == 'object') {

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

                }, {
                        key: 'get_id',
                        value: function get_id() {
                                return this.id;
                        }
                }, {
                        key: 'to_map_object',
                        value: function to_map_object(size, framesize) {

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

                }, {
                        key: 'create_id',
                        value: function create_id() {

                                return Gamestack.create_id();
                        }

                        /**
                         * This function sets the size of the Sprite()
                         * @function
                         * @memberof Sprite
                         **********/

                }, {
                        key: 'setSize',
                        value: function setSize(size) {

                                this.size = new Gamestack.Vector(size.x, size.y, size.z);
                        }

                        /**
                         * This function sets the position of the Sprite()
                         * @function
                         * @memberof Sprite
                         **********/

                }, {
                        key: 'setPos',
                        value: function setPos(pos) {
                                this.position = new Gamestack.Vector(pos.x, pos.y, pos.z || 0);
                        }

                        /**
                         * This function sizes the Sprite according to minimum dimensions and existing w/h ratios
                         * @param {number} mx the maximum size.x for the resize
                         * @param {number} my the maximum size.y for the resize
                         * @function
                         * @memberof Sprite
                         **********/

                }, {
                        key: 'getSizeByMax',
                        value: function getSizeByMax(mx, my) {

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

                }, {
                        key: 'assertSpeed',
                        value: function assertSpeed() {
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

                }, {
                        key: 'setAnimation',
                        value: function setAnimation(anime) {

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

                }, {
                        key: 'setToSingleFrame',
                        value: function setToSingleFrame() {

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

                }, {
                        key: 'LifeSpan',
                        value: function LifeSpan(value) {
                                this.life = value;
                        }
                }, {
                        key: 'Life',
                        value: function Life(value) //same as LifeSpan
                        {
                                this.life = value;
                        }
                }, {
                        key: 'isDead',
                        value: function isDead(gw) {

                                gw = gw || Gamestack.game_windows[0];

                                return this.hasOwnProperty('life') && this.life <= 0;
                        }
                }, {
                        key: 'die',
                        value: function die(gw) {

                                this.life = 0;

                                return this;
                        }
                }, {
                        key: 'onScreen',
                        value: function onScreen(w, h, gw) {

                                w = w || Gamestack.WIDTH;

                                h = h || Gamestack.HEIGHT;

                                gw = gw || Gamestack.game_windows[0];

                                var camera = gw.camera || Gamestack.camera || { position: new Gamestack.Vector(0, 0, 0) },
                                    scrollFactor = this.noScroll ? 0 : this.scrollFactor;

                                var camPos = new Gamestack.Vector(camera.position).mult(scrollFactor);

                                var p = new Gamestack.Vector(this.position.x - camPos.x, this.position.y - camPos.y, this.position.z - camPos.z);

                                return p.x + this.size.x > -1000 - w && p.x < w + 1000 && p.y + this.size.y > 0 - 1000 - h && p.y < h + 1000;
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

                }, {
                        key: 'update',
                        value: function update(sprite) {}

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

                }, {
                        key: 'def_update',
                        value: function def_update(sprite) {

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

                }, {
                        key: 'resolveFunctionFromDoubleKeys',
                        value: function resolveFunctionFromDoubleKeys(keyString1, keyString2, obj, callback) {

                                callback(typeof obj[keyString1][keyString2] == 'function' ? obj[keyString1][keyString2] : {});
                        }

                        /**
                         * This function extends an existing function, and is applied by Gamestack in onInit();
                         * @function
                         * @memberof Sprite
                         **********/

                }, {
                        key: 'extendFunc',
                        value: function extendFunc(fun, extendedFunc) {

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

                }, {
                        key: 'onUpdate',
                        value: function onUpdate(fun) {
                                fun = fun || function () {};

                                var update = this.update;

                                var __inst = this;

                                this.update = function (__inst) {
                                        update(__inst);
                                        fun(__inst);
                                };
                        }

                        /*****************************
                         *  travelLineTwoWay()
                         *  -sprite travels line: any Line() or object with property of line
                         ***************************/

                }, {
                        key: 'travelLineTwoWay',
                        value: function travelLineTwoWay(lineObject, speed, curveKey, offset) {

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

                                if (__inst.__crtLineIx >= (line.points.length - 1) / 2) {
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

                }, {
                        key: 'travelLineOnLoop',
                        value: function travelLineOnLoop(lineObject, speed, curveKey, offset) {

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

                                if (__inst.__crtLineIx >= (line.points.length - 1) / 2) {
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

                }, {
                        key: 'collidesRectangular',
                        value: function collidesRectangular(sprite) {

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

                }, {
                        key: 'shoot',
                        value: function shoot(options, gw) {
                                //character shoots an animation

                                gw = gw || Gamestack.game_windows[0];

                                this.prep_key = 'shoot';

                                var animation = options.bullet || options.animation || options.anime || new Gamestack.Animation();

                                var speed = options.speed || options.velocity || 1;

                                var size = options.size || new Gamestack.Vector(10, 10, 0);

                                var position = new Gamestack.Vector(options.position) || new Gamestack.Vector(this.position);

                                var rot_offset = options.rot_offset || options.rotation || 0;

                                var total = options.total || 1;

                                var rot_disp = options.rot_disp || 0; //the full rotational-dispersion of the bullets

                                var curve = options.curve,
                                    curve_size = options.curve_size,
                                    curve_growth = options.curve_growth || 1.0;

                                var curve_key = options.curve_key || 'quintic';

                                var life = options.life || 900;

                                var shots = [];

                                for (var x = 0; x < total; x++) {

                                        var __playerInst = this;

                                        if (__gameInstance.isAtPlay) {

                                                var bx = position.x,
                                                    by = position.y,
                                                    bw = size.x,
                                                    bh = size.y;

                                                var shot = new Gamestack.Sprite({

                                                        active: true,

                                                        position: new Gamestack.Vector(position),

                                                        size: new Gamestack.Vector(size),

                                                        speed: speed,

                                                        image: animation.image,

                                                        rotation: new Gamestack.Vector(0, 0, 0),

                                                        flipX: false,

                                                        life: options.life

                                                });

                                                shot.noScroll = true;

                                                shot.setAnimation(animation);

                                                rot_offset = new Gamestack.Vector(rot_offset, 0, 0);

                                                shot.position.x = bx, shot.position.y = by;

                                                //Danger On this line: annoying math --dispersing rotation of bullets by rot_disp

                                                var div = rot_disp / total;

                                                var rotPlus = div * x + div / 2 - rot_disp / 2;

                                                shot.rotation.x = rot_offset.x + rotPlus;

                                                shot.origin = new Gamestack.Vector(position);

                                                shot.speed = new Gamestack.Vector(Math.cos(shot.rotation.x * 3.14 / 180) * speed, Math.sin(shot.rotation.x * 3.14 / 180) * speed);

                                                shots.push(shot);

                                                if (!curve) {

                                                        shot.onUpdate(function (spr) {
                                                                // console.log('update:rotation:' + shot.rotation.x);


                                                        });
                                                } else {

                                                        shot.ticker = 0;

                                                        var r = shot.rotation.x + 0;

                                                        shot.line = new Gamestack.CurvedLine().Pos(position).Curve(curve_key).SegmentSize(curve_size).MaxSize(2000).Growth(1.5).Rotate(r).Fill();

                                                        shot.onUpdate(function (spr) {

                                                                spr.ticker += 1;

                                                                if (spr.ticker < spr.line.points.length) spr.position = new Gamestack.Vector(spr.line.points[spr.ticker]);
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

                }, {
                        key: 'subsprite',
                        value: function subsprite(options, gw) {

                                gw = gw || Gamestack.game_windows[0];

                                var animation = options.animation || new Gamestack.Animation();

                                var position = options.position || new Gamestack.Vector(this.position);

                                var offset = options.offset || new Gamestack.Vector(0, 0, 0);

                                var size = new Gamestack.Vector(options.size || this.size);

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
                                } else {
                                        alert('No subsprite when not at play');
                                }
                        }

                        /**
                         * animate Sprite.selected_animation  by one frame
                         * @function
                         * @memberof Sprite
                         * @param {Animation} animation to use, defaults to Sprite.selected_animation
                         **********/

                }, {
                        key: 'animate',
                        value: function animate(animation) {

                                if (__gameInstance.isAtPlay) {

                                        if (animation) {
                                                this.setAnimation(animation);
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

                }, {
                        key: 'onAnimationComplete',
                        value: function onAnimationComplete(fun) {
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

                }, {
                        key: 'accelY',
                        value: function accelY(accel, max) {

                                accel = Math.abs(accel);

                                if (typeof max == 'number') {
                                        max = { y: max };
                                }

                                this.assertSpeed();

                                var diff = max.y - this.speed.y;

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

                }, {
                        key: 'accelX',
                        value: function accelX(accel, max) {

                                accel = Math.abs(accel);

                                if (typeof max == 'number') {
                                        max = { x: max };
                                }

                                this.assertSpeed();

                                var diff = max.x - this.speed.x;

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

                }, {
                        key: 'accel',
                        value: function accel(prop, key, _accel, max) {

                                _accel = Math.abs(_accel);

                                if (typeof max == 'number') {
                                        max = { x: max };
                                }

                                var speed = prop[key];

                                // this.assertSpeed();

                                var diff = max.x - prop[key];

                                if (diff > 0) {
                                        prop[key] += Math.abs(diff) >= _accel ? _accel : diff;
                                }
                                ;

                                if (diff < 0) {
                                        prop[key] -= Math.abs(diff) >= _accel ? _accel : diff;
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

                }, {
                        key: 'decel',
                        value: function decel(prop, key, rate) {
                                if ((typeof rate === 'undefined' ? 'undefined' : _typeof(rate)) == 'object') {

                                        rate = rate.rate;
                                }

                                rate = Math.abs(rate);

                                if (Math.abs(prop[key]) <= rate) {
                                        prop[key] = 0;
                                } else if (prop[key] > 0) {
                                        prop[key] -= rate;
                                } else if (prop[key] < 0) {
                                        prop[key] += rate;
                                } else {

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

                }, {
                        key: 'decelY',
                        value: function decelY(amt) {

                                amt = Math.abs(amt);

                                if (Math.abs(this.speed.y) <= amt) {
                                        this.speed.y = 0;
                                } else if (this.speed.y > amt) {

                                        this.speed.y -= amt;
                                } else if (this.speed.y < amt * -1) {

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

                }, {
                        key: 'decelX',
                        value: function decelX(amt) {

                                amt = Math.abs(amt);

                                if (this.speed.x > amt) {

                                        this.speed.x -= amt;
                                } else if (this.speed.x < amt * -1) {

                                        this.speed.x += amt;
                                }

                                if (Math.abs(this.speed.x) <= amt) {

                                        this.speed.x = 0;
                                }
                        }
                }, {
                        key: 'shortest_stop',
                        value: function shortest_stop(item, callback) {
                                var diff_min_y = item.min ? item.min.y : Math.abs(item.position.y - this.position.y + this.size.y);

                                var diff_min_x = item.min ? item.min.x : Math.abs(item.position.x - this.position.x + this.size.x);

                                var diff_max_y = item.max ? item.max.y : Math.abs(item.position.y + item.size.y - this.position.y);

                                var diff_max_x = item.max ? item.max.x : Math.abs(item.position.x + item.size.x - this.position.y);

                                var dimens = { top: diff_min_y, left: diff_min_x, bottom: diff_max_y, right: diff_max_x };

                                var minkey = "",
                                    min = 10000000;

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

                }, {
                        key: 'center',
                        value: function center() {

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

                }, {
                        key: 'overlap_x',
                        value: function overlap_x(item, padding) {
                                if (!padding) {
                                        padding = 0;
                                }

                                var paddingX = Math.round(padding * this.size.x),
                                    paddingY = Math.round(padding * this.size.y),
                                    left = this.position.x + paddingX,
                                    right = this.position.x + this.size.x - paddingX,
                                    top = this.position.y + paddingY,
                                    bottom = this.position.y + this.size.y - paddingY;

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

                }, {
                        key: 'overlap_y',
                        value: function overlap_y(item, padding) {
                                if (!padding) {
                                        padding = 0;
                                }

                                var paddingX = Math.round(padding * this.size.x),
                                    paddingY = Math.round(padding * this.size.y),
                                    left = this.position.x + paddingX,
                                    right = this.position.x + this.size.x - paddingX,
                                    top = this.position.y + paddingY,
                                    bottom = this.position.y + this.size.y - paddingY;

                                return bottom > item.position.y && top < item.position.y + item.size.y;
                        }

                        /*************
                         * #BE CAREFUL
                         * -with this function :: change sensitive / tricky / 4 way collision
                         * *************/

                }, {
                        key: 'collide_stop_x',
                        value: function collide_stop_x(item) {

                                var apart = false;

                                var ct = 10000;

                                while (!apart && ct > 0) {

                                        ct--;

                                        var diffX = this.center().sub(item.center()).x;

                                        var distX = Math.abs(this.size.x / 2 + item.size.x / 2 - Math.round(this.size.x * this.padding.x));

                                        if (Math.abs(diffX) < distX) {

                                                this.position.x -= diffX > 0 ? -1 : 1;
                                        } else {

                                                this.speed.x = 0;

                                                apart = true;
                                        }
                                }
                        }
                }, {
                        key: 'Life',
                        value: function Life(v) {
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

                }, {
                        key: 'collide_stop',
                        value: function collide_stop(item) {

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
                                                        } else {

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
                }, {
                        key: 'collide_stop_top',
                        value: function collide_stop_top(item) {

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

                }, {
                        key: 'restoreFrom',
                        value: function restoreFrom(data) {
                                data.image = new GameImage(data.src || data.image.src);

                                return new Gamestack.Sprite(data);
                        }

                        /*****************************
                         *  fromFile(file_path)
                         *  -TODO : complete this function based on code to load Sprite() from file, located in the spritemaker.html file
                         *  -TODO: test this function
                         ***************************/

                }, {
                        key: 'fromFile',
                        value: function fromFile(file_path) {

                                if (typeof file_path == 'string') {

                                        var __inst = this;

                                        $.getJSON(file_path, function (data) {

                                                __inst = new Gamestack.Sprite(data);
                                        });
                                }
                        }
                }, {
                        key: 'toJSONString',
                        value: function toJSONString() {
                                for (var x = 0; x < this.motions.length; x++) {
                                        this.motions[x].parent = false;
                                }

                                return jstr(this);
                        }
                }]);

                return Sprite;
        }();

        ;

        /****************
         * TODO : Complete SpritePresetsOptions::
         *  Use these as options for Sprite Control, etc...
         ****************/

        Gamestack.Sprite = Sprite;

        var SpriteInitializersOptions = {

                Clastics: {

                        top_collideable: function top_collideable(sprite) {

                                for (var x in Gamestack.__gameWindow.forces) {
                                        var force = Gamestack.__gameWindow.forces[x];

                                        force.topClastics.push(sprite);
                                }

                                sprite.onUpdate(function () {});
                        },

                        fourside_collideable: function fourside_collideable(sprite) {

                                for (var x in Gamestack.__gameWindow.forces) {
                                        var force = Gamestack.__gameWindow.forces[x];

                                        force.clasticObjects.push(sprite);
                                }

                                sprite.onUpdate(function () {});
                        }
                },

                MainGravity: {

                        very_light: function very_light(sprite, gw) {

                                gw = gw || Gamestack.game_windows[0];
                                //Add a gravity to the game

                                var gravity = gw.add(new Gamestack.Force({
                                        name: "very_light_grav",
                                        accel: 0.05,
                                        max: new Gamestack.Vector(0, 3.5, 0),
                                        subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                                        clasticObjects: [] //an empty array of collideable objects

                                }));

                                sprite.onUpdate(function () {});
                        },

                        light: function light(sprite, gw) {

                                gw = gw || Gamestack.game_windows[0];

                                var gravity = gw.add(new Gamestack.Force({
                                        name: "light_grav",
                                        accel: 0.1,
                                        max: new Gamestack.Vector(0, 4.5, 0),
                                        subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                                        clasticObjects: [] //an empty array of collideable objects

                                }));

                                sprite.onUpdate(function () {});
                        },

                        medium: function medium(sprite, gw) {

                                gw = gw || Gamestack.game_windows[0];

                                var gravity = gw.add(new Gamestack.Force({
                                        name: "medium_grav",
                                        accel: 0.2,
                                        max: new Gamestack.Vector(0, 7.5, 0),
                                        subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                                        clasticObjects: [] //an empty array of collideable objects

                                }));

                                sprite.onUpdate(function () {});
                        },

                        strong: function strong(sprite, gw) {

                                gw = gw || Gamestack.game_windows[0];

                                var gravity = gw.add(new Gamestack.Force({
                                        name: "strong_grav",
                                        accel: 0.4,
                                        max: new Gamestack.Vector(0, 10.5, 0),
                                        subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                                        clasticObjects: [] //an empty array of collideable objects

                                }));

                                sprite.onUpdate(function () {});
                        },

                        very_strong: function very_strong(sprite, gw) {

                                gw = gw || Gamestack.game_windows[0];

                                var gravity = gw.add(new Gamestack.Force({
                                        name: "strong_grav",
                                        accel: 0.5,
                                        max: new Gamestack.Vector(0, 12.5, 0),
                                        subjects: [sprite], //sprite is the subject of this Force, sprite is pulled by this force
                                        clasticObjects: [] //an empty array of collideable objects

                                }));

                                sprite.onUpdate(function () {});
                        }

                },

                ControllerStickMotion: {

                        player_move_x: function player_move_x(sprite) {

                                alert('applying initializer');

                                console.log('side_scroll_player_run:init-ing');

                                var __lib = Gamestack || Quick2d;

                                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                                        console.log('stick-x:' + x);

                                        if (Math.abs(x) < 0.2) {
                                                return 0;
                                        }

                                        var accel = 0.2; //todo : options for accel
                                        var max = 7;

                                        sprite.accelX(accel, x * max);

                                        if (x < -0.2) {
                                                sprite.flipX = true;
                                        } else if (x > 0.2) {
                                                sprite.flipX = false;
                                        }
                                });

                                sprite.onUpdate(function (spr) {

                                        spr.decelX(0.1);

                                        if (!spr.__falling) {
                                                spr.decelY(0.2);
                                        }
                                        ;
                                });
                        },

                        player_move_xy: function player_move_xy(sprite) {

                                alert('applying initializer');

                                console.log('side_scroll_player_run:init-ing');

                                var __lib = Gamestack || Quick2d;

                                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                                        console.log('stick-x:' + x);

                                        if (Math.abs(x) < 0.2) {
                                                x = 0;
                                        }

                                        if (Math.abs(y) < 0.2) {
                                                y = 0;
                                        }

                                        var accel = 0.2; //todo : options for accel
                                        var max = 7;

                                        sprite.accelX(accel, x * max);

                                        sprite.accelY(accel, y * max);

                                        if (x < -0.2) {
                                                sprite.flipX = true;
                                        } else if (x > 0.2) {
                                                sprite.flipX = false;
                                        }
                                });

                                sprite.onUpdate(function (spr) {

                                        sprite.decel(sprite.speed, 'x', 0.1);

                                        sprite.decel(sprite.speed, 'y', 0.1);
                                });
                        },

                        player_rotate_x: function player_rotate_x(sprite) {

                                var __lib = Gamestack || Quick2d;

                                Gamestack.GamepadAdapter.on('stick_left', 0, function (x, y) {

                                        console.log('stick-x:' + x);

                                        if (Math.abs(x) < 0.2) {
                                                return 0;
                                        }

                                        var accel = 0.25; //todo : options for accel
                                        var max = 7;

                                        sprite.accel(sprite.rot_speed, 'x', accel, x * max);

                                        if (x < -0.2) {
                                                sprite.flipX = true;
                                        } else if (x > 0.2) {
                                                sprite.flipX = false;
                                        }
                                });

                                sprite.onUpdate(function (spr) {

                                        sprite.decel(sprite.rot_speed, 'x', 0.1);

                                        if (!spr.__falling) {
                                                spr.decelY(0.2);
                                        }
                                        ;
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

        var Vector = function () {
                function Vector(x, y, z, r) {
                        _classCallCheck(this, Vector);

                        if ((typeof x === 'undefined' ? 'undefined' : _typeof(x)) == 'object' && x.hasOwnProperty('x') && x.hasOwnProperty('y')) //optionally pass vector3
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

                _createClass(Vector, [{
                        key: 'valid_check',
                        value: function valid_check() {
                                if (this.x == undefined || this.y == undefined || this.z == undefined) {
                                        this.x = 0;
                                        this.y = 0;
                                        this.z = 0;
                                }
                        }
                }, {
                        key: 'sub',
                        value: function sub(v) {
                                if (typeof v == 'number') {
                                        v = { x: v, y: v, z: v };
                                }
                                ;

                                return new Gamestack.Vector(this.x - v.x, this.y - v.y, this.z - v.z);
                        }
                }, {
                        key: 'add',
                        value: function add(v) {
                                if (typeof v == 'number') {
                                        v = { x: v, y: v, z: v };
                                }
                                ;

                                return new Gamestack.Vector(this.x + v.x, this.y + v.y, this.z + v.z);
                        }
                }, {
                        key: 'mult',
                        value: function mult(v) {
                                if (typeof v == 'number') {
                                        v = { x: v, y: v, z: v };
                                }
                                ;

                                return new Gamestack.Vector(this.x * v.x, this.y * v.y, this.z * v.z);
                        }
                }, {
                        key: 'div',
                        value: function div(v) {
                                if (typeof v == 'number') {
                                        v = { x: v, y: v, z: v };
                                }
                                ;

                                return new Gamestack.Vector(this.x / v.x, this.y / v.y, this.z / v.z);
                        }
                }, {
                        key: 'round',
                        value: function round() {
                                return new Gamestack.Vector(Math.round(this.x), Math.round(this.y), Math.round(this.z));
                        }
                }, {
                        key: 'floor',
                        value: function floor() {
                                return new Gamestack.Vector(Math.floor(this.x), Math.floor(this.y), Math.floor(this.z));
                        }
                }, {
                        key: 'ceil',
                        value: function ceil() {
                                return new Gamestack.Vector(Math.ceil(this.x), Math.ceil(this.y), Math.ceil(this.z));
                        }
                }, {
                        key: 'equals',
                        value: function equals(v) {

                                return this.x == v.x && this.y == v.y && this.z == v.z;
                        }
                }, {
                        key: 'trig_distance_xy',
                        value: function trig_distance_xy(v) {

                                var dist = this.sub(v);

                                return Math.sqrt(dist.x * dist.x + dist.y * dist.y);
                        }
                }, {
                        key: 'diff',
                        value: function diff() {
                                //TODO:this function


                        }
                }, {
                        key: 'abs_diff',
                        value: function abs_diff() {
                                //TODO:this function

                        }
                }, {
                        key: 'is_between',
                        value: function is_between(v1, v2) {
                                //TODO : overlap vectors return boolean

                                return this.x >= v1.x && this.x <= v2.x && this.y >= v1.y && this.y <= v2.y && this.z >= v1.z && this.z <= v2.z;
                        }
                }]);

                return Vector;
        }();

        ;

        var Vector3 = Vector,
            Pos = Vector,
            Size = Vector,
            Position = Vector,
            Vector2 = Vector,
            Rotation = Vector;

        Gamestack.Vector = Vector;

        Gamestack.Rotation = Vector;

        Gamestack.Pos = Vector;

        Gamestack.Position = Vector;

        Gamestack.Size = Vector;

        //The above are a list of synonymous expressions for Vector. All of these do the same thing in this library (store x,y,z values)


        //SuperVector() : handles all advanced Vector mathematics for any class requiring Vector math

        var VectorMath = {
                rotatePointsXY: function rotatePointsXY(x, y, angle) {

                        var theta = angle * Math.PI / 180;

                        var point = {};
                        point.x = x * Math.cos(theta) - y * Math.sin(theta);
                        point.y = x * Math.sin(theta) + y * Math.cos(theta);

                        point.z = 0;

                        return point;
                }
        };

        Gamestack.VectorMath = VectorMath;
})();;
var Background = function (_Gamestack$Sprite) {
        _inherits(Background, _Gamestack$Sprite);

        function Background() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, Background);

                var _this15 = _possibleConstructorReturn(this, (Background.__proto__ || Object.getPrototypeOf(Background)).call(this, args));

                _this15.type = args.type || "parallax" || "basic" || false;

                _this15.source_objects = args.objects || args.source_objects || [];

                _this15.members = [];

                _this15.rows = args.rows || 1; //The Y number of repititions

                _this15.cols = args.cols || 1; //The X number of repetitions of the images

                _this15.flip = args.flip || false;

                _this15.fill = args.fill || false;

                _this15.noScroll = args.noScroll || false;

                _this15.scrollFactor = args.scrollFactor || 1.0;

                if (_this15.noScroll) {
                        _this15.scrollFactor = 0;
                };

                _this15.flip = args.flip || false;

                var __inst = _this15;

                return _this15;
        }

        _createClass(Background, [{
                key: 'Flip',
                value: function Flip(value) {
                        if (value == undefined) {
                                this.flip = true;
                        } else if (value == true || value == false) {
                                this.flip = value;
                        }

                        return this;
                }
        }, {
                key: 'Rows',
                value: function Rows(r) {
                        this.rows = r;
                        return this;
                }
        }, {
                key: 'Cols',
                value: function Cols(c) {
                        this.cols = c;
                        return this;
                }
        }, {
                key: 'ScrollFactor',
                value: function ScrollFactor(sf) {
                        this.scrollFactor = sf;
                        return this;
                }
        }, {
                key: 'Fill',
                value: function Fill(approxRows, approxCols, gw) {

                        approxRows = approxRows || this.rows || 1;

                        approxCols = approxCols || this.cols || 1;

                        this.members.push(new Background(this)); //"This" or base image is always applied

                        for (var x = 0; x < this.source_objects.length; x++) {
                                this.members.push(new Background(this.source_objects[x])); //src strings OR Sprites()
                        }

                        gw = gw || Gamestack.game_windows[0];

                        var w = gw.canvas.width,
                            h = gw.canvas.height,
                            xBacksTotal = Math.floor(approxRows / 2),
                            yBacksTotal = Math.floor(approxCols / 2);

                        var __inst = this;

                        //create first row:

                        for (var y = -yBacksTotal; y <= yBacksTotal + 1; y++) {
                                console.log('adding background:' + y);

                                for (var x = -xBacksTotal; x <= xBacksTotal + 1; x++) {

                                        this.members.push(new Background(this));

                                        var b = this.members[this.members.length - 1];

                                        b.setSize(this.size);

                                        var __inst = this;

                                        b.position.x = x * this.size.x;

                                        b.position.y = y * this.size.y;

                                        b.minX = -xBacksTotal * b.size.x + b.size.x;

                                        b.maxX = (xBacksTotal + 1) * b.size.x;

                                        b.minY = -yBacksTotal * b.size.y + b.size.y;

                                        b.maxY = yBacksTotal * b.size.y;

                                        if (x % 2 == 0) {
                                                b.flipX = true;
                                        }

                                        if (y % 2 == 0) {
                                                b.flipY = true;
                                        }

                                        b.onUpdate(function (spr) {

                                                spr.campos = gw.camera.position;

                                                var cx = spr.campos.x - spr.campos.x % spr.size.x,
                                                    cy = spr.campos.y - spr.campos.y % spr.size.y;

                                                if (spr.position.x - cx < spr.minX) {

                                                        spr.position.x = spr.maxX + cx;
                                                }

                                                if (spr.position.x - cx > spr.maxX) {

                                                        spr.position.x = spr.minX + cx;
                                                }

                                                if (spr.position.y - cy < spr.minY) {

                                                        spr.position.y = spr.maxY + cy;
                                                }

                                                if (spr.position.y - cy > spr.maxY) {

                                                        spr.position.y = spr.minY + cy;
                                                }
                                        });

                                        gw.add(b); //add to window
                                }
                        }

                        return this;
                }
        }, {
                key: 'add',
                value: function add(object) {
                        var cleanCheck = object instanceof Gamestack.Sprite || object instanceof Array && object[0] instanceof Gamestack.Sprite; //is Sprite

                        if (!cleanCheck) {
                                return console.error('Must have: valid contents (Gamestack.Sprite OR [] of Gamestack.Sprite())');
                        }

                        if (object instanceof Array) {
                                this.source_objects.cancat(object);
                        } else {
                                this.source_objects.push(object);
                        }

                        return this;
                }
        }]);

        return Background;
}(Gamestack.Sprite);

Gamestack.Background = Background;;

(function () {
        console.log('Interactive class... creating');

        var Interactive = function (_Gamestack$Sprite2) {
                _inherits(Interactive, _Gamestack$Sprite2);

                function Interactive() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, Interactive);

                        //init as Gamestack.Sprite()

                        var _this16 = _possibleConstructorReturn(this, (Interactive.__proto__ || Object.getPrototypeOf(Interactive)).call(this, args));

                        _this16.collision_settings = new Gamestack.CollisionSettings(args);

                        _this16.collideables = args.collideables || [];

                        Gamestack.Extendors.collideable(_this16, args); //overwrites the onCollide():

                        return _this16;
                }

                _createClass(Interactive, [{
                        key: 'Collideables',
                        value: function Collideables(c) {
                                this.collideables = c || [];

                                if (!this.collideables instanceof Array) {
                                        return console.error('Must pass array for "c" argument');
                                }

                                return this;
                        }
                }, {
                        key: 'onCollide',
                        value: function onCollide() // Gamestack.Interactive instance should have an onCollide() function
                        {}
                }]);

                return Interactive;
        }(Gamestack.Sprite);

        Gamestack.Interactive = Interactive;
})();;

(function () {
        console.log('Terrain class... creating');

        var Terrain = function (_Gamestack$Sprite3) {
                _inherits(Terrain, _Gamestack$Sprite3);

                function Terrain() {
                        var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                        _classCallCheck(this, Terrain);

                        //init as Gamestack.Sprite()

                        var _this17 = _possibleConstructorReturn(this, (Terrain.__proto__ || Object.getPrototypeOf(Terrain)).call(this, args));

                        _this17.collision_settings = new Gamestack.CollisionSettings(args);

                        _this17.collideables = args.collideables || args.colliders || [];

                        Gamestack.Extendors.collideable(_this17, args); //overwrites the onCollide():


                        return _this17;
                }

                _createClass(Terrain, [{
                        key: 'Collideables',
                        value: function Collideables(c) {
                                this.collideables = c || [];

                                if (!this.collideables instanceof Array) {
                                        return console.error('Must pass array for "c" argument');
                                }

                                return this;
                        }
                }, {
                        key: 'onCollide',
                        value: function onCollide() // Gamestack.Terrain instance should have an onCollide() function
                        {}
                }]);

                return Terrain;
        }(Gamestack.Sprite);

        Gamestack.Terrain = Terrain;
})();
;
var THREE_EXT = {

        defaults: {

                DodecahedronGeometry: { radius: 1, detail: 0 },

                SphereGeometry: { radius: 5, widthSegments: 32, heightSegments: 32 },

                BoxGeometry: {

                        width: 20,

                        height: 20,

                        depth: 20

                },

                CylinderGeometry: { radiusTop: 5, radiusBottom: 5, height: 20, heightSegments: 32 },

                TorusGeometry: { radius: 10, tube: 3, radialSegments: 16, tubularSegments: 100 }
        }

};

var Three = function (_Gamestack$Sprite4) {
        _inherits(Three, _Gamestack$Sprite4);

        function Three() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                _classCallCheck(this, Three);

                //init as Sprite()

                var _this18 = _possibleConstructorReturn(this, (Three.__proto__ || Object.getPrototypeOf(Three)).call(this, args));

                if (!THREE) //THREE.js library must be loaded
                        {
                                var _ret;

                                return _ret = console.error('ThreeJSObject():Library: Three.js is required for this object.'), _possibleConstructorReturn(_this18, _ret);
                        }

                _this18.scene = new THREE.Scene();

                if (args.geometry instanceof String && THREE[args.geometry]) {
                        _this18.geometry = new THREE[args.geometry]();
                } else {

                        _this18.geometry = args.geometry || new THREE.TorusGeometry(50, 10, 16, 100);
                }

                _this18.scene.add(new THREE.AmbientLight(0xffffff, 1.0));

                _this18.renderer = Gamestack.renderer || new THREE.WebGLRenderer({
                        preserveDrawingBuffer: true,
                        alpha: true
                });

                _this18.renderer.setSize(1000, 1000);

                _this18.camera = new THREE.PerspectiveCamera(70, 1, 1, 1000);

                _this18.camera.position.z = 1000 / 8;

                var __inst = _this18;

                var src = args.src || "../assets/game/image/tiles/perlin_3.png";

                __inst.loader = new THREE.TextureLoader();

                __inst.loader.load(src, function (texture) {

                        __inst.material = args.material || new THREE.MeshPhongMaterial({
                                map: texture
                        });

                        if (!__inst.__init) {

                                __inst.mesh = new THREE.Mesh(__inst.geometry, __inst.material);

                                __inst.scene.add(__inst.mesh);

                                __inst.__init = true;
                        }

                        //__inst.mesh.size.set(__inst.size);

                        __inst.renderer.render(__inst.scene, __inst.camera);

                        __ServerSideFile.file_upload('test.png', __inst.renderer.domElement.toDataURL('image/png'), function (relpath, content) {

                                relpath = relpath.replace('client/', '../');

                                __inst.selected_animation = new Animation({ src: relpath, frameSize: new Vector(1000, 1000), frameBounds: new VectorFrameBounds(new Vector(0, 0, 0), new Vector(0, 0, 0), new Vector(0, 0, 0)) }).singleFrame();

                                __inst.selected_animation.image.domElement.onload = function () {

                                        __inst.setSize(new Vector(__inst.selected_animation.image.domElement.width, __inst.selected_animation.image.domElement.height));

                                        __inst.selected_animation.animate();

                                        console.log(jstr(__inst.selected_animation.frames));
                                };
                        });
                });

                return _this18;
        }

        _createClass(Three, [{
                key: 'three_update',
                value: function three_update() {
                        console.log('THREE --GS-Object UPDATE');

                        this.mesh.rotation.y += 0.05;

                        this.renderer.clear();

                        this.renderer.setSize(this.size.x, this.size.y);

                        var pixels = new Uint8Array(this.size.x * this.size.y * 4);

                        this.renderer.render(this.scene, this.camera);

                        var gl = this.renderer.getContext();

                        gl.readPixels(0, 0, this.size.x, this.size.y, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

                        this.selected_animation.selected_frame = { image: {} };

                        this.selected_animation.selected_frame.image.data = new ImageData(new Uint8ClampedArray(pixels), this.size.x, this.size.y);
                }
        }, {
                key: 'applyAnimativeState',
                value: function applyAnimativeState() {}
        }]);

        return Three;
}(Gamestack.Sprite //dependency: THREE.js
);

;if (typeof JSON.decycle !== 'function') {
        JSON.decycle = function decycle(object) {
                "use strict";

                var objects = [],
                    // Keep a reference to each unique object or array
                paths = []; // Keep the path to each unique object or array

                return function derez(value, path) {

                        var i, // The loop counter
                        name, // Property name
                        nu; // The new object or array

                        switch (typeof value === 'undefined' ? 'undefined' : _typeof(value)) {
                                case 'object':

                                        if (!value) {
                                                return null;
                                        }

                                        for (i = 0; i < objects.length; i += 1) {
                                                if (objects[i] === value) {
                                                        return { $ref: paths[i] };
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
                                                                nu[name] = derez(value[name], path + '[' + JSON.stringify(name) + ']');
                                                        }
                                                }
                                        }
                                        return nu;
                                case 'number':
                                case 'string':
                                case 'boolean':
                                        return value;
                        }
                }(object, '$');
        };
}

if (typeof JSON.retrocycle !== 'function') {
        JSON.retrocycle = function retrocycle($) {
                "use strict";

                var px = /^\$(?:\[(?:\d?|\"(?:[^\\\"\u0000-\u001f]|\\([\\\"\/bfnrt]|u[0-9a-zA-Z]{4}))*\")\])*$/;

                (function rez(value) {

                        var i, item, name, path;

                        if (value && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object') {
                                if (Object.prototype.toString.apply(value) === '[object Array]') {
                                        for (i = 0; i < value.length; i += 1) {
                                                item = value[i];
                                                if (item && (typeof item === 'undefined' ? 'undefined' : _typeof(item)) === 'object') {
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
                                                if (_typeof(value[name]) === 'object') {
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
                })($);
                return $;
        };
}

; /*!
  * Proton v2.2.1
  * https://github.com/a-jie/Proton
  *
  * Copyright 2011-2017, A-JIE
  * Licensed under the MIT license
  * http://www.opensource.org/licenses/mit-license
  *
  */
(function (root, factory) {
        if ((typeof window === 'undefined' ? 'undefined' : _typeof(window)) === 'object') {

                window.Proton = factory();
        }
})(undefined, function () {

        //the max particle number in pool
        Proton.POOL_MAX = 1000;
        Proton.TIME_STEP = 60;
        Proton.USE_CLOCK = false;

        //1:100
        Proton.MEASURE = 100;
        Proton.EULER = 'euler';
        Proton.RK2 = 'runge-kutta2';
        Proton.VERLET = 'verlet';

        Proton.PARTICLE_CREATED = 'partilcleCreated';
        Proton.PARTICLE_UPDATE = 'partilcleUpdate';
        Proton.PARTICLE_SLEEP = 'particleSleep';
        Proton.PARTICLE_DEAD = 'partilcleDead';
        Proton.PROTON_UPDATE = 'protonUpdate';
        Proton.PROTON_UPDATE_AFTER = 'protonUpdateAfter';
        Proton.EMITTER_ADDED = 'emitterAdded';
        Proton.EMITTER_REMOVED = 'emitterRemoved';

        Proton.amendChangeTabsBug = true;
        Proton.TextureBuffer = {};
        Proton.TextureCanvasBuffer = {};

        /**
         * The constructor to add emitters
         *
         * @constructor Proton
         *
         * @todo proParticleCount is not in use
         * @todo add more documentation of the single properties and parameters
         *
         * @param {Number} [proParticleCount] not in use?
         * @param {Number} [integrationType=Proton.EULER]
         *
         * @property {String} [integrationType=Proton.EULER]
         * @property {Array} emitters   All added emitter
         * @property {Array} renderers  All added renderer
         * @property {Number} time      The active time
         * @property {Number} oldtime   The old time
         */
        function Proton(proParticleCount, integrationType) {
                this.integrationType = Proton.Util.initValue(integrationType, Proton.EULER);
                this.emitters = [];
                this.renderers = [];
                this.time = 0;
                this.oldTime = 0;

                Proton.pool = new Proton.Pool(100);
                Proton.integrator = new Proton.NumericalIntegration(this.integrationType);
        }

        Proton.prototype = {
                /**
                 * add a type of Renderer
                 *
                 * @method addRender
                 * @memberof Proton
                 * @instance
                 *
                 * @param {Renderer} render
                 */
                addRender: function addRender(render) {
                        render.proton = this;
                        this.renderers.push(render.proton);
                },

                /**
                 * add the Emitter
                 *
                 * @method addEmitter
                 * @memberof Proton
                 * @instance
                 *
                 * @param {Emitter} emitter
                 */
                addEmitter: function addEmitter(emitter) {
                        this.emitters.push(emitter);
                        emitter.parent = this;

                        this.dispatchEvent(Proton.EMITTER_ADDED, emitter);
                },

                /**
                 * Removes an Emitter
                 *
                 * @method removeEmitter
                 * @memberof Proton
                 * @instance
                 *
                 * @param {Proton.Emitter} emitter
                 */
                removeEmitter: function removeEmitter(emitter) {
                        var index = this.emitters.indexOf(emitter);
                        this.emitters.splice(index, 1);
                        emitter.parent = null;

                        this.dispatchEvent(Proton.EMITTER_REMOVED, emitter);
                },

                /**
                 * Updates all added emitters
                 *
                 * @method update
                 * @memberof Proton
                 * @instance
                 */
                update: function update() {
                        this.dispatchEvent(Proton.PROTON_UPDATE);

                        if (Proton.USE_CLOCK) {
                                if (!this.oldTime) this.oldTime = new Date().getTime();

                                var time = new Date().getTime();
                                this.elapsed = (time - this.oldTime) / 1000;
                                if (Proton.amendChangeTabsBug) this.amendChangeTabsBug();
                                this.oldTime = time;
                        } else {
                                this.elapsed = 0.0167;
                        }

                        if (this.elapsed > 0) {
                                for (var i = 0; i < this.emitters.length; i++) {
                                        this.emitters[i].update(this.elapsed);
                                }
                        }

                        this.dispatchEvent(Proton.PROTON_UPDATE_AFTER);
                },

                /**
                 * @todo add description
                 *
                 * @method amendChangeTabsBug
                 * @memberof Proton
                 * @instance
                 */
                amendChangeTabsBug: function amendChangeTabsBug() {
                        if (this.elapsed > .5) {
                                this.oldTime = new Date().getTime();
                                this.elapsed = 0;
                        }
                },

                /**
                 * Counts all particles from all emitters
                 *
                 * @method getCount
                 * @memberof Proton
                 * @instance
                 */
                getCount: function getCount() {
                        var total = 0;
                        var length = this.emitters.length;
                        for (var i = 0; i < length; i++) {
                                total += this.emitters[i].particles.length;
                        }
                        return total;
                },

                /**
                 * Destroys everything related to this Proton instance. This includes all emitters, and all properties
                 *
                 * @method destroy
                 * @memberof Proton
                 * @instance
                 */
                destroy: function destroy() {
                        var length = this.emitters.length;
                        for (var i = 0; i < length; i++) {
                                this.emitters[i].destroy();
                                delete this.emitters[i];
                        }

                        this.emitters = [];
                        this.time = 0;
                        this.oldTime = 0;
                        Proton.pool.release();
                }
        };

        /*
         * EventDispatcher
         * Visit http://createjs.com/ for documentation, updates and examples.
         *
         **/

        function EventDispatcher() {
                this.initialize();
        };

        EventDispatcher.initialize = function (target) {
                target.addEventListener = p.addEventListener;
                target.removeEventListener = p.removeEventListener;
                target.removeAllEventListeners = p.removeAllEventListeners;
                target.hasEventListener = p.hasEventListener;
                target.dispatchEvent = p.dispatchEvent;
        };

        var p = EventDispatcher.prototype;

        p._listeners = null;

        p.initialize = function () {};
        p.addEventListener = function (type, listener) {
                if (!this._listeners) {
                        this._listeners = {};
                } else {
                        this.removeEventListener(type, listener);
                }

                if (!this._listeners[type]) this._listeners[type] = [];
                this._listeners[type].push(listener);

                return listener;
        };

        p.removeEventListener = function (type, listener) {
                if (!this._listeners) return;
                if (!this._listeners[type]) return;

                var arr = this._listeners[type];
                for (var i = 0, l = arr.length; i < l; i++) {
                        if (arr[i] == listener) {
                                if (l == 1) {
                                        delete this._listeners[type];
                                }
                                // allows for faster checks.
                                else {
                                                arr.splice(i, 1);
                                        }
                                break;
                        }
                }
        };

        p.removeAllEventListeners = function (type) {
                if (!type) this._listeners = null;else if (this._listeners) delete this._listeners[type];
        };

        p.dispatchEvent = function (eventName, eventTarget) {
                var ret = false,
                    listeners = this._listeners;

                if (eventName && listeners) {
                        var arr = listeners[eventName];
                        if (!arr) return ret;

                        arr = arr.slice();
                        // to avoid issues with items being removed or added during the dispatch

                        var handler,
                            i = arr.length;
                        while (i--) {
                                var handler = arr[i];
                                ret = ret || handler(eventTarget);
                        }
                }

                return !!ret;
        };

        p.hasEventListener = function (type) {
                var listeners = this._listeners;
                return !!(listeners && listeners[type]);
        };

        EventDispatcher.initialize(Proton.prototype);
        Proton.EventDispatcher = EventDispatcher;

        /**
         * @namespace
         * @memberof! Proton#
         * @alias Proton.Util
         */
        var Util = Util || {

                /**
                 * Returns the default if the value is null or undefined
                 *
                 * @memberof Proton#Proton.Util
                 * @method initValue
                 *
                 * @param {Mixed} value a specific value, could be everything but null or undefined
                 * @param {Mixed} defaults the default if the value is null or undefined
                 */
                initValue: function initValue(value, defaults) {
                        var value = value != null && value != undefined ? value : defaults;
                        return value;
                },

                /**
                 * Checks if the value is a valid array
                 *
                 * @memberof Proton#Proton.Util
                 * @method isArray
                 *
                 * @param {Array} value Any array
                 *
                 * @returns {Boolean} 
                 */
                isArray: function isArray(value) {
                        return (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object' && value.hasOwnProperty('length');
                },

                /**
                 * Destroyes the given array
                 *
                 * @memberof Proton#Proton.Util
                 * @method destroyArray
                 *
                 * @param {Array} array Any array
                 */
                destroyArray: function destroyArray(array) {
                        array.length = 0;
                },

                /**
                 * Destroyes the given object
                 *
                 * @memberof Proton#Proton.Util
                 * @method destroyObject
                 *
                 * @param {Object} obj Any object
                 */
                destroyObject: function destroyObject(obj) {
                        for (var o in obj) {
                                delete obj[o];
                        }
                },

                /**
                 * Returns the Vector2D - or creates a new one
                 *
                 * @memberof Proton#Proton.Util
                 * @method getVector2D
                 *
                 * @param {Proton.Vector2D | Number} postionOrX
                 * @param {Number} [y] just valid if 'postionOrX' is not an object
                 *
                 * @return {Proton.Vector2D}
                 */
                getVector2D: function getVector2D(postionOrX, y) {
                        if ((typeof postionOrX === 'undefined' ? 'undefined' : _typeof(postionOrX)) == 'object') {
                                return postionOrX;
                        } else {
                                var vector2d = new Proton.Vector2D(postionOrX, y);
                                return vector2d;
                        }
                },

                /**
                 * Makes an instance of a class and binds the given array
                 *
                 * @memberof Proton#Proton.Util
                 * @method classApply
                 *
                 * @param {Function} constructor A class to make an instance from
                 * @param {Array} [argArray] Any array to bind it to the constructor
                 *
                 * @return {Object} The instance of constructor, optionally bind with argArray
                 */
                classApply: function classApply(constructor, argArray) {
                        if (!argArray) return new constructor();

                        var args = [null].concat(argArray);
                        var factoryFunction = constructor.bind.apply(constructor, args);
                        return new factoryFunction();
                },

                /**
                 * @memberof Proton#Proton.Util
                 * @method judgeVector2D
                 *
                 * @todo add description for param `pOBJ`
                 * @todo add description for function
                 *
                 * @param {Object} pOBJ
                 *
                 * @return {String} result
                 */
                judgeVector2D: function judgeVector2D(pOBJ) {
                        var result = '';
                        if (pOBJ.hasOwnProperty('x') || pOBJ.hasOwnProperty('y') || pOBJ.hasOwnProperty('p') || pOBJ.hasOwnProperty('position')) result += 'p';
                        if (pOBJ.hasOwnProperty('vx') || pOBJ.hasOwnProperty('vx') || pOBJ.hasOwnProperty('v') || pOBJ.hasOwnProperty('velocity')) result += 'v';
                        if (pOBJ.hasOwnProperty('ax') || pOBJ.hasOwnProperty('ax') || pOBJ.hasOwnProperty('a') || pOBJ.hasOwnProperty('accelerate')) result += 'a';

                        return result;
                },

                /**
                 * @memberof Proton#Proton.Util
                 * @method setVector2DByObject
                 *
                 * @todo add description for param `target`
                 * @todo add description for param `pOBJ`
                 * @todo add description for function
                 *
                 * @param {Object} target
                 * @param {Object} pOBJ
                 */
                setVector2DByObject: function setVector2DByObject(target, pOBJ) {
                        if (pOBJ.hasOwnProperty('x')) target.p.x = pOBJ['x'];

                        if (pOBJ.hasOwnProperty('y')) target.p.y = pOBJ['y'];

                        if (pOBJ.hasOwnProperty('vx')) target.v.x = pOBJ['vx'];

                        if (pOBJ.hasOwnProperty('vy')) target.v.y = pOBJ['vy'];

                        if (pOBJ.hasOwnProperty('ax')) target.a.x = pOBJ['ax'];

                        if (pOBJ.hasOwnProperty('ay')) target.a.y = pOBJ['ay'];

                        if (pOBJ.hasOwnProperty('p')) particle.p.copy(pOBJ['p']);

                        if (pOBJ.hasOwnProperty('v')) particle.v.copy(pOBJ['v']);

                        if (pOBJ.hasOwnProperty('a')) particle.a.copy(pOBJ['a']);

                        if (pOBJ.hasOwnProperty('position')) particle.p.copy(pOBJ['position']);

                        if (pOBJ.hasOwnProperty('velocity')) particle.v.copy(pOBJ['velocity']);

                        if (pOBJ.hasOwnProperty('accelerate')) particle.a.copy(pOBJ['accelerate']);
                },

                /**
                 * 强行添加属性
                 *
                 * @memberof Proton#Proton.Util
                 * @method addPrototypeByObject
                 *
                 * @todo add description for param `target`
                 * @todo add description for param `filters`
                 * @todo translate desription from chinese to english
                 *
                 * @param {Object} target
                 * @param {Object} prototypeObject An object of single prototypes
                 * @param {Object} filters
                 *
                 * @return {Object} target
                 */
                addPrototypeByObject: function addPrototypeByObject(target, prototypeObject, filters) {
                        for (var singlePrototype in prototypeObject) {
                                if (filters) {
                                        if (filters.indexOf(singlePrototype) < 0) target[singlePrototype] = Proton.Util.getSpanValue(prototypeObject[singlePrototype]);
                                } else {
                                        target[singlePrototype] = Proton.Util.getSpanValue(prototypeObject[singlePrototype]);
                                }
                        }

                        return target;
                },

                /**
                 * set the prototype in a given prototypeObject
                 *
                 * @memberof Proton#Proton.Util
                 * @method setPrototypeByObject
                 *
                 * @todo add description for param `target`
                 * @todo add description for param `filters`
                 * @todo translate desription from chinese to english
                 *
                 * @param {Object} target
                 * @param {Object} prototypeObject An object of single prototypes
                 * @param {Object} filters
                 *
                 * @return {Object} target
                 */
                setPrototypeByObject: function setPrototypeByObject(target, prototypeObject, filters) {
                        for (var singlePrototype in prototypeObject) {
                                if (target.hasOwnProperty(singlePrototype)) {
                                        if (filters) {
                                                if (filters.indexOf(singlePrototype) < 0) target[singlePrototype] = Proton.Util.getSpanValue(prototypeObject[singlePrototype]);
                                        } else {
                                                target[singlePrototype] = Proton.Util.getSpanValue(prototypeObject[singlePrototype]);
                                        }
                                }
                        }

                        return target;
                },

                /**
                 * Returns a new Proton.Span object
                 *
                 * @memberof Proton#Proton.Util
                 * @method setSpanValue
                 *
                 * @todo a, b and c should be 'Mixed' or 'Number'?
                 *
                 * @param {Mixed | Proton.Span} a
                 * @param {Mixed}               b
                 * @param {Mixed}               c
                 *
                 * @return {Proton.Span}
                 */
                setSpanValue: function setSpanValue(a, b, c) {
                        if (a instanceof Proton.Span) {
                                return a;
                        } else {
                                if (!b) {
                                        return new Proton.Span(a);
                                } else {
                                        if (!c) return new Proton.Span(a, b);else return new Proton.Span(a, b, c);
                                }
                        }
                },

                /**
                 * Returns the value from a Proton.Span, if the param is not a Proton.Span it will return the given parameter
                 *
                 * @memberof Proton#Proton.Util
                 * @method getSpanValue
                 *
                 * @param {Mixed | Proton.Span} pan
                 *
                 * @return {Mixed} the value of Proton.Span OR the parameter if it is not a Proton.Span
                 */
                getSpanValue: function getSpanValue(pan) {
                        if (pan instanceof Proton.Span) return pan.getValue();else return pan;
                },

                /**
                 * Inherits any class from the superclass. Acts like 'extends' in Java
                 *
                 * @memberof Proton#Proton.Util
                 * @method inherits
                 *
                 * @param {Object} subClass     the child class
                 * @param {Object} superClass   the parent/super class
                 */
                inherits: function inherits(subClass, superClass) {
                        subClass._super_ = superClass;
                        if (Object['create']) {
                                //console.log(subClass,superClass);
                                subClass.prototype = Object.create(superClass.prototype, {
                                        constructor: {
                                                value: subClass
                                        }
                                });
                        } else {
                                var F = function F() {};
                                F.prototype = superClass.prototype;
                                subClass.prototype = new F();
                                subClass.prototype.constructor = subClass;
                        }
                },

                /**
                 * This will get the image data. It could be necessary to create a Proton.Zone.
                 *
                 * @memberof Proton#Proton.Util
                 * @method getImageData
                 *
                 * @param {HTMLCanvasElement}   context any canvas, must be a 2dContext 'canvas.getContext('2d')'
                 * @param {Object}              image   could be any dom image, e.g. document.getElementById('thisIsAnImgTag');
                 * @param {Proton.Rectangle}    rect
                 */
                getImageData: function getImageData(context, image, rect) {
                        context.drawImage(image, rect.x, rect.y);
                        var imagedata = context.getImageData(rect.x, rect.y, rect.width, rect.height);
                        //  context.clearRect(rect.x, rect.y, rect.width, rect.height);
                        return imagedata;
                },

                /**
                 * @memberof Proton#Proton.Util
                 * @method getImage
                 *
                 * @todo add description
                 * @todo describe fun
                 *
                 * @param {Mixed}               img
                 * @param {Proton.Particle}     particle
                 * @param {Boolean}             drawCanvas  set to true if a canvas should be saved into particle.transform.canvas
                 * @param {Boolean}             fun
                 */
                getImage: function getImage(img, particle, drawCanvas, fun) {
                        if (typeof img == 'string') {
                                this.loadAndSetImage(img, particle, drawCanvas, fun);
                        } else if ((typeof img === 'undefined' ? 'undefined' : _typeof(img)) == 'object') {
                                this.loadAndSetImage(img.src, particle, drawCanvas, fun);
                        } else if (img instanceof Image) {
                                this.loadedImage(img.src, particle, drawCanvas, fun, img);
                        }
                },

                /**
                 * @memberof Proton#Proton.Util
                 * @method loadedImage
                 *
                 * @todo add description
                 * @todo describe fun
                 * @todo describe target
                 *
                 * @param {String}              src         the src of an img-tag
                 * @param {Proton.Particle}     particle
                 * @param {Boolean}             drawCanvas  set to true if a canvas should be saved into particle.transform.canvas
                 * @param {Boolean}             fun
                 * @param {Object}              target
                 */
                loadedImage: function loadedImage(src, particle, drawCanvas, fun, target) {
                        particle.target = target;
                        particle.transform.src = src;
                        if (!Proton.TextureBuffer[src]) Proton.TextureBuffer[src] = particle.target;
                        if (drawCanvas) {
                                if (Proton.TextureCanvasBuffer[src]) {
                                        particle.transform.canvas = Proton.TextureCanvasBuffer[src];
                                } else {
                                        var _width = Proton.WebGLUtil.nhpot(particle.target.width);
                                        var _height = Proton.WebGLUtil.nhpot(particle.target.height);
                                        particle.transform.canvas = Proton.DomUtil.createCanvas('canvas' + src, _width, _height);
                                        var context = particle.transform.canvas.getContext('2d');
                                        context.drawImage(particle.target, 0, 0, particle.target.width, particle.target.height);
                                        Proton.TextureCanvasBuffer[src] = particle.transform.canvas;
                                }
                        }
                        if (fun) fun(particle);
                },

                /**
                 * @memberof Proton#Proton.Util
                 * @method loadAndSetImage
                 *
                 * @todo add description
                 * @todo describe fun
                 *
                 * @param {String}              src         the src of an img-tag
                 * @param {Proton.Particle}     particle
                 * @param {Boolean}             drawCanvas  set to true if a canvas should be saved into particle.transform.canvas
                 * @param {Boolean}             fun
                 */
                loadAndSetImage: function loadAndSetImage(src, particle, drawCanvas, fun) {
                        if (Proton.TextureBuffer[src]) {
                                this.loadedImage(src, particle, drawCanvas, fun, Proton.TextureBuffer[src]);
                        } else {
                                var self = this;
                                var myImage = new Image();
                                myImage.onload = function (e) {
                                        self.loadedImage(src, particle, drawCanvas, fun, e.target);
                                };
                                myImage.src = src;
                        }
                },

                /**
                 * @typedef  {Object} rgbObject
                 * @property {Number} r red value
                 * @property {Number} g green value
                 * @property {Number} b blue value
                 */
                /**
                 * converts a hex value to a rgb object
                 *
                 * @memberof Proton#Proton.Util
                 * @method hexToRGB
                 *
                 * @param {String} h any hex value, e.g. #000000 or 000000 for black
                 *
                 * @return {rgbObject}
                 */
                hexToRGB: function hexToRGB(h) {
                        var hex16 = h.charAt(0) == "#" ? h.substring(1, 7) : h;
                        var r = parseInt(hex16.substring(0, 2), 16);
                        var g = parseInt(hex16.substring(2, 4), 16);
                        var b = parseInt(hex16.substring(4, 6), 16);

                        return {
                                r: r,
                                g: g,
                                b: b
                        };
                },

                /**
                 * converts a rgb value to a rgb string
                 *
                 * @memberof Proton#Proton.Util
                 * @method rgbToHex
                 *
                 * @param {Object | Proton.hexToRGB} rgb a rgb object like in {@link Proton#Proton.Util.hexToRGB}
                 *
                 * @return {String} rgb()
                 */
                rgbToHex: function rgbToHex(rbg) {
                        return 'rgb(' + rbg.r + ', ' + rbg.g + ', ' + rbg.b + ')';
                }
        };

        Proton.Util = Util;

        ///bind
        if (!Function.prototype.bind) {
                Function.prototype.bind = function (oThis) {
                        if (typeof this !== "function") {
                                // closest thing possible to the ECMAScript 5
                                // internal IsCallable function
                                throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
                        }

                        var aArgs = Array.prototype.slice.call(arguments, 1),
                            fToBind = this,
                            fNOP = function fNOP() {},
                            fBound = function fBound() {
                                return fToBind.apply(this instanceof fNOP ? this : oThis || this, aArgs.concat(Array.prototype.slice.call(arguments)));
                        };

                        fNOP.prototype = this.prototype;
                        fBound.prototype = new fNOP();

                        return fBound;
                };
        }

        /**
            * @namespace
            * @memberof! Proton#
            * @alias Proton.WebGLUtil
            */
        var WebGLUtil = WebGLUtil || {

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method ipot
                       *
                       * @todo add description
                       * @todo add length description
                       *
                       * @param {Number} length
                       *
                       * @return {Boolean}
                       */
                ipot: function ipot(length) {
                        return (length & length - 1) == 0;
                },

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method nhpot
                       *
                       * @todo add description
                       * @todo add length description
                       *
                       * @param {Number} length
                       *
                       * @return {Number}
                       */
                nhpot: function nhpot(length) {
                        --length;
                        for (var i = 1; i < 32; i <<= 1) {
                                length = length | length >> i;
                        }
                        return length + 1;
                },

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method makeTranslation
                       *
                       * @todo add description
                       * @todo add tx, ty description
                       * @todo add return description
                       *
                       * @param {Number} tx either 0 or 1
                       * @param {Number} ty either 0 or 1
                       *
                       * @return {Object}
                       */
                makeTranslation: function makeTranslation(tx, ty) {
                        return [1, 0, 0, 0, 1, 0, tx, ty, 1];
                },

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method makeRotation
                       *
                       * @todo add description
                       * @todo add return description
                       *
                       * @param {Number} angleInRadians
                       *
                       * @return {Object}
                       */
                makeRotation: function makeRotation(angleInRadians) {
                        var c = Math.cos(angleInRadians);
                        var s = Math.sin(angleInRadians);
                        return [c, -s, 0, s, c, 0, 0, 0, 1];
                },

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method makeScale
                       *
                       * @todo add description
                       * @todo add tx, ty description
                       * @todo add return description
                       *
                       * @param {Number} sx either 0 or 1
                       * @param {Number} sy either 0 or 1
                       *
                       * @return {Object}
                       */
                makeScale: function makeScale(sx, sy) {
                        return [sx, 0, 0, 0, sy, 0, 0, 0, 1];
                },

                /**
                       * @memberof Proton#Proton.WebGLUtil
                       * @method matrixMultiply
                       *
                       * @todo add description
                       * @todo add a, b description
                       * @todo add return description
                       *
                       * @param {Object} a
                       * @param {Object} b
                       *
                       * @return {Object}
                       */
                matrixMultiply: function matrixMultiply(a, b) {
                        var a00 = a[0 * 3 + 0];
                        var a01 = a[0 * 3 + 1];
                        var a02 = a[0 * 3 + 2];
                        var a10 = a[1 * 3 + 0];
                        var a11 = a[1 * 3 + 1];
                        var a12 = a[1 * 3 + 2];
                        var a20 = a[2 * 3 + 0];
                        var a21 = a[2 * 3 + 1];
                        var a22 = a[2 * 3 + 2];
                        var b00 = b[0 * 3 + 0];
                        var b01 = b[0 * 3 + 1];
                        var b02 = b[0 * 3 + 2];
                        var b10 = b[1 * 3 + 0];
                        var b11 = b[1 * 3 + 1];
                        var b12 = b[1 * 3 + 2];
                        var b20 = b[2 * 3 + 0];
                        var b21 = b[2 * 3 + 1];
                        var b22 = b[2 * 3 + 2];
                        return [a00 * b00 + a01 * b10 + a02 * b20, a00 * b01 + a01 * b11 + a02 * b21, a00 * b02 + a01 * b12 + a02 * b22, a10 * b00 + a11 * b10 + a12 * b20, a10 * b01 + a11 * b11 + a12 * b21, a10 * b02 + a11 * b12 + a12 * b22, a20 * b00 + a21 * b10 + a22 * b20, a20 * b01 + a21 * b11 + a22 * b21, a20 * b02 + a21 * b12 + a22 * b22];
                }
        };

        Proton.WebGLUtil = WebGLUtil;

        /**
            * @namespace
            * @memberof! Proton#
            * @alias Proton.DomUtil
            */
        var DomUtil = DomUtil || {

                /**
                       * Creates and returns a new canvas. The opacity is by default set to 0
                       *
                       * @memberof Proton#Proton.DomUtil
                       * @method createCanvas
                       *
                       * @param {String} $id the canvas' id
                       * @param {Number} $width the canvas' width
                       * @param {Number} $height the canvas' height
                       * @param {String} [$position=absolute] the canvas' position, default is 'absolute' 
                       *
                       * @return {Object}
                       */
                createCanvas: function createCanvas($id, $width, $height, $position) {
                        var element = document.createElement("canvas");
                        var position = $position ? $position : 'absolute';
                        element.id = $id;
                        element.width = $width;
                        element.height = $height;
                        element.style.position = position;
                        element.style.opacity = 0;
                        this.transformDom(element, -500, -500, 0, 0);
                        return element;
                },

                /**
                       * Adds a transform: translate(), scale(), rotate() to a given div element for all browsers
                       *
                       * @memberof Proton#Proton.DomUtil
                       * @method transformDom
                       *
                       * @param {HTMLDivElement} $div 
                       * @param {Number} $x 
                       * @param {Number} $y 
                       * @param {Number} $scale 
                       * @param {Number} $rotate 
                       */
                transformDom: function transformDom($div, $x, $y, $scale, $rotate) {
                        $div.style.WebkitTransform = 'translate(' + $x + 'px, ' + $y + 'px) ' + 'scale(' + $scale + ') ' + 'rotate(' + $rotate + 'deg)';
                        $div.style.MozTransform = 'translate(' + $x + 'px, ' + $y + 'px) ' + 'scale(' + $scale + ') ' + 'rotate(' + $rotate + 'deg)';
                        $div.style.OTransform = 'translate(' + $x + 'px, ' + $y + 'px) ' + 'scale(' + $scale + ') ' + 'rotate(' + $rotate + 'deg)';
                        $div.style.msTransform = 'translate(' + $x + 'px, ' + $y + 'px) ' + 'scale(' + $scale + ') ' + 'rotate(' + $rotate + 'deg)';
                        $div.style.transform = 'translate(' + $x + 'px, ' + $y + 'px) ' + 'scale(' + $scale + ') ' + 'rotate(' + $rotate + 'deg)';
                }
        };

        Proton.DomUtil = DomUtil;

        function MStack() {
                this.mats = [];
                this.size = 0;
                for (var i = 0; i < 20; i++) {
                        this.mats.push(Proton.Mat3.create([0, 0, 0, 0, 0, 0, 0, 0, 0]));
                }
        }

        MStack.prototype.set = function (m, i) {
                if (i == 0) Proton.Mat3.set(m, this.mats[0]);else Proton.Mat3.multiply(this.mats[i - 1], m, this.mats[i]);
                this.size = Math.max(this.size, i + 1);
        };

        MStack.prototype.push = function (m) {
                if (this.size == 0) Proton.Mat3.set(m, this.mats[0]);else Proton.Mat3.multiply(this.mats[this.size - 1], m, this.mats[this.size]);
                this.size++;
        };

        MStack.prototype.pop = function () {
                if (this.size > 0) this.size--;
        };

        MStack.prototype.top = function () {
                return this.mats[this.size - 1];
        };

        Proton.MStack = MStack;

        Particle.ID = 0;
        /**
         * the Particle class
         *
         * @class Proton.Particle
         * @constructor
         * @param {Object} pObj the parameters object;
         * for example {life:3,dead:false}
         */
        function Particle(pOBJ) {
                /**
                 * The particle's id;
                 * @property id
                 * @type {string}
                 */
                this.id = 'particle_' + Particle.ID++;
                this.reset(true);
                Proton.Util.setPrototypeByObject(this, pOBJ);
        }

        Particle.prototype = {
                getDirection: function getDirection() {
                        return Math.atan2(this.v.x, -this.v.y) * (180 / Math.PI);
                },

                reset: function reset(init) {
                        this.life = Infinity;
                        this.age = 0;

                        //Energy loss
                        this.energy = 1;
                        this.dead = false;
                        this.sleep = false;
                        this.target = null;
                        this.sprite = null;
                        this.parent = null;
                        this.mass = 1;
                        this.radius = 10;
                        this.alpha = 1;
                        this.scale = 1;
                        this.rotation = 0;
                        this.color = null;
                        this.easing = Proton.ease.setEasingByName(Proton.easeLinear);

                        if (init) {
                                this.transform = {};
                                this.p = new Proton.Vector2D();
                                this.v = new Proton.Vector2D();
                                this.a = new Proton.Vector2D();
                                this.old = {
                                        p: new Proton.Vector2D(),
                                        v: new Proton.Vector2D(),
                                        a: new Proton.Vector2D()
                                };
                                this.behaviours = [];
                        } else {
                                Proton.Util.destroyObject(this.transform);
                                this.p.set(0, 0);
                                this.v.set(0, 0);
                                this.a.set(0, 0);
                                this.old.p.set(0, 0);
                                this.old.v.set(0, 0);
                                this.old.a.set(0, 0);

                                this.removeAllBehaviours();
                        }

                        this.transform.rgb = {
                                r: 255,
                                g: 255,
                                b: 255
                        };

                        return this;
                },

                update: function update(time, index) {
                        if (!this.sleep) {
                                this.age += time;
                                var length = this.behaviours.length,
                                    i;

                                for (i = 0; i < length; i++) {
                                        if (this.behaviours[i]) this.behaviours[i].applyBehaviour(this, time, index);
                                }
                        } else {}

                        if (this.age >= this.life) {
                                this.destroy();
                        } else {
                                var scale = this.easing(this.age / this.life);
                                this.energy = Math.max(1 - scale, 0);
                        }
                },

                addBehaviour: function addBehaviour(behaviour) {
                        this.behaviours.push(behaviour);
                        if (behaviour.hasOwnProperty('parents')) behaviour.parents.push(this);

                        behaviour.initialize(this);
                },

                addBehaviours: function addBehaviours(behaviours) {
                        var length = behaviours.length,
                            i;

                        for (i = 0; i < length; i++) {
                                this.addBehaviour(behaviours[i]);
                        }
                },

                removeBehaviour: function removeBehaviour(behaviour) {
                        var index = this.behaviours.indexOf(behaviour);
                        if (index > -1) {
                                var behaviour = this.behaviours.splice(index, 1);
                                behaviour.parents = null;
                        }
                },

                removeAllBehaviours: function removeAllBehaviours() {
                        Proton.Util.destroyArray(this.behaviours);
                },

                /**
                 * Destory this particle
                 * @method destroy
                 */
                destroy: function destroy() {
                        this.removeAllBehaviours();
                        this.energy = 0;
                        this.dead = true;
                        this.parent = null;
                }
        };

        Proton.Particle = Particle;

        /**
         * @memberof! Proton#
         * @constructor
         * @alias Proton.Pool
         *
         * @todo add description
         * @todo add description of properties
         *
         * @property {Number} cID
         * @property {Object} list
         */
        function Pool() {
                this.cID = 0;
                this.list = {};
        }

        Pool.prototype = {

                /**
                 * Creates a new class instance
                 *
                 * @todo add more documentation 
                 *
                 * @method create
                 * @memberof Proton#Proton.Pool
                 *
                 * @param {Object|Function} obj any Object or Function
                 * @param {Object} [params] just add if `obj` is a function
                 *
                 * @return {Object}
                 */
                create: function create(obj, params) {
                        this.cID++;

                        if (typeof obj == "function") return Proton.Util.classApply(obj, params);else return obj.clone();
                },

                /**
                 * @todo add description - what is in the list?
                 *
                 * @method getCount
                 * @memberof Proton#Proton.Pool
                 *
                 * @return {Number}
                 */
                getCount: function getCount() {
                        var count = 0;
                        for (var id in this.list) {
                                count += this.list[id].length;
                        }return count++;;
                },

                /**
                 * @todo add description
                 *
                 * @method get
                 * @memberof Proton#Proton.Pool
                 *
                 * @param {Object|Function} obj
                 * @param {Object} [params] just add if `obj` is a function
                 *
                 * @return {Object}
                 */
                get: function get(obj, params) {
                        var p,
                            puid = obj.__puid || PUID.id(obj);
                        if (this.list[puid] && this.list[puid].length > 0) p = this.list[puid].pop();else p = this.create(obj, params);

                        p.__puid = obj.__puid || puid;
                        return p;
                },

                /**
                 * @todo add description
                 *
                 * @method set
                 * @memberof Proton#Proton.Pool
                 *
                 * @param {Object} obj
                 *
                 * @return {Object}
                 */
                set: function set(obj) {
                        return this._getList(obj.__puid).push(obj);
                },

                /**
                 * Destroyes all items from Pool.list
                 *
                 * @method destroy
                 * @memberof Proton#Proton.Pool
                 */
                destroy: function destroy() {
                        for (var id in this.list) {
                                this.list[id].length = 0;
                                delete this.list[id];
                        }
                },

                /**
                 * Returns Pool.list
                 *
                 * @method _getList
                 * @memberof Proton#Proton.Pool
                 * @private
                 *
                 * @param {Number} uid the unique id
                 *
                 * @return {Object}
                 */
                _getList: function _getList(uid) {
                        uid = uid || "default";
                        if (!this.list[uid]) this.list[uid] = [];
                        return this.list[uid];
                }
        };

        Proton.Pool = Pool;

        var PUID = {
                _id: 0,
                _uids: {},
                id: function id(obj) {
                        for (var id in this._uids) {
                                if (this._uids[id] == obj) return id;
                        }

                        var nid = "PUID_" + this._id++;
                        this._uids[nid] = obj;
                        return nid;
                },

                hash: function hash(str) {
                        return;
                }
        };

        var MathUtils = {
                randomAToB: function randomAToB(a, b, INT) {
                        if (!INT) return a + Math.random() * (b - a);else return Math.floor(Math.random() * (b - a)) + a;
                },
                randomFloating: function randomFloating(center, f, INT) {
                        return MathUtils.randomAToB(center - f, center + f, INT);
                },
                randomZone: function randomZone(display) {},

                degreeTransform: function degreeTransform(a) {
                        return a * Math.PI / 180;
                },

                toColor16: function getRGB(num) {
                        return "#" + num.toString(16);
                },

                randomColor: function randomColor() {
                        return '#' + ('00000' + (Math.random() * 0x1000000 << 0).toString(16)).slice(-6);
                }
        };

        Proton.MathUtils = MathUtils;

        //数值积分

        var NumericalIntegration = function NumericalIntegration(type) {
                this.type = Proton.Util.initValue(type, Proton.EULER);
        };

        NumericalIntegration.prototype = {
                integrate: function integrate(particles, time, damping) {
                        this.eulerIntegrate(particles, time, damping);
                },

                eulerIntegrate: function eulerIntegrate(particle, time, damping) {
                        if (!particle.sleep) {
                                particle.old.p.copy(particle.p);
                                particle.old.v.copy(particle.v);
                                particle.a.multiplyScalar(1 / particle.mass);
                                particle.v.add(particle.a.multiplyScalar(time));
                                particle.p.add(particle.old.v.multiplyScalar(time));
                                if (damping) particle.v.multiplyScalar(damping);
                                particle.a.clear();
                        }
                }
        };

        Proton.NumericalIntegration = NumericalIntegration;

        //@author mrdoob / http://mrdoob.com/

        var Vector2D = function Vector2D(x, y) {
                this.x = x || 0;
                this.y = y || 0;
        };

        Vector2D.prototype = {
                set: function set(x, y) {

                        this.x = x;
                        this.y = y;
                        return this;
                },

                setX: function setX(x) {

                        this.x = x;
                        return this;
                },

                setY: function setY(y) {

                        this.y = y;

                        return this;
                },

                getGradient: function getGradient() {
                        if (this.x != 0) return Math.atan2(this.y, this.x);else if (this.y > 0) return Math.PI / 2;else if (this.y < 0) return -Math.PI / 2;
                },

                copy: function copy(v) {

                        this.x = v.x;
                        this.y = v.y;

                        return this;
                },

                add: function add(v, w) {

                        if (w !== undefined) {
                                return this.addVectors(v, w);
                        }

                        this.x += v.x;
                        this.y += v.y;

                        return this;
                },

                addXY: function addXY(a, b) {

                        this.x += a;
                        this.y += b;

                        return this;
                },

                addVectors: function addVectors(a, b) {

                        this.x = a.x + b.x;
                        this.y = a.y + b.y;

                        return this;
                },

                addScalar: function addScalar(s) {

                        this.x += s;
                        this.y += s;

                        return this;
                },

                sub: function sub(v, w) {

                        if (w !== undefined) {
                                return this.subVectors(v, w);
                        }

                        this.x -= v.x;
                        this.y -= v.y;

                        return this;
                },

                subVectors: function subVectors(a, b) {

                        this.x = a.x - b.x;
                        this.y = a.y - b.y;

                        return this;
                },

                multiplyScalar: function multiplyScalar(s) {

                        this.x *= s;
                        this.y *= s;

                        return this;
                },

                divideScalar: function divideScalar(s) {

                        if (s !== 0) {

                                this.x /= s;
                                this.y /= s;
                        } else {

                                this.set(0, 0);
                        }

                        return this;
                },

                min: function min(v) {

                        if (this.x > v.x) {

                                this.x = v.x;
                        }

                        if (this.y > v.y) {

                                this.y = v.y;
                        }

                        return this;
                },

                max: function max(v) {

                        if (this.x < v.x) {

                                this.x = v.x;
                        }

                        if (this.y < v.y) {

                                this.y = v.y;
                        }

                        return this;
                },

                negate: function negate() {

                        return this.multiplyScalar(-1);
                },

                dot: function dot(v) {

                        return this.x * v.x + this.y * v.y;
                },

                lengthSq: function lengthSq() {

                        return this.x * this.x + this.y * this.y;
                },

                length: function length() {

                        return Math.sqrt(this.x * this.x + this.y * this.y);
                },

                normalize: function normalize() {

                        return this.divideScalar(this.length());
                },

                distanceTo: function distanceTo(v) {

                        return Math.sqrt(this.distanceToSquared(v));
                },

                rotate: function rotate(tha) {
                        var x = this.x;
                        var y = this.y;
                        this.x = x * Math.cos(tha) + y * Math.sin(tha);
                        this.y = -x * Math.sin(tha) + y * Math.cos(tha);
                        return this;
                },

                distanceToSquared: function distanceToSquared(v) {

                        var dx = this.x - v.x,
                            dy = this.y - v.y;
                        return dx * dx + dy * dy;
                },

                setLength: function setLength(l) {

                        var oldLength = this.length();

                        if (oldLength !== 0 && l !== oldLength) {

                                this.multiplyScalar(l / oldLength);
                        }

                        return this;
                },

                lerp: function lerp(v, alpha) {

                        this.x += (v.x - this.x) * alpha;
                        this.y += (v.y - this.y) * alpha;

                        return this;
                },

                equals: function equals(v) {

                        return v.x === this.x && v.y === this.y;
                },

                toArray: function toArray() {

                        return [this.x, this.y];
                },

                clear: function clear() {
                        this.x = 0.0;
                        this.y = 0.0;
                        return this;
                },

                clone: function clone() {

                        return new Proton.Vector2D(this.x, this.y);
                }
        };

        Proton.Vector2D = Vector2D;

        var Polar2D = function Polar2D(r, tha) {
                this.r = Math.abs(r) || 0;
                this.tha = tha || 0;
        };

        Polar2D.prototype = {
                set: function set(r, tha) {

                        this.r = r;
                        this.tha = tha;
                        return this;
                },

                setR: function setR(r) {

                        this.r = r;
                        return this;
                },

                setTha: function setTha(tha) {

                        this.tha = tha;

                        return this;
                },

                copy: function copy(p) {

                        this.r = p.r;
                        this.tha = p.tha;

                        return this;
                },

                toVector: function toVector() {
                        return new Proton.Vector2D(this.getX(), this.getY());
                },

                getX: function getX() {
                        return this.r * Math.sin(this.tha);
                },

                getY: function getY() {
                        return -this.r * Math.cos(this.tha);
                },

                normalize: function normalize() {

                        this.r = 1;
                        return this;
                },

                equals: function equals(v) {

                        return v.r === this.r && v.tha === this.tha;
                },

                toArray: function toArray() {

                        return [this.r, this.tha];
                },

                clear: function clear() {
                        this.r = 0.0;
                        this.tha = 0.0;
                        return this;
                },

                clone: function clone() {

                        return new Proton.Polar2D(this.r, this.tha);
                }
        };

        Proton.Polar2D = Polar2D;

        function Span(a, b, center) {
                this.isArray = false;

                if (Proton.Util.isArray(a)) {
                        this.isArray = true;
                        this.a = a;
                } else {
                        this.a = Proton.Util.initValue(a, 1);
                        this.b = Proton.Util.initValue(b, this.a);
                        this.center = Proton.Util.initValue(center, false);
                }
        }

        Span.prototype = {
                getValue: function getValue(INT) {
                        if (this.isArray) {
                                return this.a[Math.floor(this.a.length * Math.random())];
                        } else {
                                if (!this.center) return Proton.MathUtils.randomAToB(this.a, this.b, INT);else return Proton.MathUtils.randomFloating(this.a, this.b, INT);
                        }
                }
        };

        Proton.Span = Span;
        Proton.getSpan = function (a, b, center) {
                return new Proton.Span(a, b, center);
        };

        function ColorSpan(color) {
                if (Proton.Util.isArray(color)) {
                        this.colorArr = color;
                } else {
                        this.colorArr = [color];
                }
        }

        Proton.Util.inherits(ColorSpan, Proton.Span);
        ColorSpan.prototype.getValue = function () {
                var color = this.colorArr[Math.floor(this.colorArr.length * Math.random())];
                if (color == 'random' || color == 'Random') return Proton.MathUtils.randomColor();else return color;
        };

        Proton.ColorSpan = ColorSpan;

        function Rectangle(x, y, w, h) {
                this.x = x;
                this.y = y;
                this.width = w;
                this.height = h;
                this.bottom = this.y + this.height;
                this.right = this.x + this.width;
        }

        Rectangle.prototype = {
                contains: function contains(x, y) {
                        if (x <= this.right && x >= this.x && y <= this.bottom && y >= this.y) return true;else return false;
                }
        };

        Proton.Rectangle = Rectangle;

        var Mat3 = Mat3 || {
                create: function create(mat3) {
                        var mat = new Float32Array(9);
                        if (mat3) this.set(mat3, mat);
                        return mat;
                },
                set: function set(mat1, mat2) {
                        for (var i = 0; i < 9; i++) {
                                mat2[i] = mat1[i];
                        }return mat2;
                },
                multiply: function multiply(mat, mat2, mat3) {
                        var a00 = mat[0],
                            a01 = mat[1],
                            a02 = mat[2],
                            a10 = mat[3],
                            a11 = mat[4],
                            a20 = mat[6],
                            a21 = mat[7],
                            b00 = mat2[0],
                            b01 = mat2[1],
                            b02 = mat2[2],
                            b10 = mat2[3],
                            b11 = mat2[4],
                            b20 = mat2[6],
                            b21 = mat2[7];

                        mat3[0] = b00 * a00 + b01 * a10;
                        mat3[1] = b00 * a01 + b01 * a11;
                        mat3[2] = a02 * b02;
                        mat3[3] = b10 * a00 + b11 * a10;
                        mat3[4] = b10 * a01 + b11 * a11;
                        mat3[6] = b20 * a00 + b21 * a10 + a20;
                        mat3[7] = b20 * a01 + b21 * a11 + a21;
                        return mat3;
                },
                inverse: function inverse(mat, mat3) {
                        var a00 = mat[0],
                            a01 = mat[1],
                            a10 = mat[3],
                            a11 = mat[4],
                            a20 = mat[6],
                            a21 = mat[7],
                            b01 = a11,
                            b11 = -a10,
                            b21 = a21 * a10 - a11 * a20,
                            d = a00 * b01 + a01 * b11,
                            id;
                        id = 1 / d;
                        mat3[0] = b01 * id;
                        mat3[1] = -a01 * id;
                        mat3[3] = b11 * id;
                        mat3[4] = a00 * id;
                        mat3[6] = b21 * id;
                        mat3[7] = (-a21 * a00 + a01 * a20) * id;
                        return mat3;
                },
                multiplyVec2: function multiplyVec2(m, vec, mat3) {
                        var x = vec[0],
                            y = vec[1];
                        mat3[0] = x * m[0] + y * m[3] + m[6];
                        mat3[1] = x * m[1] + y * m[4] + m[7];
                        return mat3;
                }
        };

        Proton.Mat3 = Mat3;

        Behaviour.id = 0;

        /**
         * The Behaviour class is the base for the other Behaviour
         *
         * @memberof! -
         * @interface
         * @alias Proton.Behaviour
         *
         * @param {Number} life 	the behaviours life
         * @param {String} easing 	The behaviour's decaying trend, for example Proton.easeOutQuart
         *
         * @property {String}  id 		The behaviours id
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         * @property {Number}  age=0 	How long the particle should be 'alife'
         * @property {Number}  energy=1
         * @property {Boolean} dead=false The particle is dead at first
         * @property {Array}   parents 	The behaviour's parents array
         * @property {String}  name 	The behaviour name
         */
        function Behaviour(life, easing) {
                this.id = 'Behaviour_' + Behaviour.id++;
                this.life = Proton.Util.initValue(life, Infinity);
                this.easing = Proton.ease.setEasingByName(easing);
                this.age = 0;
                this.energy = 1;
                this.dead = false;
                this.parents = [];
                this.name = 'Behaviour';
        }

        Behaviour.prototype = {
                /**
                 * Reset this behaviour's parameters
                 *
                 * @method reset
                 * @memberof Proton.Behaviour
                 * @instance
                 *
                 * @param {Number} [life=Infinity] 		this behaviour's life
                 * @param {String} [easing=easeLinear] 	this behaviour's easing
                 */
                reset: function reset(life, easing) {
                        this.life = Proton.Util.initValue(life, Infinity);
                        this.easing = Proton.Util.initValue(easing, Proton.ease.setEasingByName(Proton.easeLinear));
                },
                /**
                 * Normalize a force by 1:100;
                 *
                 * @method normalizeForce
                 * @memberof Proton.Behaviour
                 * @instance
                 *
                 * @param {Proton.Vector2D} force 
                 */
                normalizeForce: function normalizeForce(force) {
                        return force.multiplyScalar(Proton.MEASURE);
                },

                /**
                 * Normalize a value by 1:100;
                 *
                 * @method normalizeValue
                 * @memberof Proton.Behaviour
                 * @instance
                 *
                 * @param {Number} value
                 */
                normalizeValue: function normalizeValue(value) {
                        return value * Proton.MEASURE;
                },

                /**
                 * Initialize the behaviour's parameters for all particles
                 *
                 * @method initialize
                 * @memberof Proton.Behaviour
                 * @instance
                 *
                 * @param {Proton.Particle} particle
                 */
                initialize: function initialize(particle) {},

                /**
                 * Apply this behaviour for all particles every time
                 *
                 * @method applyBehaviour
                 * @memberof Proton.Behaviour
                 * @instance
                 *
                 * @param {Proton.Particle} particle
                 * @param {Number} 			time the integrate time 1/ms
                 * @param {Int} 			index the particle index
                 */
                applyBehaviour: function applyBehaviour(particle, time, index) {
                        this.age += time;
                        if (this.age >= this.life || this.dead) {
                                this.energy = 0;
                                this.dead = true;
                                this.destroy();
                        } else {
                                var scale = this.easing(particle.age / particle.life);
                                this.energy = Math.max(1 - scale, 0);
                        }
                },

                /**
                 * Destory this behaviour
                 *
                 * @method destroy
                 * @memberof Proton.Behaviour
                 * @instance
                 */
                destroy: function destroy() {
                        var index;
                        var length = this.parents.length,
                            i;
                        for (i = 0; i < length; i++) {
                                this.parents[i].removeBehaviour(this);
                        }

                        this.parents = [];
                }
        };

        Proton.Behaviour = Behaviour;

        /**
         * The number of particles per second emission (a [particle]/b [s]);
         * @namespace
         * @memberof! Proton#
         * @constructor
         * @alias Proton.Rate
         *
         * @param {Array | Number | Proton.Span} numpan the number of each emission;
         * @param {Array | Number | Proton.Span} timepan the time of each emission;
         * for example: new Proton.Rate(new Proton.Span(10, 20), new Proton.Span(.1, .25));
         */
        function Rate(numpan, timepan) {
                this.numPan = Proton.Util.initValue(numpan, 1);
                this.timePan = Proton.Util.initValue(timepan, 1);
                this.numPan = Proton.Util.setSpanValue(this.numPan);
                this.timePan = Proton.Util.setSpanValue(this.timePan);
                this.startTime = 0;
                this.nextTime = 0;
                this.init();
        }

        Rate.prototype = {
                /**
                 * @method init
                 * @memberof Proton#Proton.Rate
                 * @instance
                 */
                init: function init() {
                        this.startTime = 0;
                        this.nextTime = this.timePan.getValue();
                },

                getValue: function getValue(time) {
                        this.startTime += time;
                        if (this.startTime >= this.nextTime) {
                                this.startTime = 0;
                                this.nextTime = this.timePan.getValue();
                                if (this.numPan.b == 1) {
                                        if (this.numPan.getValue(false) > 0.5) return 1;else return 0;
                                } else {
                                        return this.numPan.getValue(true);
                                }
                        }
                        return 0;
                }
        };

        Proton.Rate = Rate;

        function Initialize() {}

        Initialize.prototype.reset = function () {};

        Initialize.prototype.init = function (emitter, particle) {
                if (particle) {
                        this.initialize(particle);
                } else {
                        this.initialize(emitter);
                }
        };

        ///sub class init
        Initialize.prototype.initialize = function (target) {};

        Proton.Initialize = Initialize;

        var InitializeUtil = {

                initialize: function initialize(emitter, particle, initializes) {
                        var length = initializes.length,
                            i;
                        for (i = 0; i < length; i++) {
                                if (initializes[i] instanceof Proton.Initialize) initializes[i].init(emitter, particle);else Proton.InitializeUtil.init(emitter, particle, initializes[i]);
                        }

                        Proton.InitializeUtil.bindEmitter(emitter, particle);
                },

                //////////////////////init//////////////////////
                init: function init(emitter, particle, initialize) {
                        Proton.Util.setPrototypeByObject(particle, initialize);
                        Proton.Util.setVector2DByObject(particle, initialize);
                },

                bindEmitter: function bindEmitter(emitter, particle) {
                        if (emitter.bindEmitter) {
                                particle.p.add(emitter.p);
                                particle.v.add(emitter.v);
                                particle.a.add(emitter.a);
                                particle.v.rotate(Proton.MathUtils.degreeTransform(emitter.rotation));
                        }
                }
                //////////////////////init//////////////////////
        };

        Proton.InitializeUtil = InitializeUtil;

        function Life(a, b, c) {
                Life._super_.call(this);
                this.lifePan = Proton.Util.setSpanValue(a, b, c);
        }

        Proton.Util.inherits(Life, Proton.Initialize);
        Life.prototype.initialize = function (target) {
                if (this.lifePan.a == Infinity) target.life = Infinity;else target.life = this.lifePan.getValue();
        };

        Proton.Life = Life;

        function Position(zone) {
                Position._super_.call(this);
                this.zone = Proton.Util.initValue(zone, new Proton.PointZone());
        }

        Proton.Util.inherits(Position, Proton.Initialize);
        Position.prototype.reset = function (zone) {
                this.zone = Proton.Util.initValue(zone, new Proton.PointZone());
        };

        Position.prototype.initialize = function (target) {
                this.zone.getPosition();
                target.p.x = this.zone.vector.x;
                target.p.y = this.zone.vector.y;
        };

        Proton.Position = Position;
        Proton.P = Position;

        //radius and tha
        function Velocity(rpan, thapan, type) {
                Velocity._super_.call(this);
                this.rPan = Proton.Util.setSpanValue(rpan);
                this.thaPan = Proton.Util.setSpanValue(thapan);
                this.type = Proton.Util.initValue(type, 'vector');
        }

        Proton.Util.inherits(Velocity, Proton.Initialize);

        Velocity.prototype.reset = function (rpan, thapan, type) {
                this.rPan = Proton.Util.setSpanValue(rpan);
                this.thaPan = Proton.Util.setSpanValue(thapan);
                this.type = Proton.Util.initValue(type, 'vector');
        };

        Velocity.prototype.normalizeVelocity = function (vr) {
                return vr * Proton.MEASURE;
        };

        Velocity.prototype.initialize = function (target) {
                if (this.type == 'p' || this.type == 'P' || this.type == 'polar') {
                        var polar2d = new Proton.Polar2D(this.normalizeVelocity(this.rPan.getValue()), this.thaPan.getValue() * Math.PI / 180);
                        target.v.x = polar2d.getX();
                        target.v.y = polar2d.getY();
                } else {
                        target.v.x = this.normalizeVelocity(this.rPan.getValue());
                        target.v.y = this.normalizeVelocity(this.thaPan.getValue());
                }
        };

        Proton.Velocity = Velocity;
        Proton.V = Velocity;

        function Mass(a, b, c) {
                Mass._super_.call(this);
                this.massPan = Proton.Util.setSpanValue(a, b, c);
        }

        Proton.Util.inherits(Mass, Proton.Initialize);
        Mass.prototype.initialize = function (target) {
                target.mass = this.massPan.getValue();
        };

        Proton.Mass = Mass;

        function Radius(a, b, c) {
                Radius._super_.call(this);
                this.radius = Proton.Util.setSpanValue(a, b, c);
        }

        Proton.Util.inherits(Radius, Proton.Initialize);
        Radius.prototype.reset = function (a, b, c) {
                this.radius = Proton.Util.setSpanValue(a, b, c);
        };

        Radius.prototype.initialize = function (particle) {
                particle.radius = this.radius.getValue();
                particle.transform.oldRadius = particle.radius;
        };

        Proton.Radius = Radius;

        function ImageTarget(image, w, h) {
                ImageTarget._super_.call(this);
                this.image = this.setSpanValue(image);
                this.w = Proton.Util.initValue(w, 20);
                this.h = Proton.Util.initValue(h, this.w);
        }

        Proton.Util.inherits(ImageTarget, Proton.Initialize);
        ImageTarget.prototype.initialize = function (particle) {
                var imagetarget = this.image.getValue();
                if (typeof imagetarget == 'string') {
                        particle.target = {
                                width: this.w,
                                height: this.h,
                                src: imagetarget
                        };
                } else {
                        particle.target = imagetarget;
                }
        };

        ImageTarget.prototype.setSpanValue = function (color) {
                if (color instanceof Proton.ColorSpan) {
                        return color;
                } else {
                        return new Proton.ColorSpan(color);
                }
        };

        Proton.ImageTarget = ImageTarget;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Force
         *
         * @param {Number} fx
         * @param {Number} fy
         * @param {Number} [life=Infinity] 			this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Force(fx, fy, life, easing) {
                Force._super_.call(this, life, easing);
                this.force = this.normalizeForce(new Proton.Vector2D(fx, fy));
                this.name = "Force";
        }

        Proton.Util.inherits(Force, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Force
         * @instance
         *
         * @param {Number} fx
         * @param {Number} fy
         * @param {Number} [life=Infinity] 			this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Force.prototype.reset = function (fx, fy, life, easing) {
                this.force = this.normalizeForce(new Proton.Vector2D(fx, fy));
                if (life) Force._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.Force
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        Force.prototype.applyBehaviour = function (particle, time, index) {
                Force._super_.prototype.applyBehaviour.call(this, particle, time, index);
                particle.a.add(this.force);
        };

        Proton.Force = Force;
        Proton.F = Force;

        /**
         * This behaviour let the particles follow one specific Proton.Vector2D
         *
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Attraction
         *
         * @todo add description for 'force' and 'radius'
         *
         * @param {Proton.Vector2D} targetPosition the attraction point coordinates
         * @param {Number} [force=100]
         * @param {Number} [radius=1000]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {Proton.Vector2D} targetPosition
         * @property {Number} radius
         * @property {Number} force
         * @property {Number} radiusSq
         * @property {Proton.Vector2D} attractionForce
         * @property {Number} lengthSq
         * @property {String} name The Behaviour name
         */
        function Attraction(targetPosition, force, radius, life, easing) {
                Attraction._super_.call(this, life, easing);

                this.targetPosition = Proton.Util.initValue(targetPosition, new Proton.Vector2D());
                this.radius = Proton.Util.initValue(radius, 1000);
                this.force = Proton.Util.initValue(this.normalizeValue(force), 100);
                this.radiusSq = this.radius * this.radius;
                this.attractionForce = new Proton.Vector2D();
                this.lengthSq = 0;
                this.name = "Attraction";
        }

        Proton.Util.inherits(Attraction, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Attraction
         * @instance
         *
         * @todo add description for 'force' and 'radius'
         *
         * @param {Proton.Vector2D} targetPosition the attraction point coordinates
         * @param {Number} [force=100]
         * @param {Number} [radius=1000]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Attraction.prototype.reset = function (targetPosition, force, radius, life, easing) {
                this.targetPosition = Proton.Util.initValue(targetPosition, new Proton.Vector2D());
                this.radius = Proton.Util.initValue(radius, 1000);
                this.force = Proton.Util.initValue(this.normalizeValue(force), 100);
                this.radiusSq = this.radius * this.radius;
                this.attractionForce = new Proton.Vector2D();
                this.lengthSq = 0;
                if (life) Attraction._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @memberof Proton#Proton.Attraction
         * @method applyBehaviour
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
         */
        Attraction.prototype.applyBehaviour = function (particle, time, index) {
                Attraction._super_.prototype.applyBehaviour.call(this, particle, time, index);
                this.attractionForce.copy(this.targetPosition);
                this.attractionForce.sub(particle.p);
                this.lengthSq = this.attractionForce.lengthSq();
                if (this.lengthSq > 0.000004 && this.lengthSq < this.radiusSq) {
                        this.attractionForce.normalize();
                        this.attractionForce.multiplyScalar(1 - this.lengthSq / this.radiusSq);
                        this.attractionForce.multiplyScalar(this.force);
                        particle.a.add(this.attractionForce);
                }
        };

        Proton.Attraction = Attraction;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.RandomDrift
         *
         * @param {Number} driftX 				X value of the new Proton.Vector2D
         * @param {Number} driftY  				Y value of the new Proton.Vector2D
         * @param {Number} delay 				How much delay the drift should have
         * @param {Number} [life=Infinity] 		this behaviour's life
         * @param {String} [easing=easeLinear] 	this behaviour's easing
         *
         * @property {Number} time The time of the drift
         * @property {String} name The Behaviour name
         */
        function RandomDrift(driftX, driftY, delay, life, easing) {
                RandomDrift._super_.call(this, life, easing);
                this.reset(driftX, driftY, delay);
                this.time = 0;
                this.name = "RandomDrift";
        }

        Proton.Util.inherits(RandomDrift, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.RandomDrift
         * @instance
         *
         * @param {Number} driftX 				X value of the new Proton.Vector2D
         * @param {Number} driftY  				Y value of the new Proton.Vector2D
         * @param {Number} delay 				How much delay the drift should have
         * @param {Number} [life=Infinity] 		this behaviour's life
         * @param {String} [easing=easeLinear] 	this behaviour's easing
         */
        RandomDrift.prototype.reset = function (driftX, driftY, delay, life, easing) {
                this.panFoce = new Proton.Vector2D(driftX, driftY);
                this.panFoce = this.normalizeForce(this.panFoce);
                this.delay = delay;
                if (life) RandomDrift._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.RandomDrift
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
         */
        RandomDrift.prototype.applyBehaviour = function (particle, time, index) {
                RandomDrift._super_.prototype.applyBehaviour.call(this, particle, time, index);
                this.time += time;
                if (this.time >= this.delay) {

                        particle.a.addXY(Proton.MathUtils.randomAToB(-this.panFoce.x, this.panFoce.x), Proton.MathUtils.randomAToB(-this.panFoce.y, this.panFoce.y));
                        this.time = 0;
                };
        };

        Proton.RandomDrift = RandomDrift;

        /**
         * The oppisite of Proton.Attraction - turns the force
         *
         * @memberof! Proton#
         * @augments Proton#Proton.Attraction
         * @constructor
         * @alias Proton.Repulsion
         *
         * @todo add description for 'force' and 'radius'
         *
         * @param {Proton.Vector2D} targetPosition the attraction point coordinates
         * @param {Number} [force=100]
         * @param {Number} [radius=1000]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {Number} force
         * @property {String} name The Behaviour name
         */
        function Repulsion(targetPosition, force, radius, life, easing) {
                Repulsion._super_.call(this, targetPosition, force, radius, life, easing);
                this.force *= -1;
                this.name = "Repulsion";
        }

        Proton.Util.inherits(Repulsion, Proton.Attraction);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Repulsion
         * @instance
         *
         * @todo add description for 'force' and 'radius'
         *
         * @param {Proton.Vector2D} targetPosition the attraction point coordinates
         * @param {Number} [force=100]
         * @param {Number} [radius=1000]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Repulsion.prototype.reset = function (targetPosition, force, radius, life, easing) {
                Repulsion._super_.prototype.reset.call(this, targetPosition, force, radius, life, easing);
                this.force *= -1;
        };

        Proton.Repulsion = Repulsion;

        /**
         * @memberof! Proton#
         * @augments Proton#Proton.Force
         * @constructor
         * @alias Proton.Gravity
         *
         * @param {Number} g 							Gravity
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Gravity(g, life, easing) {
                Gravity._super_.call(this, 0, g, life, easing);
                this.name = "Gravity";
        }

        Proton.Util.inherits(Gravity, Proton.Force);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Gravity
         * @instance
         *
         * @param {Number} g 							Gravity
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Gravity.prototype.reset = function (g, life, easing) {
                Gravity._super_.prototype.reset.call(this, 0, g, life, easing);
        };

        Proton.Gravity = Gravity;
        Proton.G = Gravity;

        //can use Collision(emitter,true,function(){}) or Collision();

        /**
         * The callback after collision
         *
         * @callback Callback
         *
         * @param {Proton.Particle} particle
         * @param {Proton.Paritcle} otherParticle
         */
        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Collision
         *
         * @todo add description to mass
         *
         * @param {Proton.Emitter} 	[emitter=null] 		the attraction point coordinates
         * @param {Boolean} 		[mass=true]			
         * @param {Callback}	 	[callback=null]		the callback after the collision
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Collision(emitter, mass, callback, life, easing) {
                Collision._super_.call(this, life, easing);
                this.reset(emitter, mass, callback);
                this.name = "Collision";
        }

        Proton.Util.inherits(Collision, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @memberof Proton#Proton.Collision
         * @method reset
         * @instance
         *
         * @todo add description to mass
         *
         * @param {Proton.Emitter} 	[emitter=null] 		the attraction point coordinates
         * @param {Boolean} 		[mass=true]			
         * @param {Callback}	 	[callback=null]		the callback after the collision
         * @param {Number} 			[life=Infinity] 	this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Collision.prototype.reset = function (emitter, mass, callback, life, easing) {
                this.emitter = Proton.Util.initValue(emitter, null);
                this.mass = Proton.Util.initValue(mass, true);
                this.callback = Proton.Util.initValue(callback, null);
                this.collisionPool = [];
                this.delta = new Proton.Vector2D();
                if (life) Collision._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @memberof Proton#Proton.Collision
         * @method applyBehaviour
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
         */
        Collision.prototype.applyBehaviour = function (particle, time, index) {
                var newPool = this.emitter ? this.emitter.particles.slice(index) : this.pool.slice(index);
                var otherParticle;
                var lengthSq;
                var overlap;
                var averageMass1, averageMass2;
                var length = newPool.length;
                for (var i = 0; i < length; i++) {
                        otherParticle = newPool[i];
                        if (otherParticle !== particle) {
                                this.delta.copy(otherParticle.p);
                                this.delta.sub(particle.p);
                                lengthSq = this.delta.lengthSq();
                                distance = particle.radius + otherParticle.radius;

                                if (lengthSq <= distance * distance) {
                                        overlap = distance - Math.sqrt(lengthSq);
                                        overlap += 0.5;
                                        totalMass = particle.mass + otherParticle.mass;
                                        averageMass1 = this.mass ? otherParticle.mass / totalMass : 0.5;
                                        averageMass2 = this.mass ? particle.mass / totalMass : 0.5;
                                        particle.p.add(this.delta.clone().normalize().multiplyScalar(overlap * -averageMass1));
                                        otherParticle.p.add(this.delta.normalize().multiplyScalar(overlap * averageMass2));
                                        if (this.callback) this.callback(particle, otherParticle);
                                }
                        }
                }
        };

        Proton.Collision = Collision;

        /**
         * Defines what happens if the particles come to the end of the specified zone
         *
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.CrossZone
         *
         * @param {Proton.Zone} zone 						can be any Proton.Zone - e.g. Proton.RectZone()
         * @param {String} 		[crossType=dead] 			what happens if the particles pass the zone - allowed strings: dead | bound | cross
         * @param {Number} 		[life=Infinity] 			this behaviour's life
         * @param {String} 		[easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function CrossZone(zone, crossType, life, easing) {
                CrossZone._super_.call(this, life, easing);
                this.reset(zone, crossType);
                this.name = "CrossZone";
        }

        Proton.Util.inherits(CrossZone, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.CrossZone
         * @instance
         *
         * @param {Proton.Zone} zone 				can be any Proton.Zone - e.g. Proton.RectZone()
        	 * @param {String} 		[crossType=dead] 	what happens if the particles pass the zone - allowed strings: dead | bound | cross
         * @param {Number} 		[life=Infinity] 	this behaviour's life
         * @param {String} 		[easing=easeLinear]	this behaviour's easing
         */
        CrossZone.prototype.reset = function (zone, crossType, life, easing) {
                this.zone = zone;
                this.zone.crossType = Proton.Util.initValue(crossType, "dead");
                if (life) CrossZone._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.CrossZone
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        CrossZone.prototype.applyBehaviour = function (particle, time, index) {
                CrossZone._super_.prototype.applyBehaviour.call(this, particle, time, index);
                this.zone.crossing(particle);
        };

        Proton.CrossZone = CrossZone;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Alpha
         *
         * @todo add description for 'a' and 'b'
         *
         * @param {Number} a
         * @param {String} b
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Alpha(a, b, life, easing) {
                Alpha._super_.call(this, life, easing);
                this.reset(a, b);
                this.name = "Alpha";
        }

        Proton.Util.inherits(Alpha, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Alpha
         * @instance
         *
         * @todo add description for 'a' and 'b'
         *
         * @param {Number} a
         * @param {String} b
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Alpha.prototype.reset = function (a, b, life, easing) {
                if (b == null || b == undefined) this.same = true;else this.same = false;
                this.a = Proton.Util.setSpanValue(Proton.Util.initValue(a, 1));
                this.b = Proton.Util.setSpanValue(b);
                if (life) Alpha._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Sets the new alpha value of the particle
         *
         * @method initialize
         * @memberof Proton#Proton.Alpha
         * @instance
         *
         * @param {Proton.Particle} particle A single Proton generated particle
         */
        Alpha.prototype.initialize = function (particle) {
                particle.transform.alphaA = this.a.getValue();
                if (this.same) particle.transform.alphaB = particle.transform.alphaA;else particle.transform.alphaB = this.b.getValue();
        };

        /**
         * @method applyBehaviour
         * @memberof Proton#Proton.Alpha
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
        	 */
        Alpha.prototype.applyBehaviour = function (particle, time, index) {
                Alpha._super_.prototype.applyBehaviour.call(this, particle, time, index);
                particle.alpha = particle.transform.alphaB + (particle.transform.alphaA - particle.transform.alphaB) * this.energy;
                if (particle.alpha < 0.001) particle.alpha = 0;
        };

        Proton.Alpha = Alpha;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Scale
         *
         * @todo add description for 'a' and 'b'
         *
         * @param {Number} a
         * @param {String} b
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Scale(a, b, life, easing) {
                Scale._super_.call(this, life, easing);
                this.reset(a, b);
                this.name = "Scale";
        }

        Proton.Util.inherits(Scale, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Scale
         * @instance
         *
         * @param {Number} a
         * @param {String} b
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Scale.prototype.reset = function (a, b, life, easing) {
                if (b == null || b == undefined) this.same = true;else this.same = false;
                this.a = Proton.Util.setSpanValue(Proton.Util.initValue(a, 1));
                this.b = Proton.Util.setSpanValue(b);
                if (life) Scale._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Initialize the behaviour's parameters for all particles
         *
         * @method initialize
         * @memberof Proton#Proton.Scale
         * @instance
         *
         * @param {Proton.Particle} particle
         */
        Scale.prototype.initialize = function (particle) {
                particle.transform.scaleA = this.a.getValue();
                particle.transform.oldRadius = particle.radius;
                if (this.same) particle.transform.scaleB = particle.transform.scaleA;else particle.transform.scaleB = this.b.getValue();
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.Scale
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
         */
        Scale.prototype.applyBehaviour = function (particle, time, index) {
                Scale._super_.prototype.applyBehaviour.call(this, particle, time, index);
                particle.scale = particle.transform.scaleB + (particle.transform.scaleA - particle.transform.scaleB) * this.energy;
                if (particle.scale < 0.0001) particle.scale = 0;
                particle.radius = particle.transform.oldRadius * particle.scale;
        };

        Proton.Scale = Scale;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Rotate
         *
         * @todo add description for 'a', 'b' and 'style'
         *
         * @param {Number} a
         * @param {String} b
         * @param {String} [style=to]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Rotate(a, b, style, life, easing) {
                Rotate._super_.call(this, life, easing);
                this.reset(a, b, style);
                this.name = "Rotate";
        }

        Proton.Util.inherits(Rotate, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Rotate
         * @instance
         *
         * @todo add description for 'a', 'b' and 'style'
         *
         * @param {Number} a
         * @param {String} b
         * @param {String} [style=to]
         * @param {Number} [life=Infinity] 				this behaviour's life
         * @param {String} [easing=Proton.easeLinear] 	this behaviour's easing
         */
        Rotate.prototype.reset = function (a, b, style, life, easing) {
                if (b == null || b == undefined) this.same = true;else this.same = false;
                this.a = Proton.Util.setSpanValue(Proton.Util.initValue(a, "Velocity"));
                this.b = Proton.Util.setSpanValue(Proton.Util.initValue(b, 0));
                this.style = Proton.Util.initValue(style, 'to');
                if (life) Rotate._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Initialize the behaviour's parameters for all particles
         *
         * @method initialize
         * @memberof Proton#Proton.Rotate
         * @instance
         *
         * @param {Proton.Particle} particle
         */
        Rotate.prototype.initialize = function (particle) {
                particle.rotation = this.a.getValue();
                particle.transform.rotationA = this.a.getValue();
                if (!this.same) particle.transform.rotationB = this.b.getValue();
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.Rotate
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} 			time the integrate time 1/ms
         * @param {Int} 			index the particle index
         */
        Rotate.prototype.applyBehaviour = function (particle, time, index) {
                Rotate._super_.prototype.applyBehaviour.call(this, particle, time, index);
                if (!this.same) {
                        if (this.style == 'to' || this.style == 'TO' || this.style == '_') {
                                particle.rotation += particle.transform.rotationB + (particle.transform.rotationA - particle.transform.rotationB) * this.energy;
                        } else {
                                particle.rotation += particle.transform.rotationB;
                        }
                } else if (this.a.a == "V" || this.a.a == "Velocity" || this.a.a == "v") {
                        //beta...
                        particle.rotation = particle.getDirection();
                }
        };

        Proton.Rotate = Rotate;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.Color
         *
         * @param {Proton.ColorSpan | String} color1 the string should be a hex e.g. #000000 for black
         * @param {Proton.ColorSpan | String} color2 the string should be a hex e.g. #000000 for black
         * @param {Number} [life=Infinity] 	this behaviour's life
         * @param {String} [easing=easeLinear] 	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function Color(color1, color2, life, easing) {
                Color._super_.call(this, life, easing);
                this.reset(color1, color2);
                this.name = "Color";
        }

        Proton.Util.inherits(Color, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.Color
         * @instance
         *
         * @param {Proton.ColorSpan | String} color1 the string should be a hex e.g. #000000 for black
         * @param {Proton.ColorSpan | String} color2 the string should be a hex e.g. #000000 for black
         * @param {Number} [life=Infinity] 	this behaviour's life
         * @param {String} [easing=easeLinear] 	this behaviour's easing
         */
        Color.prototype.reset = function (color1, color2, life, easing) {
                this.color1 = this.setSpanValue(color1);
                this.color2 = this.setSpanValue(color2);
                if (life) Color._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * Initialize the behaviour's parameters for all particles
         *
         * @method initialize
         * @memberof Proton#Proton.Color
         * @instance
         *
         * @param {Proton.Particle} particle
         */
        Color.prototype.initialize = function (particle) {
                particle.color = this.color1.getValue();
                particle.transform.beginRGB = Proton.Util.hexToRGB(particle.color);

                if (this.color2) particle.transform.endRGB = Proton.Util.hexToRGB(this.color2.getValue());
        };

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.Color
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        Color.prototype.applyBehaviour = function (particle, time, index) {
                if (this.color2) {
                        Color._super_.prototype.applyBehaviour.call(this, particle, time, index);
                        particle.transform.rgb.r = particle.transform.endRGB.r + (particle.transform.beginRGB.r - particle.transform.endRGB.r) * this.energy;
                        particle.transform.rgb.g = particle.transform.endRGB.g + (particle.transform.beginRGB.g - particle.transform.endRGB.g) * this.energy;
                        particle.transform.rgb.b = particle.transform.endRGB.b + (particle.transform.beginRGB.b - particle.transform.endRGB.b) * this.energy;
                        particle.transform.rgb.r = parseInt(particle.transform.rgb.r, 10);
                        particle.transform.rgb.g = parseInt(particle.transform.rgb.g, 10);
                        particle.transform.rgb.b = parseInt(particle.transform.rgb.b, 10);
                } else {
                        particle.transform.rgb.r = particle.transform.beginRGB.r;
                        particle.transform.rgb.g = particle.transform.beginRGB.g;
                        particle.transform.rgb.b = particle.transform.beginRGB.b;
                }
        };

        /**
         * Make sure that the color is an instance of Proton.ColorSpan, if not it makes a new instance
         *
         * @method setSpanValue
         * @memberof Proton#Proton.Color
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        Color.prototype.setSpanValue = function (color) {
                if (color) {
                        if (color instanceof Proton.ColorSpan) {
                                return color;
                        } else {
                                return new Proton.ColorSpan(color);
                        }
                } else {
                        return null;
                }
        };

        Proton.Color = Color;

        /**
         * @memberof! Proton#
         * @augments Proton.Behaviour
         * @constructor
         * @alias Proton.GravityWell
         *
         * @param {Proton.Vector2D} [centerPoint=new Proton.Vector2D] The point in the center
         * @param {Number} [force=100]					The force	
         * @param {Number} [life=Infinity]				this behaviour's life
         * @param {String} [easing=Proton.easeLinear]	this behaviour's easing
         *
         * @property {String} name The Behaviour name
         */
        function GravityWell(centerPoint, force, life, easing) {
                GravityWell._super_.call(this, life, easing);
                this.distanceVec = new Proton.Vector2D();
                this.centerPoint = Proton.Util.initValue(centerPoint, new Proton.Vector2D());
                this.force = Proton.Util.initValue(this.normalizeValue(force), 100);
                this.name = "GravityWell";
        }

        Proton.Util.inherits(GravityWell, Proton.Behaviour);

        /**
         * Reset this behaviour's parameters
         *
         * @method reset
         * @memberof Proton#Proton.GravityWell
         * @instance
         *
         * @param {Proton.Vector2D} [centerPoint=new Proton.Vector2D] The point in the center
         * @param {Number} [force=100]					The force	
         * @param {Number} [life=Infinity]				this behaviour's life
         * @param {String} [easing=Proton.easeLinear]	this behaviour's easing
         */
        GravityWell.prototype.reset = function (centerPoint, force, life, easing) {
                this.distanceVec = new Proton.Vector2D();
                this.centerPoint = Proton.Util.initValue(centerPoint, new Proton.Vector2D());
                this.force = Proton.Util.initValue(this.normalizeValue(force), 100);
                if (life) GravityWell._super_.prototype.reset.call(this, life, easing);
        };

        /**
         * @inheritdoc
         */
        GravityWell.prototype.initialize = function (particle) {};

        /**
         * Apply this behaviour for all particles every time
         *
         * @method applyBehaviour
         * @memberof Proton#Proton.GravityWell
         * @instance
         *
         * @param {Proton.Particle} particle
         * @param {Number} the integrate time 1/ms
         * @param {Int} the particle index
         */
        GravityWell.prototype.applyBehaviour = function (particle, time, index) {
                this.distanceVec.set(this.centerPoint.x - particle.p.x, this.centerPoint.y - particle.p.y);
                var distanceSq = this.distanceVec.lengthSq();
                if (distanceSq != 0) {
                        var distance = this.distanceVec.length();
                        var factor = this.force * time / (distanceSq * distance);
                        particle.v.x += factor * this.distanceVec.x;
                        particle.v.y += factor * this.distanceVec.y;
                }
        };

        Proton.GravityWell = GravityWell;

        Emitter.ID = 0;
        /**
         * You can use this emit particles.
         *
         * It will dispatch follow events:
         * Proton.PARTICLE_CREATED
         * Proton.PARTICLE_UPDATA
         * Proton.PARTICLE_DEAD
         *
         * @class Proton.Emitter
         * @constructor
         * @param {Object} pObj the parameters object;
         * for example {damping:0.01,bindEmitter:false}
         */
        function Emitter(pObj) {
                this.initializes = [];
                this.particles = [];
                this.behaviours = [];
                this.emitTime = 0;
                this.emitTotalTimes = -1;
                /**
                 * The friction coefficient for all particle emit by This;
                 * @property damping
                 * @type {Number}
                 * @default 0.006
                 */
                this.damping = .006;
                /**
                 * If bindEmitter the particles can bind this emitter's property;
                 * @property bindEmitter
                 * @type {Boolean}
                 * @default true
                 */
                this.bindEmitter = true;
                /**
                 * The number of particles per second emit (a [particle]/b [s]);
                 * @property rate
                 * @type {Proton.Rate}
                 * @default Proton.Rate(1, .1)
                 */
                this.rate = new Proton.Rate(1, .1);
                Emitter._super_.call(this, pObj);
                /**
                 * The emitter's id;
                 * @property id
                 * @type {string}
                 */
                this.id = 'emitter_' + Emitter.ID++;
        };

        Proton.Util.inherits(Emitter, Proton.Particle);
        Proton.EventDispatcher.initialize(Emitter.prototype);
        /**
         * start emit particle
         * @method emit
         * @param {Number} emitTime begin emit time;
         * @param {String} life the life of this emitter
         */
        Emitter.prototype.emit = function (emitTime, life) {

                this.emitTime = 0;

                this.emitTotalTimes = Proton.Util.initValue(emitTime, Infinity);

                if (life == true || life == 'life' || life == 'destroy') {
                        if (emitTime == 'once') this.life = 1;else this.life = this.emitTotalTimes;
                } else if (!isNaN(life)) {
                        this.life = life;
                }

                this.rate.init();
        };

        /**
         * stop emiting
         * @method stopEmit
         */
        Emitter.prototype.stopEmit = function () {
                this.emitTotalTimes = -1;
                this.emitTime = 0;
        };

        /**
         * remove current all particles
         * @method removeAllParticles
         */
        Emitter.prototype.removeAllParticles = function () {
                for (var i = 0; i < this.particles.length; i++) {
                        this.particles[i].dead = true;
                }
        };
        /**
         * create single particle;
         * 
         * can use emit({x:10},new Gravity(10),{'particleUpdate',fun}) or emit([{x:10},new Initialize],new Gravity(10),{'particleUpdate',fun})
         * @method removeAllParticles
         */
        Emitter.prototype.createParticle = function (initialize, behaviour) {
                var particle = Proton.pool.get(Proton.Particle);
                this.setupParticle(particle, initialize, behaviour);
                this.dispatchEvent(Proton.PARTICLE_CREATED, particle);

                return particle;
        };
        /**
         * add initialize to this emitter
         * @method addSelfInitialize
         */
        Emitter.prototype.addSelfInitialize = function (pObj) {
                if (pObj['init']) {
                        pObj.init(this);
                } else {
                        this.initAll();
                }
        };
        /**
         * add the Initialize to particles;
         * 
         * you can use initializes array:for example emitter.addInitialize(initialize1,initialize2,initialize3);
         * @method addInitialize
         * @param {Proton.Initialize} initialize like this new Proton.Radius(1, 12)
         */
        Emitter.prototype.addInitialize = function () {
                var length = arguments.length,
                    i;
                for (i = 0; i < length; i++) {
                        this.initializes.push(arguments[i]);
                }
        };
        /**
         * remove the Initialize
         * @method removeInitialize
         * @param {Proton.Initialize} initialize a initialize
         */
        Emitter.prototype.removeInitialize = function (initializer) {
                var index = this.initializes.indexOf(initializer);
                if (index > -1) {
                        this.initializes.splice(index, 1);
                }
        };

        /**
         * remove all Initializes
         * @method removeInitializers
         */
        Emitter.prototype.removeInitializers = function () {
                Proton.Util.destroyArray(this.initializes);
        };
        /**
         * add the Behaviour to particles;
         * 
         * you can use Behaviours array:emitter.addBehaviour(Behaviour1,Behaviour2,Behaviour3);
         * @method addBehaviour
         * @param {Proton.Behaviour} behaviour like this new Proton.Color('random')
         */
        Emitter.prototype.addBehaviour = function () {
                var length = arguments.length,
                    i;
                for (i = 0; i < length; i++) {
                        this.behaviours.push(arguments[i]);
                        if (arguments[i].hasOwnProperty("parents")) arguments[i].parents.push(this);
                }
        };
        /**
         * remove the Behaviour
         * @method removeBehaviour
         * @param {Proton.Behaviour} behaviour a behaviour
         */
        Emitter.prototype.removeBehaviour = function (behaviour) {
                var index = this.behaviours.indexOf(behaviour);
                if (index > -1) this.behaviours.splice(index, 1);
        };
        /**
         * remove all behaviours
         * @method removeAllBehaviours
         */
        Emitter.prototype.removeAllBehaviours = function () {
                Proton.Util.destroyArray(this.behaviours);
        };

        Emitter.prototype.integrate = function (time) {
                var damping = 1 - this.damping;
                Proton.integrator.integrate(this, time, damping);
                var length = this.particles.length,
                    i;
                for (i = 0; i < length; i++) {
                        var particle = this.particles[i];
                        particle.update(time, i);
                        Proton.integrator.integrate(particle, time, damping);

                        this.dispatchEvent(Proton.PARTICLE_UPDATE, particle);
                }
        };

        Emitter.prototype.emitting = function (time) {
                if (this.emitTotalTimes == 'once') {
                        var length = this.rate.getValue(99999),
                            i;
                        for (i = 0; i < length; i++) {
                                this.createParticle();
                        }

                        this.emitTotalTimes = 'none';
                } else if (!isNaN(this.emitTotalTimes)) {
                        this.emitTime += time;
                        if (this.emitTime < this.emitTotalTimes) {
                                var length = this.rate.getValue(time),
                                    i;
                                for (i = 0; i < length; i++) {
                                        this.createParticle();
                                }
                        }
                }
        };

        Emitter.prototype.update = function (time) {
                this.age += time;
                if (this.age >= this.life || this.dead) {
                        this.destroy();
                }

                this.emitting(time);
                this.integrate(time);
                var particle;
                var length = this.particles.length,
                    k;
                for (k = length - 1; k >= 0; k--) {
                        particle = this.particles[k];
                        if (particle.dead) {
                                this.dispatchEvent(Proton.PARTICLE_DEAD, particle);

                                Proton.pool.set(particle);
                                this.particles.splice(k, 1);
                        }
                }
        };

        Emitter.prototype.setupParticle = function (particle, initialize, behaviour) {
                var initializes = this.initializes;
                var behaviours = this.behaviours;

                if (initialize) {
                        if (initialize instanceof Array) initializes = initialize;else initializes = [initialize];
                }

                if (behaviour) {
                        if (behaviour instanceof Array) behaviours = behaviour;else behaviours = [behaviour];
                }

                particle.reset();
                Proton.InitializeUtil.initialize(this, particle, initializes);
                particle.addBehaviours(behaviours);
                particle.parent = this;
                this.particles.push(particle);
        };

        /**
         * Destory this Emitter
         * @method destroy
         */
        Emitter.prototype.destroy = function () {
                this.dead = true;
                this.emitTotalTimes = -1;
                if (this.particles.length == 0) {
                        this.removeInitializers();
                        this.removeAllBehaviours();

                        if (this.parent) this.parent.removeEmitter(this);
                }
        };

        Proton.Emitter = Emitter;

        /**
         * The BehaviourEmitter class inherits from Proton.Emitter
         *
         * use the BehaviourEmitter you can add behaviours to self;
         * @class Proton.BehaviourEmitter
         * @constructor
         * @param {Object} pObj the parameters object;
         */
        function BehaviourEmitter(pObj) {
                this.selfBehaviours = [];
                BehaviourEmitter._super_.call(this, pObj);
        };

        Proton.Util.inherits(BehaviourEmitter, Proton.Emitter);
        /**
         * add the Behaviour to emitter;
         *
         * you can use Behaviours array:emitter.addSelfBehaviour(Behaviour1,Behaviour2,Behaviour3);
         * @method addSelfBehaviour
         * @param {Proton.Behaviour} behaviour like this new Proton.Color('random')
         */
        BehaviourEmitter.prototype.addSelfBehaviour = function () {
                var length = arguments.length,
                    i;
                for (i = 0; i < length; i++) {
                        this.selfBehaviours.push(arguments[i]);
                }
        };
        /**
         * remove the Behaviour for self
         * @method removeSelfBehaviour
         * @param {Proton.Behaviour} behaviour a behaviour
         */
        BehaviourEmitter.prototype.removeSelfBehaviour = function (behaviour) {
                var index = this.selfBehaviours.indexOf(behaviour);
                if (index > -1) this.selfBehaviours.splice(index, 1);
        };

        BehaviourEmitter.prototype.update = function (time) {
                BehaviourEmitter._super_.prototype.update.call(this, time);

                if (!this.sleep) {
                        var length = this.selfBehaviours.length,
                            i;
                        for (i = 0; i < length; i++) {
                                this.selfBehaviours[i].applyBehaviour(this, time, i);
                        }
                }
        };

        Proton.BehaviourEmitter = BehaviourEmitter;

        /**
         * The FollowEmitter class inherits from Proton.Emitter
         *
         * use the FollowEmitter will emit particle when mousemoving
         *
         * @class Proton.FollowEmitter
         * @constructor
         * @param {Element} mouseTarget mouseevent's target;
         * @param {Number} ease the easing of following speed;
         * @default 0.7
         * @param {Object} pObj the parameters object;
         */
        function FollowEmitter(mouseTarget, ease, pObj) {
                this.mouseTarget = Proton.Util.initValue(mouseTarget, window);
                this.ease = Proton.Util.initValue(ease, .7);
                this._allowEmitting = false;
                this.initEventHandler();
                FollowEmitter._super_.call(this, pObj);
        };

        Proton.Util.inherits(FollowEmitter, Proton.Emitter);
        FollowEmitter.prototype.initEventHandler = function () {
                var self = this;
                this.mousemoveHandler = function (e) {
                        self.mousemove.call(self, e);
                };

                this.mousedownHandler = function (e) {
                        self.mousedown.call(self, e);
                };

                this.mouseupHandler = function (e) {
                        self.mouseup.call(self, e);
                };
                this.mouseTarget.addEventListener('mousemove', this.mousemoveHandler, false);
        };
        /**
         * start emit particle
         * @method emit
         */
        FollowEmitter.prototype.emit = function () {
                this._allowEmitting = true;
        };
        /**
         * stop emiting
         * @method stopEmit
         */
        FollowEmitter.prototype.stopEmit = function () {
                this._allowEmitting = false;
        };

        FollowEmitter.prototype.mousemove = function (e) {
                if (e.layerX || e.layerX == 0) {
                        this.p.x += (e.layerX - this.p.x) * this.ease;
                        this.p.y += (e.layerY - this.p.y) * this.ease;
                } else if (e.offsetX || e.offsetX == 0) {
                        this.p.x += (e.offsetX - this.p.x) * this.ease;
                        this.p.y += (e.offsetY - this.p.y) * this.ease;
                }
                if (this._allowEmitting) FollowEmitter._super_.prototype.emit.call(this, 'once');
        };
        /**
         * Destory this Emitter
         * @method destroy
         */
        FollowEmitter.prototype.destroy = function () {
                FollowEmitter._super_.prototype.destroy.call(this);
                this.mouseTarget.removeEventListener('mousemove', this.mousemoveHandler, false);
        };

        Proton.FollowEmitter = FollowEmitter;

        var ease = ease || {
                easeLinear: function easeLinear(value) {
                        return value;
                },

                easeInQuad: function easeInQuad(value) {
                        return Math.pow(value, 2);
                },

                easeOutQuad: function easeOutQuad(value) {
                        return -(Math.pow(value - 1, 2) - 1);
                },

                easeInOutQuad: function easeInOutQuad(value) {
                        if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 2);
                        return -0.5 * ((value -= 2) * value - 2);
                },

                easeInCubic: function easeInCubic(value) {
                        return Math.pow(value, 3);
                },

                easeOutCubic: function easeOutCubic(value) {
                        return Math.pow(value - 1, 3) + 1;
                },

                easeInOutCubic: function easeInOutCubic(value) {
                        if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 3);
                        return 0.5 * (Math.pow(value - 2, 3) + 2);
                },

                easeInQuart: function easeInQuart(value) {
                        return Math.pow(value, 4);
                },

                easeOutQuart: function easeOutQuart(value) {
                        return -(Math.pow(value - 1, 4) - 1);
                },

                easeInOutQuart: function easeInOutQuart(value) {
                        if ((value /= 0.5) < 1) return 0.5 * Math.pow(value, 4);
                        return -0.5 * ((value -= 2) * Math.pow(value, 3) - 2);
                },

                easeInSine: function easeInSine(value) {
                        return -Math.cos(value * (Math.PI / 2)) + 1;
                },

                easeOutSine: function easeOutSine(value) {
                        return Math.sin(value * (Math.PI / 2));
                },

                easeInOutSine: function easeInOutSine(value) {
                        return -0.5 * (Math.cos(Math.PI * value) - 1);
                },

                easeInExpo: function easeInExpo(value) {
                        return value === 0 ? 0 : Math.pow(2, 10 * (value - 1));
                },

                easeOutExpo: function easeOutExpo(value) {
                        return value === 1 ? 1 : -Math.pow(2, -10 * value) + 1;
                },

                easeInOutExpo: function easeInOutExpo(value) {
                        if (value === 0) return 0;
                        if (value === 1) return 1;
                        if ((value /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (value - 1));
                        return 0.5 * (-Math.pow(2, -10 * --value) + 2);
                },

                easeInCirc: function easeInCirc(value) {
                        return -(Math.sqrt(1 - value * value) - 1);
                },

                easeOutCirc: function easeOutCirc(value) {
                        return Math.sqrt(1 - Math.pow(value - 1, 2));
                },

                easeInOutCirc: function easeInOutCirc(value) {
                        if ((value /= 0.5) < 1) return -0.5 * (Math.sqrt(1 - value * value) - 1);
                        return 0.5 * (Math.sqrt(1 - (value -= 2) * value) + 1);
                },

                easeInBack: function easeInBack(value) {
                        var s = 1.70158;
                        return value * value * ((s + 1) * value - s);
                },

                easeOutBack: function easeOutBack(value) {
                        var s = 1.70158;
                        return (value = value - 1) * value * ((s + 1) * value + s) + 1;
                },

                easeInOutBack: function easeInOutBack(value) {
                        var s = 1.70158;
                        if ((value /= 0.5) < 1) return 0.5 * (value * value * (((s *= 1.525) + 1) * value - s));
                        return 0.5 * ((value -= 2) * value * (((s *= 1.525) + 1) * value + s) + 2);
                },

                setEasingByName: function setEasingByName(easeName) {
                        if (!!ease[easeName]) return ease[easeName];else return ease.easeLinear;
                }
        };

        for (var key in ease) {
                if (key != "setEasingByName") Proton[key] = ease[key];
        }

        Proton.ease = ease;

        //the own renderer

        function Renderer(type, proton, element) {
                ///element dom/div canvas/canvas easeljs/cantainer(or stage)
                this.element = element;
                this.type = Proton.Util.initValue(type, 'canvas');
                this.proton = proton;
                this.renderer = this.getRenderer();
        }

        Renderer.prototype = {
                start: function start() {
                        this.addEventHandler();
                        this.renderer.start();
                },
                stop: function stop() {
                        this.renderer.stop();
                },

                resize: function resize(width, height) {
                        this.renderer.resize(width, height);
                },
                setStroke: function setStroke(color, thinkness) {
                        if (this.renderer.hasOwnProperty('stroke')) this.renderer.setStroke(color, thinkness);else alert('Sorry this renderer do not suppest stroke method!');
                },
                createImageData: function createImageData(data) {
                        if (this.renderer instanceof Proton.PixelRender) this.renderer.createImageData(data);
                },
                setMaxRadius: function setMaxRadius(radius) {
                        if (this.renderer instanceof Proton.WebGLRender) this.renderer.setMaxRadius(radius);
                },
                blendEquation: function blendEquation(A) {
                        if (this.renderer instanceof Proton.WebGLRender) this.renderer.blendEquation(A);
                },
                blendFunc: function blendFunc(A, B) {
                        if (this.renderer instanceof Proton.WebGLRender) this.renderer.blendFunc(A, B);
                },
                setType: function setType(type) {
                        this.type = type;
                        this.renderer = this.getRenderer();
                },
                getRenderer: function getRenderer() {
                        switch (this.type) {
                                case 'pixi':
                                        return new Proton.PixiRender(this.proton, this.element);
                                        break;

                                case 'dom':
                                        return new Proton.DomRender(this.proton, this.element);
                                        break;

                                case 'canvas':
                                        return new Proton.CanvasRender(this.proton, this.element);
                                        break;

                                case 'webgl':
                                        return new Proton.WebGLRender(this.proton, this.element);
                                        break;

                                case 'easel':
                                        return new Proton.EaselRender(this.proton, this.element);
                                        break;

                                case 'easeljs':
                                        return new Proton.EaselRender(this.proton, this.element);
                                        break;

                                case 'pixel':
                                        return new Proton.PixelRender(this.proton, this.element);
                                        break;

                                default:
                                        return new Proton.BaseRender(this.proton, this.element);
                        }
                },
                render: function render(callback) {
                        this.renderer.render(callback);
                },
                addEventHandler: function addEventHandler() {
                        if (this.onProtonUpdate) this.renderer.onProtonUpdate = this.onProtonUpdate;

                        if (this.onParticleCreated) this.renderer.onParticleCreated = this.onParticleCreated;

                        if (this.onParticleUpdate) this.renderer.onParticleUpdate = this.onParticleUpdate;

                        if (this.onParticleDead) this.renderer.onParticleDead = this.onParticleDead;
                }
        };

        Proton.Renderer = Renderer;

        function BaseRender(proton, element, stroke) {
                this.proton = proton;
                this.element = element;
                this.stroke = stroke;
                this.pool = new Proton.Pool();
        }

        BaseRender.prototype = {
                start: function start() {
                        var self = this;
                        this.proton.addEventListener(Proton.PROTON_UPDATE, function () {
                                self.onProtonUpdate.call(self);
                        });

                        this.proton.addEventListener(Proton.PROTON_UPDATE_AFTER, function () {
                                self.onProtonUpdateAfter.call(self);
                        });

                        this.proton.addEventListener(Proton.EMITTER_ADDED, function (emitter) {
                                self.onEmitterAdded.call(self, emitter);
                        });

                        this.proton.addEventListener(Proton.EMITTER_REMOVED, function (emitter) {
                                self.onEmitterRemoved.call(self, emitter);
                        });

                        var length = this.proton.emitters.length,
                            i;
                        for (i = 0; i < length; i++) {
                                var emitter = this.proton.emitters[i];
                                this.addEmitterListener(emitter);
                        }
                },

                resize: function resize(width, height) {},

                addEmitterListener: function addEmitterListener(emitter) {
                        var self = this;
                        emitter.addEventListener(Proton.PARTICLE_CREATED, function (particle) {
                                self.onParticleCreated.call(self, particle);
                        });
                        emitter.addEventListener(Proton.PARTICLE_UPDATE, function (particle) {
                                self.onParticleUpdate.call(self, particle);
                        });
                        emitter.addEventListener(Proton.PARTICLE_DEAD, function (particle) {
                                self.onParticleDead.call(self, particle);
                        });
                },

                stop: function stop() {
                        var length = this.proton.emitters.length,
                            i;
                        this.proton.removeAllEventListeners();
                        for (i = 0; i < length; i++) {
                                var emitter = this.proton.emitters[i];
                                emitter.removeAllEventListeners();
                        }
                },

                onEmitterAdded: function onEmitterAdded(emitter) {
                        this.addEmitterListener(emitter);
                },

                onEmitterRemoved: function onEmitterRemoved(emitter) {
                        emitter.removeAllEventListeners();
                },

                onProtonUpdate: function onProtonUpdate() {},

                onProtonUpdateAfter: function onProtonUpdateAfter() {},

                onParticleCreated: function onParticleCreated(particle) {},

                onParticleUpdate: function onParticleUpdate(particle) {},

                onParticleDead: function onParticleDead(particle) {}
        };

        Proton.BaseRender = BaseRender;

        function DomRender(proton, element) {
                DomRender._super_.call(this, proton, element);
                this.stroke = null;
        }

        Proton.Util.inherits(DomRender, Proton.BaseRender);

        DomRender.prototype.start = function () {
                DomRender._super_.prototype.start.call(this);
        };

        DomRender.prototype.setStroke = function (color, thinkness) {
                color = Proton.Util.initValue(color, '#000000');
                thinkness = Proton.Util.initValue(thinkness, 1);
                this.stroke = {
                        color: color,
                        thinkness: thinkness
                };
        };

        DomRender.prototype.onProtonUpdate = function () {};

        DomRender.prototype.onParticleCreated = function (particle) {
                if (particle.target) {
                        var self = this;
                        Proton.Util.getImage(particle.target, particle, false, function (particle) {
                                self.setImgInDIV.call(self, particle);
                        });
                } else {
                        particle.transform.canvas = Proton.DomUtil.createCanvas(particle.id + '_canvas', particle.radius + 1, particle.radius + 1, 'absolute');
                        particle.transform.bakOldRadius = particle.radius;

                        if (this.stroke) {
                                particle.transform.canvas.width = 2 * particle.radius + this.stroke.thinkness * 2;
                                particle.transform.canvas.height = 2 * particle.radius + this.stroke.thinkness * 2;
                        } else {
                                particle.transform.canvas.width = 2 * particle.radius + 1;
                                particle.transform.canvas.height = 2 * particle.radius + 1;
                        }

                        particle.transform.context = particle.transform.canvas.getContext('2d');
                        particle.transform.context.fillStyle = particle.color;
                        particle.transform.context.beginPath();
                        particle.transform.context.arc(particle.radius, particle.radius, particle.radius, 0, Math.PI * 2, true);

                        if (this.stroke) {
                                particle.transform.context.strokeStyle = this.stroke.color;
                                particle.transform.context.lineWidth = this.stroke.thinkness;
                                particle.transform.context.stroke();
                        }

                        particle.transform.context.closePath();
                        particle.transform.context.fill();
                        this.element.appendChild(particle.transform.canvas);
                }
        };

        DomRender.prototype.onParticleUpdate = function (particle) {
                if (particle.target) {
                        if (particle.target instanceof Image) {
                                particle.transform.canvas.style.opacity = particle.alpha;
                                Proton.DomUtil.transformDom(particle.transform.canvas, particle.p.x - particle.target.width / 2, particle.p.y - particle.target.height / 2, particle.scale, particle.rotation);
                        }
                } else {
                        particle.transform.canvas.style.opacity = particle.alpha;
                        if (particle.transform['oldRadius']) Proton.DomUtil.transformDom(particle.transform.canvas, particle.p.x - particle.transform.oldRadius, particle.p.y - particle.transform.oldRadius, particle.scale, particle.rotation);else Proton.DomUtil.transformDom(particle.transform.canvas, particle.p.x - particle.transform.bakOldRadius, particle.p.y - particle.transform.bakOldRadius, particle.scale, particle.rotation);
                }
        };

        DomRender.prototype.onParticleDead = function (particle) {
                if (particle.transform.canvas) this.element.removeChild(particle.transform.canvas);
        };

        DomRender.prototype.setImgInDIV = function (particle) {
                particle.transform.canvas = Proton.DomUtil.createCanvas(particle.id + '_canvas', particle.target.width + 1, particle.target.height + 1, 'absolute', particle.p.x - particle.radius, particle.p.y - particle.radius);
                particle.transform.context = particle.transform.canvas.getContext('2d');
                particle.transform.context.drawImage(particle.target, 0, 0, particle.target.width, particle.target.height);
                this.element.appendChild(particle.transform.canvas);
        };

        Proton.DomRender = DomRender;

        function EaselRender(proton, element, stroke) {
                EaselRender._super_.call(this, proton, element);
                this.stroke = stroke;
        }

        Proton.Util.inherits(EaselRender, Proton.BaseRender);
        EaselRender.prototype.resize = function (width, height) {};
        EaselRender.prototype.start = function () {
                EaselRender._super_.prototype.start.call(this);
        };

        EaselRender.prototype.onProtonUpdate = function () {};

        EaselRender.prototype.onParticleCreated = function (particle) {
                if (particle.target) {
                        particle.target = this.pool.get(particle.target);
                        if (!particle.target.parent) {
                                if (!!particle.target['image']) {
                                        particle.target.regX = particle.target.image.width / 2;
                                        particle.target.regY = particle.target.image.height / 2;
                                }
                                this.element.addChild(particle.target);
                        }
                } else {
                        var graphics = this.pool.get(createjs.Graphics);
                        if (this.stroke) {
                                if (this.stroke == true) {
                                        graphics.beginStroke('#000000');
                                } else if (this.stroke instanceof String) {
                                        graphics.beginStroke(this.stroke);
                                }
                        }

                        graphics.beginFill(particle.color).drawCircle(0, 0, particle.radius);
                        var shape = new createjs.Shape(graphics);
                        particle.target = shape;
                        this.element.addChild(particle.target);
                }
        };

        EaselRender.prototype.onParticleUpdate = function (particle) {
                if (particle.target) {
                        particle.target.x = particle.p.x;
                        particle.target.y = particle.p.y;
                        particle.target.alpha = particle.alpha;
                        particle.target.scaleX = particle.target.scaleY = particle.scale;
                        particle.target.rotation = particle.rotation;
                }
        };

        EaselRender.prototype.onParticleDead = function (particle) {
                if (particle.target) {
                        particle.target.parent && particle.target.parent.removeChild(particle.target);
                        this.pool.set(particle.target);
                        particle.target = null;
                }
        };

        Proton.EaselRender = EaselRender;

        function CanvasRender(proton, element) {
                CanvasRender._super_.call(this, proton, element);
                this.stroke = null;
                this.context = this.element.getContext("2d");
                this.bufferCache = {};
        }

        Proton.Util.inherits(CanvasRender, Proton.BaseRender);
        CanvasRender.prototype.resize = function (width, height) {
                this.element.width = width;
                this.element.height = height;
        };
        CanvasRender.prototype.start = function () {
                CanvasRender._super_.prototype.start.call(this);
        };

        CanvasRender.prototype.setStroke = function (color, thinkness) {
                color = Proton.Util.initValue(color, '#000000');
                thinkness = Proton.Util.initValue(thinkness, 1);
                this.stroke = {
                        color: color,
                        thinkness: thinkness
                };
        };

        CanvasRender.prototype.onProtonUpdate = function () {
                //this.context.clearRect(0, 0, this.element.width, this.element.height);
        };

        CanvasRender.prototype.onParticleCreated = function (particle) {
                if (particle.target) Proton.Util.getImage(particle.target, particle, false);else particle.color = particle.color ? particle.color : '#ff0000';
        };

        CanvasRender.prototype.onParticleUpdate = function (particle) {
                if (particle.target) {
                        if (particle.target instanceof Image) {
                                var w = particle.target.width * particle.scale | 0;
                                var h = particle.target.height * particle.scale | 0;
                                var x = particle.p.x - w / 2;
                                var y = particle.p.y - h / 2;

                                if (!!particle.color) {
                                        if (!particle.transform["buffer"]) particle.transform.buffer = this.getBuffer(particle.target);
                                        var bufferContext = particle.transform.buffer.getContext('2d');
                                        bufferContext.clearRect(0, 0, particle.transform.buffer.width, particle.transform.buffer.height);
                                        bufferContext.globalAlpha = particle.alpha;
                                        bufferContext.drawImage(particle.target, 0, 0);
                                        bufferContext.globalCompositeOperation = "source-atop";
                                        bufferContext.fillStyle = Proton.Util.rgbToHex(particle.transform.rgb);
                                        bufferContext.fillRect(0, 0, particle.transform.buffer.width, particle.transform.buffer.height);
                                        bufferContext.globalCompositeOperation = "source-over";
                                        bufferContext.globalAlpha = 1;
                                        this.context.drawImage(particle.transform.buffer, 0, 0, particle.transform.buffer.width, particle.transform.buffer.height, x, y, w, h);
                                } else {
                                        this.context.save();
                                        this.context.globalAlpha = particle.alpha;
                                        this.context.translate(particle.p.x, particle.p.y);
                                        this.context.rotate(Proton.MathUtils.degreeTransform(particle.rotation));
                                        this.context.translate(-particle.p.x, -particle.p.y);
                                        this.context.drawImage(particle.target, 0, 0, particle.target.width, particle.target.height, x, y, w, h);
                                        this.context.globalAlpha = 1;
                                        this.context.restore();
                                }
                        }
                } else {
                        if (particle.transform["rgb"]) this.context.fillStyle = 'rgba(' + particle.transform.rgb.r + ',' + particle.transform.rgb.g + ',' + particle.transform.rgb.b + ',' + particle.alpha + ')';else this.context.fillStyle = particle.color;
                        this.context.beginPath();
                        this.context.arc(particle.p.x, particle.p.y, particle.radius, 0, Math.PI * 2, true);
                        if (this.stroke) {
                                this.context.strokeStyle = this.stroke.color;
                                this.context.lineWidth = this.stroke.thinkness;
                                this.context.stroke();
                        }

                        this.context.closePath();
                        this.context.fill();
                }
        };

        CanvasRender.prototype.onParticleDead = function (particle) {};

        CanvasRender.prototype.getBuffer = function (image) {
                if (image instanceof Image) {
                        var size = image.width + '_' + image.height;
                        var canvas = this.bufferCache[size];
                        if (!canvas) {
                                canvas = document.createElement('canvas');
                                canvas.width = image.width;
                                canvas.height = image.height;
                                this.bufferCache[size] = canvas;
                        }
                        return canvas;
                }
        };

        Proton.CanvasRender = CanvasRender;

        function PixelRender(proton, element, rectangle) {
                PixelRender._super_.call(this, proton, element);
                this.context = this.element.getContext('2d');
                this.imageData = null;
                this.rectangle = null;
                this.rectangle = rectangle;
                this.createImageData(rectangle);
        }

        Proton.Util.inherits(PixelRender, Proton.BaseRender);
        PixelRender.prototype.resize = function (width, height) {
                this.element.width = width;
                this.element.height = height;
        };
        PixelRender.prototype.createImageData = function (rectangle) {
                if (!rectangle) this.rectangle = new Proton.Rectangle(0, 0, this.element.width, this.element.height);else this.rectangle = rectangle;
                this.imageData = this.context.createImageData(this.rectangle.width, this.rectangle.height);
                this.context.putImageData(this.imageData, this.rectangle.x, this.rectangle.y);
        };

        PixelRender.prototype.start = function () {
                PixelRender._super_.prototype.start.call(this);
        };

        PixelRender.prototype.onProtonUpdate = function () {
                //this.context.clearRect(this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height);
                this.imageData = this.context.getImageData(this.rectangle.x, this.rectangle.y, this.rectangle.width, this.rectangle.height);
        };

        PixelRender.prototype.onProtonUpdateAfter = function () {
                this.context.putImageData(this.imageData, this.rectangle.x, this.rectangle.y);
        };

        PixelRender.prototype.onParticleCreated = function (particle) {};

        PixelRender.prototype.onParticleUpdate = function (particle) {
                if (this.imageData) {
                        this.setPixel(this.imageData, Math.floor(particle.p.x - this.rectangle.x), Math.floor(particle.p.y - this.rectangle.y), particle);
                }
        };

        PixelRender.prototype.setPixel = function (imagedata, x, y, particle) {
                var rgb = particle.transform.rgb;
                if (x < 0 || x > this.element.width || y < 0 || y > this.elementwidth) return;

                var i = ((y >> 0) * imagedata.width + (x >> 0)) * 4;

                imagedata.data[i] = rgb.r;
                imagedata.data[i + 1] = rgb.g;
                imagedata.data[i + 2] = rgb.b;
                imagedata.data[i + 3] = particle.alpha * 255;
        };

        PixelRender.prototype.onParticleDead = function (particle) {};

        Proton.PixelRender = PixelRender;

        function WebGLRender(proton, element) {
                WebGLRender._super_.call(this, proton, element);
                this.gl = this.element.getContext('experimental-webgl', {
                        antialias: true,
                        stencil: false,
                        depth: false
                });
                if (!this.gl) alert("Sorry your browser do not suppest WebGL!");
                this.initVar();
                this.setMaxRadius();
                this.initShaders();
                this.initBuffers();
                this.gl.blendEquation(this.gl.FUNC_ADD);
                this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
                this.gl.enable(this.gl.BLEND);
        }

        Proton.Util.inherits(WebGLRender, Proton.BaseRender);
        WebGLRender.prototype.resize = function (width, height) {
                this.umat[4] = -2;
                this.umat[7] = 1;
                this.smat[0] = 1 / width;
                this.smat[4] = 1 / height;
                this.mstack.set(this.umat, 0);
                this.mstack.set(this.smat, 1);
                this.gl.viewport(0, 0, width, height);
                this.element.width = width;
                this.element.height = height;
        };

        WebGLRender.prototype.setMaxRadius = function (radius) {
                this.circleCanvasURL = this.createCircle(radius);
        };

        WebGLRender.prototype.getVertexShader = function () {
                var vsSource = ["uniform vec2 viewport;", "attribute vec2 aVertexPosition;", "attribute vec2 aTextureCoord;", "uniform mat3 tMat;", "varying vec2 vTextureCoord;", "varying float alpha;", "void main() {", "vec3 v = tMat * vec3(aVertexPosition, 1.0);", "gl_Position = vec4(v.x, v.y, 0, 1);", "vTextureCoord = aTextureCoord;", "alpha = tMat[0][2];", "}"].join("\n");
                return vsSource;
        };

        WebGLRender.prototype.getFragmentShader = function () {
                var fsSource = ["precision mediump float;", "varying vec2 vTextureCoord;", "varying float alpha;", "uniform sampler2D uSampler;", "uniform vec4 color;", "uniform bool useTexture;", "uniform vec3 uColor;", "void main() {", "vec4 textureColor = texture2D(uSampler, vTextureCoord);", "gl_FragColor = textureColor * vec4(uColor, 1.0);", "gl_FragColor.w *= alpha;", "}"].join("\n");
                return fsSource;
        };

        WebGLRender.prototype.initVar = function () {
                this.mstack = new Proton.MStack();
                this.umat = Proton.Mat3.create([2, 0, 1, 0, -2, 0, -1, 1, 1]);
                this.smat = Proton.Mat3.create([1 / 100, 0, 1, 0, 1 / 100, 0, 0, 0, 1]);
                this.texturebuffers = {};
        };

        WebGLRender.prototype.start = function () {
                WebGLRender._super_.prototype.start.call(this);
                this.resize(this.element.width, this.element.height);
        };

        WebGLRender.prototype.blendEquation = function (A) {
                this.gl.blendEquation(this.gl[A]);
        };

        WebGLRender.prototype.blendFunc = function (A, B) {
                this.gl.blendFunc(this.gl[A], this.gl[B]);
        };

        WebGLRender.prototype.getShader = function (gl, str, fs) {
                var shader;
                if (fs) shader = gl.createShader(gl.FRAGMENT_SHADER);else shader = gl.createShader(gl.VERTEX_SHADER);
                gl.shaderSource(shader, str);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                        alert(gl.getShaderInfoLog(shader));
                        return null;
                }
                return shader;
        };

        WebGLRender.prototype.initShaders = function () {
                var fragmentShader = this.getShader(this.gl, this.getFragmentShader(), true);
                var vertexShader = this.getShader(this.gl, this.getVertexShader(), false);

                this.sprogram = this.gl.createProgram();
                this.gl.attachShader(this.sprogram, vertexShader);
                this.gl.attachShader(this.sprogram, fragmentShader);
                this.gl.linkProgram(this.sprogram);
                if (!this.gl.getProgramParameter(this.sprogram, this.gl.LINK_STATUS)) alert("Could not initialise shaders");

                this.gl.useProgram(this.sprogram);
                this.sprogram.vpa = this.gl.getAttribLocation(this.sprogram, "aVertexPosition");
                this.sprogram.tca = this.gl.getAttribLocation(this.sprogram, "aTextureCoord");
                this.gl.enableVertexAttribArray(this.sprogram.tca);
                this.gl.enableVertexAttribArray(this.sprogram.vpa);

                this.sprogram.tMatUniform = this.gl.getUniformLocation(this.sprogram, "tMat");
                this.sprogram.samplerUniform = this.gl.getUniformLocation(this.sprogram, "uSampler");
                this.sprogram.useTex = this.gl.getUniformLocation(this.sprogram, "useTexture");
                this.sprogram.color = this.gl.getUniformLocation(this.sprogram, "uColor");
                this.gl.uniform1i(this.sprogram.useTex, 1);
        };

        WebGLRender.prototype.initBuffers = function () {
                this.unitIBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.unitIBuffer);
                var vs = [0, 3, 1, 0, 2, 3];
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(vs), this.gl.STATIC_DRAW);

                var ids = [];
                for (var i = 0; i < 100; i++) {
                        ids.push(i);
                }idx = new Uint16Array(ids);
                this.unitI33 = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.unitI33);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, idx, this.gl.STATIC_DRAW);

                ids = [];
                for (i = 0; i < 100; i++) {
                        ids.push(i, i + 1, i + 2);
                }idx = new Uint16Array(ids);
                this.stripBuffer = this.gl.createBuffer();
                this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.stripBuffer);
                this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, idx, this.gl.STATIC_DRAW);
        };

        WebGLRender.prototype.createCircle = function (raidus) {
                this.circleCanvasRadius = Proton.WebGLUtil.nhpot(Proton.Util.initValue(raidus, 32));
                var canvas = Proton.DomUtil.createCanvas('circle_canvas', this.circleCanvasRadius * 2, this.circleCanvasRadius * 2);
                var context = canvas.getContext('2d');
                context.beginPath();
                context.arc(this.circleCanvasRadius, this.circleCanvasRadius, this.circleCanvasRadius, 0, Math.PI * 2, true);
                context.closePath();
                context.fillStyle = '#FFF';
                context.fill();
                return canvas.toDataURL();
        };

        WebGLRender.prototype.setImgInCanvas = function (particle) {
                var _w = particle.target.width;
                var _h = particle.target.height;
                var _width = Proton.WebGLUtil.nhpot(particle.target.width);
                var _height = Proton.WebGLUtil.nhpot(particle.target.height);
                var _scaleX = particle.target.width / _width;
                var _scaleY = particle.target.height / _height;

                if (!this.texturebuffers[particle.transform.src]) this.texturebuffers[particle.transform.src] = [this.gl.createTexture(), this.gl.createBuffer(), this.gl.createBuffer()];
                particle.transform.texture = this.texturebuffers[particle.transform.src][0];
                particle.transform.vcBuffer = this.texturebuffers[particle.transform.src][1];
                particle.transform.tcBuffer = this.texturebuffers[particle.transform.src][2];
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particle.transform.tcBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, _scaleX, 0.0, 0.0, _scaleY, _scaleY, _scaleY]), this.gl.STATIC_DRAW);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particle.transform.vcBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0.0, 0.0, _w, 0.0, 0.0, _h, _w, _h]), this.gl.STATIC_DRAW);

                var context = particle.transform.canvas.getContext('2d');
                var data = context.getImageData(0, 0, _width, _height);

                this.gl.bindTexture(this.gl.TEXTURE_2D, particle.transform.texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, data);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
                this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
                particle.transform.textureLoaded = true;
                particle.transform.textureWidth = _w;
                particle.transform.textureHeight = _h;
        };

        WebGLRender.prototype.setStroke = function (color, thinkness) {};

        WebGLRender.prototype.onProtonUpdate = function () {
                //this.gl.clearColor(0, 0, 0, 1);
                //this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        };

        WebGLRender.prototype.onParticleCreated = function (particle) {
                var self = this;
                particle.transform.textureLoaded = false;
                particle.transform.tmat = Proton.Mat3.create();
                particle.transform.tmat[8] = 1;
                particle.transform.imat = Proton.Mat3.create();
                particle.transform.imat[8] = 1;
                if (particle.target) {
                        Proton.Util.getImage(particle.target, particle, true, function (particle) {
                                self.setImgInCanvas.call(self, particle);
                                particle.transform.oldScale = 1;
                        });
                } else {
                        Proton.Util.getImage(this.circleCanvasURL, particle, true, function (particle) {
                                self.setImgInCanvas.call(self, particle);
                                particle.transform.oldScale = particle.radius / self.circleCanvasRadius;
                        });
                }
        };

        WebGLRender.prototype.onParticleUpdate = function (particle) {
                if (particle.transform.textureLoaded) {
                        this.updateMatrix(particle);
                        this.gl.uniform3f(this.sprogram.color, particle.transform.rgb.r / 255, particle.transform.rgb.g / 255, particle.transform.rgb.b / 255);
                        this.gl.uniformMatrix3fv(this.sprogram.tMatUniform, false, this.mstack.top());
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particle.transform.vcBuffer);
                        this.gl.vertexAttribPointer(this.sprogram.vpa, 2, this.gl.FLOAT, false, 0, 0);
                        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, particle.transform.tcBuffer);
                        this.gl.vertexAttribPointer(this.sprogram.tca, 2, this.gl.FLOAT, false, 0, 0);
                        this.gl.bindTexture(this.gl.TEXTURE_2D, particle.transform.texture);
                        this.gl.uniform1i(this.sprogram.samplerUniform, 0);
                        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.unitIBuffer);
                        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
                        this.mstack.pop();
                }
        };

        WebGLRender.prototype.onParticleDead = function (particle) {};

        WebGLRender.prototype.updateMatrix = function (particle) {
                var moveOriginMatrix = Proton.WebGLUtil.makeTranslation(-particle.transform.textureWidth / 2, -particle.transform.textureHeight / 2);
                var translationMatrix = Proton.WebGLUtil.makeTranslation(particle.p.x, particle.p.y);
                var angel = particle.rotation * (Math.PI / 180);
                var rotationMatrix = Proton.WebGLUtil.makeRotation(angel);
                var scale = particle.scale * particle.transform.oldScale;
                var scaleMatrix = Proton.WebGLUtil.makeScale(scale, scale);

                var matrix = Proton.WebGLUtil.matrixMultiply(moveOriginMatrix, scaleMatrix);
                matrix = Proton.WebGLUtil.matrixMultiply(matrix, rotationMatrix);
                matrix = Proton.WebGLUtil.matrixMultiply(matrix, translationMatrix);

                Proton.Mat3.inverse(matrix, particle.transform.imat);
                matrix[2] = particle.alpha;
                this.mstack.push(matrix);
        };

        Proton.WebGLRender = WebGLRender;

        function Zone() {
                this.vector = new Proton.Vector2D(0, 0);
                this.random = 0;
                this.crossType = "dead";
                this.alert = true;
        }

        Zone.prototype = {
                getPosition: function getPosition() {},

                crossing: function crossing(particle) {}
        };

        Proton.Zone = Zone;

        function LineZone(x1, y1, x2, y2, direction) {
                LineZone._super_.call(this);
                if (x2 - x1 >= 0) {
                        this.x1 = x1;
                        this.y1 = y1;
                        this.x2 = x2;
                        this.y2 = y2;
                } else {
                        this.x1 = x2;
                        this.y1 = y2;
                        this.x2 = x1;
                        this.y2 = y1;
                }
                this.dx = this.x2 - this.x1;
                this.dy = this.y2 - this.y1;
                this.minx = Math.min(this.x1, this.x2);
                this.miny = Math.min(this.y1, this.y2);
                this.maxx = Math.max(this.x1, this.x2);
                this.maxy = Math.max(this.y1, this.y2);
                this.dot = this.x2 * this.y1 - this.x1 * this.y2;
                this.xxyy = this.dx * this.dx + this.dy * this.dy;
                this.gradient = this.getGradient();
                this.length = this.getLength();
                this.direction = Proton.Util.initValue(direction, '>');
        }

        Proton.Util.inherits(LineZone, Proton.Zone);
        LineZone.prototype.getPosition = function () {
                this.random = Math.random();
                this.vector.x = this.x1 + this.random * this.length * Math.cos(this.gradient);
                this.vector.y = this.y1 + this.random * this.length * Math.sin(this.gradient);
                return this.vector;
        };

        LineZone.prototype.getDirection = function (x, y) {
                var A = this.dy;
                var B = -this.dx;
                var C = this.dot;
                var D = B == 0 ? 1 : B;
                if ((A * x + B * y + C) * D > 0) return true;else return false;
        };

        LineZone.prototype.getDistance = function (x, y) {
                var A = this.dy;
                var B = -this.dx;
                var C = this.dot;
                var D = A * x + B * y + C;
                return D / Math.sqrt(this.xxyy);
        };

        LineZone.prototype.getSymmetric = function (v) {
                var tha2 = v.getGradient();
                var tha1 = this.getGradient();
                var tha = 2 * (tha1 - tha2);
                var oldx = v.x;
                var oldy = v.y;
                v.x = oldx * Math.cos(tha) - oldy * Math.sin(tha);
                v.y = oldx * Math.sin(tha) + oldy * Math.cos(tha);
                return v;
        };

        LineZone.prototype.getGradient = function () {
                return Math.atan2(this.dy, this.dx);
        };

        LineZone.prototype.getRange = function (particle, fun) {
                var angle = Math.abs(this.getGradient());
                if (angle <= Math.PI / 4) {
                        if (particle.p.x < this.maxx && particle.p.x > this.minx) {
                                fun();
                        }
                } else {
                        if (particle.p.y < this.maxy && particle.p.y > this.miny) {
                                fun();
                        }
                }
        };

        LineZone.prototype.getLength = function () {
                return Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        };

        LineZone.prototype.crossing = function (particle) {
                var self = this;
                if (this.crossType == "dead") {
                        if (this.direction == ">" || this.direction == "R" || this.direction == "right" || this.direction == "down") {
                                this.getRange(particle, function () {
                                        if (self.getDirection(particle.p.x, particle.p.y)) particle.dead = true;
                                });
                        } else {
                                this.getRange(particle, function () {
                                        if (!self.getDirection(particle.p.x, particle.p.y)) particle.dead = true;
                                });
                        }
                } else if (this.crossType == "bound") {
                        this.getRange(particle, function () {
                                if (self.getDistance(particle.p.x, particle.p.y) <= particle.radius) {
                                        if (self.dx == 0) {
                                                particle.v.x *= -1;
                                        } else if (self.dy == 0) {
                                                particle.v.y *= -1;
                                        } else {
                                                self.getSymmetric(particle.v);
                                        }
                                }
                        });
                } else if (this.crossType == "cross") {
                        if (this.alert) {
                                alert('Sorry lineZone does not support cross method');
                                this.alert = false;
                        }
                }
        };

        Proton.LineZone = LineZone;

        function CircleZone(x, y, radius) {
                CircleZone._super_.call(this);
                this.x = x;
                this.y = y;
                this.radius = radius;
                this.angle = 0;
                this.center = {
                        x: this.x,
                        y: this.y
                };
        }

        Proton.Util.inherits(CircleZone, Proton.Zone);
        CircleZone.prototype.getPosition = function () {
                this.random = Math.random();
                this.angle = Math.PI * 2 * Math.random();
                this.vector.x = this.x + this.random * this.radius * Math.cos(this.angle);
                this.vector.y = this.y + this.random * this.radius * Math.sin(this.angle);
                return this.vector;
        };

        CircleZone.prototype.setCenter = function (x, y) {
                this.center.x = x;
                this.center.y = y;
        };

        CircleZone.prototype.crossing = function (particle) {
                var d = particle.p.distanceTo(this.center);
                if (this.crossType == "dead") {
                        if (d - particle.radius > this.radius) particle.dead = true;
                } else if (this.crossType == "bound") {
                        if (d + particle.radius >= this.radius) this.getSymmetric(particle);
                } else if (this.crossType == "cross") {
                        if (this.alert) {
                                alert('Sorry CircleZone does not support cross method');
                                this.alert = false;
                        }
                }
        };

        CircleZone.prototype.getSymmetric = function (particle) {
                var tha2 = particle.v.getGradient();
                var tha1 = this.getGradient(particle);
                var tha = 2 * (tha1 - tha2);
                var oldx = particle.v.x;
                var oldy = particle.v.y;
                particle.v.x = oldx * Math.cos(tha) - oldy * Math.sin(tha);
                particle.v.y = oldx * Math.sin(tha) + oldy * Math.cos(tha);
        };

        CircleZone.prototype.getGradient = function (particle) {
                return -Math.PI / 2 + Math.atan2(particle.p.y - this.center.y, particle.p.x - this.center.x);
        };

        Proton.CircleZone = CircleZone;

        function PointZone(x, y) {
                PointZone._super_.call(this);
                this.x = x;
                this.y = y;
        }

        Proton.Util.inherits(PointZone, Proton.Zone);
        PointZone.prototype.getPosition = function () {
                this.vector.x = this.x;
                this.vector.y = this.y;
                return this.vector;
        };

        PointZone.prototype.crossing = function (particle) {
                if (this.alert) {
                        alert('Sorry PointZone does not support crossing method');
                        this.alert = false;
                }
        };

        Proton.PointZone = PointZone;

        function RectZone(x, y, width, height) {
                RectZone._super_.call(this);
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
        }

        Proton.Util.inherits(RectZone, Proton.Zone);
        RectZone.prototype.getPosition = function () {
                this.vector.x = this.x + Math.random() * this.width;
                this.vector.y = this.y + Math.random() * this.height;
                return this.vector;
        };

        RectZone.prototype.crossing = function (particle) {
                if (this.crossType == "dead") {
                        if (particle.p.x + particle.radius < this.x) particle.dead = true;else if (particle.p.x - particle.radius > this.x + this.width) particle.dead = true;

                        if (particle.p.y + particle.radius < this.y) particle.dead = true;else if (particle.p.y - particle.radius > this.y + this.height) particle.dead = true;
                } else if (this.crossType == "bound") {
                        if (particle.p.x - particle.radius < this.x) {
                                particle.p.x = this.x + particle.radius;
                                particle.v.x *= -1;
                        } else if (particle.p.x + particle.radius > this.x + this.width) {
                                particle.p.x = this.x + this.width - particle.radius;
                                particle.v.x *= -1;
                        }

                        if (particle.p.y - particle.radius < this.y) {
                                particle.p.y = this.y + particle.radius;
                                particle.v.y *= -1;
                        } else if (particle.p.y + particle.radius > this.y + this.height) {
                                particle.p.y = this.y + this.height - particle.radius;
                                particle.v.y *= -1;
                        }
                } else if (this.crossType == "cross") {
                        if (particle.p.x + particle.radius < this.x && particle.v.x <= 0) particle.p.x = this.x + this.width + particle.radius;else if (particle.p.x - particle.radius > this.x + this.width && particle.v.x >= 0) particle.p.x = this.x - particle.radius;

                        if (particle.p.y + particle.radius < this.y && particle.v.y <= 0) particle.p.y = this.y + this.height + particle.radius;else if (particle.p.y - particle.radius > this.y + this.height && particle.v.y >= 0) particle.p.y = this.y - particle.radius;
                }
        };

        Proton.RectZone = RectZone;

        function ImageZone(imageData, x, y, d) {
                ImageZone._super_.call(this);
                this.reset(imageData, x, y, d);
        }

        Proton.Util.inherits(ImageZone, Proton.Zone);
        ImageZone.prototype.reset = function (imageData, x, y, d) {
                this.imageData = imageData;
                this.x = Proton.Util.initValue(x, 0);
                this.y = Proton.Util.initValue(y, 0);
                this.d = Proton.Util.initValue(d, 2);
                this.vectors = [];
                this.setVectors();
        };

        ImageZone.prototype.setVectors = function () {
                var i, j;
                var length1 = this.imageData.width;
                var length2 = this.imageData.height;
                for (i = 0; i < length1; i += this.d) {
                        for (j = 0; j < length2; j += this.d) {
                                var index = ((j >> 0) * length1 + (i >> 0)) * 4;
                                if (this.imageData.data[index + 3] > 0) {
                                        this.vectors.push({
                                                x: i + this.x,
                                                y: j + this.y
                                        });
                                }
                        }
                }
                return this.vector;
        };

        ImageZone.prototype.getBound = function (x, y) {
                var index = ((y >> 0) * this.imageData.width + (x >> 0)) * 4;
                if (this.imageData.data[index + 3] > 0) return true;else return false;
        };

        ImageZone.prototype.getPosition = function () {
                return this.vector.copy(this.vectors[Math.floor(Math.random() * this.vectors.length)]);
        };

        ImageZone.prototype.getColor = function (x, y) {
                x -= this.x;
                y -= this.y;
                var i = ((y >> 0) * this.imageData.width + (x >> 0)) * 4;
                return {
                        r: this.imageData.data[i],
                        g: this.imageData.data[i + 1],
                        b: this.imageData.data[i + 2],
                        a: this.imageData.data[i + 3]
                };
        };

        ImageZone.prototype.crossing = function (particle) {
                if (this.crossType == "dead") {
                        if (this.getBound(particle.p.x - this.x, particle.p.y - this.y)) particle.dead = true;else particle.dead = false;
                } else if (this.crossType == "bound") {
                        if (!this.getBound(particle.p.x - this.x, particle.p.y - this.y)) particle.v.negate();
                }
        };

        Proton.ImageZone = ImageZone;

        var Debug = Debug || {
                addEventListener: function addEventListener(proton, fun) {
                        proton.addEventListener(Proton.PROTON_UPDATE, function () {
                                fun();
                        });
                },

                setStyle: function setStyle(c) {
                        var color = c || '#ff0000';
                        var rgb = Proton.Util.hexToRGB(color);
                        var style = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + 0.5 + ')';

                        return style;
                },

                drawZone: function drawZone(proton, canvas, zone, clear) {
                        var context = canvas.getContext('2d');
                        var style = this.setStyle();

                        this.addEventListener(proton, function () {
                                if (clear)
                                        //	context.clearRect(0, 0, canvas.width, canvas.height);

                                        if (zone instanceof Proton.PointZone) {
                                                context.beginPath();
                                                context.fillStyle = style;
                                                context.arc(zone.x, zone.y, 10, 0, Math.PI * 2, true);
                                                context.fill();
                                                context.closePath();
                                        } else if (zone instanceof Proton.LineZone) {
                                                context.beginPath();
                                                context.strokeStyle = style;
                                                context.moveTo(zone.x1, zone.y1);
                                                context.lineTo(zone.x2, zone.y2);
                                                context.stroke();
                                                context.closePath();
                                        } else if (zone instanceof Proton.RectZone) {
                                                context.beginPath();
                                                context.strokeStyle = style;
                                                context.drawRect(zone.x, zone.y, zone.width, zone.height);
                                                context.stroke();
                                                context.closePath();
                                        } else if (zone instanceof Proton.CircleZone) {
                                                context.beginPath();
                                                context.strokeStyle = style;
                                                context.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2, true);
                                                context.stroke();
                                                context.closePath();
                                        }
                        });
                },

                drawEmitter: function drawEmitter(proton, canvas, emitter, clear) {
                        var context = canvas.getContext('2d');
                        var style = this.setStyle();
                        this.addEventListener(proton, function () {
                                if (clear)
                                        //	context.clearRect(0, 0, canvas.width, canvas.height);

                                        context.beginPath();
                                context.fillStyle = style;
                                context.arc(emitter.p.x, emitter.p.y, 10, 0, Math.PI * 2, true);
                                context.fill();
                                context.closePath();
                        });
                },

                test: {},

                setTest: function setTest(id, value) {
                        this.test[id] = value;
                },

                getTest: function getTest(id) {
                        if (this.test.hasOwnProperty(id)) return this.test[id];else return false;
                }
        };

        Proton.Debug = Debug;

        // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
        // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

        // requestAnimationFrame polyfill by Erik Möller
        // fixes from Paul Irish and Tino Zijdel
        (function () {
                var lastTime = 0;
                var vendors = ['ms', 'moz', 'webkit', 'o'];
                for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                        window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                }

                if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = window.setTimeout(function () {
                                callback(currTime + timeToCall);
                        }, timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                };

                if (!window.cancelAnimationFrame) window.cancelAnimationFrame = function (id) {
                        clearTimeout(id);
                };
        })();

        return Proton;
});; /**
     * @author mrdoob / http://mrdoob.com/
     */

var Stats = function Stats() {

        var mode = 0;

        var container = document.createElement('div');
        container.style.cssText = 'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';
        container.addEventListener('click', function (event) {

                event.preventDefault();
                showPanel(++mode % container.children.length);
        }, false);

        //

        function addPanel(panel) {

                container.appendChild(panel.dom);
                return panel;
        }

        function showPanel(id) {

                for (var i = 0; i < container.children.length; i++) {

                        container.children[i].style.display = i === id ? 'block' : 'none';
                }

                mode = id;
        }

        //

        var beginTime = (performance || Date).now(),
            prevTime = beginTime,
            frames = 0;

        var fpsPanel = addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
        var msPanel = addPanel(new Stats.Panel('MS', '#0f0', '#020'));

        if (self.performance && self.performance.memory) {

                var memPanel = addPanel(new Stats.Panel('MB', '#f08', '#201'));
        }

        showPanel(0);

        return {

                REVISION: 16,

                dom: container,

                addPanel: addPanel,
                showPanel: showPanel,

                begin: function begin() {

                        beginTime = (performance || Date).now();
                },

                end: function end() {

                        frames++;

                        var time = (performance || Date).now();

                        msPanel.update(time - beginTime, 200);

                        if (time >= prevTime + 1000) {

                                fpsPanel.update(frames * 1000 / (time - prevTime), 100);

                                prevTime = time;
                                frames = 0;

                                if (memPanel) {

                                        var memory = performance.memory;
                                        memPanel.update(memory.usedJSHeapSize / 1048576, memory.jsHeapSizeLimit / 1048576);
                                }
                        }

                        return time;
                },

                update: function update() {

                        beginTime = this.end();
                },

                // Backwards Compatibility

                domElement: container,
                setMode: showPanel

        };
};

Stats.Panel = function (name, fg, bg) {

        var min = Infinity,
            max = 0,
            round = Math.round;
        var PR = round(window.devicePixelRatio || 1);

        var WIDTH = 80 * PR,
            HEIGHT = 48 * PR,
            TEXT_X = 3 * PR,
            TEXT_Y = 2 * PR,
            GRAPH_X = 3 * PR,
            GRAPH_Y = 15 * PR,
            GRAPH_WIDTH = 74 * PR,
            GRAPH_HEIGHT = 30 * PR;

        var canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        canvas.style.cssText = 'width:80px;height:48px';

        var context = canvas.getContext('2d');
        context.font = 'bold ' + 9 * PR + 'px Helvetica,Arial,sans-serif';
        context.textBaseline = 'top';

        context.fillStyle = bg;
        context.fillRect(0, 0, WIDTH, HEIGHT);

        context.fillStyle = fg;
        context.fillText(name, TEXT_X, TEXT_Y);
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        context.fillStyle = bg;
        context.globalAlpha = 0.9;
        context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

        return {

                dom: canvas,

                update: function update(value, maxValue) {

                        min = Math.min(min, value);
                        max = Math.max(max, value);

                        context.fillStyle = bg;
                        context.globalAlpha = 1;
                        context.fillRect(0, 0, WIDTH, GRAPH_Y);
                        context.fillStyle = fg;
                        context.fillText(round(value) + ' ' + name + ' (' + round(min) + '-' + round(max) + ')', TEXT_X, TEXT_Y);

                        context.drawImage(canvas, GRAPH_X + PR, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT, GRAPH_X, GRAPH_Y, GRAPH_WIDTH - PR, GRAPH_HEIGHT);

                        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

                        context.fillStyle = bg;
                        context.globalAlpha = 0.9;
                        context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, round((1 - value / maxValue) * GRAPH_HEIGHT));
                }

        };
};
; /**
  * Tween.js - Licensed under the MIT license
  * https://github.com/tweenjs/tween.js
  * ----------------------------------------------
  *
  * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
  * Thank you all, you're awesome!
  */

var TWEEN = TWEEN || function () {

        var _tweens = [];

        return {

                getAll: function getAll() {

                        return _tweens;
                },

                removeAll: function removeAll() {

                        _tweens = [];
                },

                add: function add(tween) {

                        _tweens.push(tween);
                },

                remove: function remove(tween) {

                        var i = _tweens.indexOf(tween);

                        if (i !== -1) {
                                _tweens.splice(i, 1);
                        }
                },

                update: function update(time, preserve) {

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
}();

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

                        if (_valuesStart[property] instanceof Array === false) {
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
                                if (typeof end === 'string') {

                                        if (end.charAt(0) === '+' || end.charAt(0) === '-') {
                                                end = start + parseFloat(end, 10);
                                        } else {
                                                end = parseFloat(end, 10);
                                        }
                                }

                                // Protect against non numeric properties.
                                if (typeof end === 'number') {
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

                                        if (typeof _valuesEnd[property] === 'string') {
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

                None: function None(k) {

                        return k;
                }

        },

        Quadratic: {

                In: function In(k) {

                        return k * k;
                },

                Out: function Out(k) {

                        return k * (2 - k);
                },

                InOut: function InOut(k) {

                        if ((k *= 2) < 1) {
                                return 0.5 * k * k;
                        }

                        return -0.5 * (--k * (k - 2) - 1);
                }

        },

        Cubic: {

                In: function In(k) {

                        return k * k * k;
                },

                Out: function Out(k) {

                        return --k * k * k + 1;
                },

                InOut: function InOut(k) {

                        if ((k *= 2) < 1) {
                                return 0.5 * k * k * k;
                        }

                        return 0.5 * ((k -= 2) * k * k + 2);
                }

        },

        Quartic: {

                In: function In(k) {

                        return k * k * k * k;
                },

                Out: function Out(k) {

                        return 1 - --k * k * k * k;
                },

                InOut: function InOut(k) {

                        if ((k *= 2) < 1) {
                                return 0.5 * k * k * k * k;
                        }

                        return -0.5 * ((k -= 2) * k * k * k - 2);
                }

        },

        Quintic: {

                In: function In(k) {

                        return k * k * k * k * k;
                },

                Out: function Out(k) {

                        return --k * k * k * k * k + 1;
                },

                InOut: function InOut(k) {

                        if ((k *= 2) < 1) {
                                return 0.5 * k * k * k * k * k;
                        }

                        return 0.5 * ((k -= 2) * k * k * k * k + 2);
                }

        },

        Sinusoidal: {

                In: function In(k) {

                        return 1 - Math.cos(k * Math.PI / 2);
                },

                Out: function Out(k) {

                        return Math.sin(k * Math.PI / 2);
                },

                InOut: function InOut(k) {

                        return 0.5 * (1 - Math.cos(Math.PI * k));
                }

        },

        Exponential: {

                In: function In(k) {

                        return k === 0 ? 0 : Math.pow(1024, k - 1);
                },

                Out: function Out(k) {

                        return k === 1 ? 1 : 1 - Math.pow(2, -10 * k);
                },

                InOut: function InOut(k) {

                        if (k === 0) {
                                return 0;
                        }

                        if (k === 1) {
                                return 1;
                        }

                        if ((k *= 2) < 1) {
                                return 0.5 * Math.pow(1024, k - 1);
                        }

                        return 0.5 * (-Math.pow(2, -10 * (k - 1)) + 2);
                }

        },

        Circular: {

                In: function In(k) {

                        return 1 - Math.sqrt(1 - k * k);
                },

                Out: function Out(k) {

                        return Math.sqrt(1 - --k * k);
                },

                InOut: function InOut(k) {

                        if ((k *= 2) < 1) {
                                return -0.5 * (Math.sqrt(1 - k * k) - 1);
                        }

                        return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);
                }

        },

        Elastic: {

                In: function In(k) {

                        if (k === 0) {
                                return 0;
                        }

                        if (k === 1) {
                                return 1;
                        }

                        return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
                },

                Out: function Out(k) {

                        if (k === 0) {
                                return 0;
                        }

                        if (k === 1) {
                                return 1;
                        }

                        return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;
                },

                InOut: function InOut(k) {

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

                In: function In(k) {

                        var s = 1.70158;

                        return k * k * ((s + 1) * k - s);
                },

                Out: function Out(k) {

                        var s = 1.70158;

                        return --k * k * ((s + 1) * k + s) + 1;
                },

                InOut: function InOut(k) {

                        var s = 1.70158 * 1.525;

                        if ((k *= 2) < 1) {
                                return 0.5 * (k * k * ((s + 1) * k - s));
                        }

                        return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);
                }

        },

        Bounce: {

                In: function In(k) {

                        return 1 - TWEEN.Easing.Bounce.Out(1 - k);
                },

                Out: function Out(k) {

                        if (k < 1 / 2.75) {
                                return 7.5625 * k * k;
                        } else if (k < 2 / 2.75) {
                                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
                        } else if (k < 2.5 / 2.75) {
                                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
                        } else {
                                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
                        }
                },

                InOut: function InOut(k) {

                        if (k < 0.5) {
                                return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
                        }

                        return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;
                }

        }

};

TWEEN.Interpolation = {

        Linear: function Linear(v, k) {

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

        Bezier: function Bezier(v, k) {

                var b = 0;
                var n = v.length - 1;
                var pw = Math.pow;
                var bn = TWEEN.Interpolation.Utils.Bernstein;

                for (var i = 0; i <= n; i++) {
                        b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
                }

                return b;
        },

        CatmullRom: function CatmullRom(v, k) {

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

                Linear: function Linear(p0, p1, t) {

                        return (p1 - p0) * t + p0;
                },

                Bernstein: function Bernstein(n, i) {

                        var fc = TWEEN.Interpolation.Utils.Factorial;

                        return fc(n) / fc(i) / fc(n - i);
                },

                Factorial: function () {

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
                }(),

                CatmullRom: function CatmullRom(p0, p1, p2, p3, t) {

                        var v0 = (p2 - p0) * 0.5;
                        var v1 = (p3 - p1) * 0.5;
                        var t2 = t * t;
                        var t3 = t * t2;

                        return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;
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
        } else if (typeof module !== 'undefined' && (typeof exports === 'undefined' ? 'undefined' : _typeof(exports)) === 'object') {

                // Node.js
                module.exports = TWEEN;
        } else if (root !== undefined) {

                // Global variable
                root.TWEEN = TWEEN;
        }
})(undefined);
//# sourceMappingURL=Gamestack.js.map
