uniform float uTime;

varying vec2 vUv;
varying vec3 pos;

void main() {
    vec3 mainColor = vec3(0.21568627450980393, 0.3843137254901961, 1);
    vec2 uvScaled = vUv.xy * 2.0 - 1.0;
    uvScaled.y += mod(uTime * 0.5, 1.0);
    //gl_FragColor = vec4(pos, 1.0);
    //float yPos = sin(pos.y);
    //vec3 y = vec3(sin(pos.y));

    vec3 y = clamp(vec3(uvScaled.y), 0.3, 1.0);
    vec3 y2 = y * mainColor;
    gl_FragColor = vec4(y2, 0.5);
}
