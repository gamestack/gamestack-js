function makeArray(obj) {

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

})();