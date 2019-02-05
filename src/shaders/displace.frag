precision highp float;

uniform sampler2D u_disp;
uniform sampler2D u_mask;
uniform sampler2D u_texture;
uniform vec2 u_mouse;
uniform bool u_hasMask;

varying vec2 vUv;


void main() {

    vec4 disp = texture2D(u_disp, vUv);
    float depth = disp.r;
    vec2 frag = vUv;

    frag.x += 0.03 * (depth-0.5) * u_mouse.x;
    frag.y += -0.03 * (depth-0.5) * u_mouse.y;

    float a = 1.;

    if(u_hasMask) {
        vec4 hidden = texture2D(u_mask, frag);
        a = dot(hidden.rgb, vec3(1.) );
        a = clamp(a, 0.,1.);
    }

    vec4 pixel = texture2D(u_texture, frag);

    pixel.a = a;
    pixel.rgb *= a;

    gl_FragColor = pixel;
}