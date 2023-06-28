varying vec2 vUv;
varying vec3 pos;
varying float time;

void main() {

  vUv = uv;
  pos = position;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}