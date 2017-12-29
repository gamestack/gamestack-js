




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
