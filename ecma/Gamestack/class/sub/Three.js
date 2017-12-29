
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
    constructor(args={})
    {
        super(args); //init as Sprite()

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
}