attribute vec2 a_position;
attribute vec2 a_texcoord;

varying vec2 vUv;
varying vec4 v_color;

uniform float u_ratio;
uniform vec2 u_res;

vec2 uv_cover(float canvasRatio, float imageRatio, vec2 uv){
    vec2 temp = uv;

    if(canvasRatio > imageRatio){
        temp.y *= imageRatio/canvasRatio;
        temp.y += (1. - imageRatio/canvasRatio ) * 0.5 ;
    }else{
        temp.x /= imageRatio/canvasRatio;
        temp.x += ( 1. - canvasRatio/imageRatio ) * 0.5;
    }

    return temp;
}

vec2 uv_scale( vec2 uv, float val){
    vec2 temp = uv;

    temp /= val;
    temp += ( val - 1. ) / val * 0.5;

    return temp;
}

void main() {
    gl_Position = vec4(vec3(a_position, 1).xy, 0, 1);

    vUv = a_texcoord;

    float canvasRatio = u_res.x / u_res.y;
    float imageRatio = u_ratio;

    vUv = uv_cover(canvasRatio, imageRatio, vUv);

    vUv = uv_scale(vUv, 1.1);

    v_color = gl_Position * 0.5 + 0.5;
}