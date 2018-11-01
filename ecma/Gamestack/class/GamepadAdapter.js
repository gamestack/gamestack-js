

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
