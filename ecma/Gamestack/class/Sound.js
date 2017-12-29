


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
