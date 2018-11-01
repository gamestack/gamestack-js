
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
