import  FraGL  from 'fragl';
import { af as AF } from '@gladeye/af';

import frag from './shaders/displace.frag';
import vert from './shaders/displace.vert'

class Displace{
    mouse = { x:0, y:0 };
    animMouse = { x:0, y:0 };
    timeout = null;
    layers = [];
    running = true;

    constructor({
        canvas,
        imageSize,
    }){
        const args = {
            clearColor:[1.,1.,1.,0.],
            imageLoadColor:[0,0,0,255],
        }

        this.fragl = new FraGL(args)
        this.ratio = imageSize.width / imageSize.height;
        this.canvas = canvas;

        window.addEventListener('mousemove', this.mousemove)
        window.addEventListener('resize', this.resize)

        this.resize();

        this.af = AF();
        this.af.addWrite( this.update )
    }

    stop(){
        if(this.running) this.af.removeWrite(this.update);
        this.running = false;
    }

    start(){
        if(!this.running) this.af.addWrite(this.update);
        this.running = true;
    }

    addLayer = ({
        displace,
        mask = false,
        main
    }) => {

        const mainTex = this.fragl.textureFromImage(main);
        const dispTex = this.fragl.textureFromImage(displace);
        const maskTex = mask ? this.fragl.textureFromImage(mask) : mainTex;

        const layer = this.fragl.createRenderLayer(main, {
            uniforms:{
                u_res:{
                    value: [ window.innerWidth, window.innerHeight ]
                },
                u_mouse:{
                    value:[ 0, 0 ]
                },
                u_texture:{
                    value: mainTex
                },
                u_disp:{
                    value: dispTex
                },
                u_mask:{
                    value: maskTex
                },
                u_hasMask:{
                    value: mask ? true : false
                },
                u_ratio:{
                    value:this.ratio
                }
            },
            vertex:vert,
            fragment:frag
        })

        this.layers.push(layer)
    }

    update = () => {
        const scope = this;
        this.animMouse.x += (this.mouse.x-this.animMouse.x)*0.1;
        this.animMouse.y += (this.mouse.y-this.animMouse.y)*0.1;

        this.fragl.clear();

        this.layers.forEach(function(layer){
            layer.uniforms['u_mouse'].value[0] = scope.animMouse.x;
            layer.uniforms['u_mouse'].value[1] = scope.animMouse.y;

            layer.render();
        })
    }

    resize = () => {
        const scope = this;

        clearTimeout(this.timeout);

        this.timeout = setTimeout( function(){
            const rect = scope.canvas.getBoundingClientRect();
            const { width: w, height: h } = rect;

            scope.fragl.setSize(w,h)
            scope.layers.forEach(function(layer){
                layer.uniforms['u_res'].value = [w, h]
                layer.render();
            })
        },100)
    }

    mousemove = e => {
        const { clientX: x, clientY: y } = e
        const { innerWidth: w ,innerHeight: h } = window;

        this.mouse.x = ( x / w * 2 - 1 );
        this.mouse.y = ( y / h * 2 - 1 ) * -1;
    }
}



export default Displace;