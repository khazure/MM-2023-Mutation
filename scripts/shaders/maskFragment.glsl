uniform float uTime;
uniform sampler2D alphaMap;

varying vec2 vUv;
varying vec3 pos;

// hash function from https://github.com/MaxBittker/glsl-voronoi-noise
vec3 hash3d(vec3 p) {
  return fract(
      sin(vec3(dot(p, vec3(1.0, 57.0, 113.0)), dot(p, vec3(57.0, 113.0, 1.0)),
               dot(p, vec3(113.0, 1.0, 57.0)))) *
      43758.5453);
}

// Function from Iñigo Quiles
// www.iquilezles.org/www/articles/functions/functions.htm
// for visual demo, go to https://thebookofshaders.com/edit.php#05/pcurve.frag
float pcurve( float x, float a, float b ){
    float k = pow(a+b,a+b) / (pow(a,a)*pow(b,b));
    return k * pow( x, a ) * pow( 1.0-x, b );
}

// plasma ball from https://medium.com/geekculture/make-a-cool-plasma-ball-using-voronoi-effect-in-three-js-8a0477e3b745
vec2 voronoi( in vec3 x, in float time )
{
    // current cell coordinates
    vec3 n = floor(x);
    // pixel coordinates in current cell
    vec3 f = fract(x);

    // initialize m with a large number
    // (which will be get replaced very soon with smaller distances below)
    vec4 m = vec4(8.0);

    // in 2D voronoi, we only have 2 dimensions to loop over
    // in 3D, we would naturally have one more dimension to loop over
    for( int k=-1; k<=1; k++ ) {
        for( int j=-1; j<=1; j++ ) {
            for( int i=-1; i<=1; i++ )
            {
                // coordinates for the relative cell  within the 3x3x3 3D grid
                vec3 g = vec3(float(i),float(j),float(k));
                // calculate a random point within the cell relative to 'n'(current cell coordinates)
                vec3 o = hash3d( n + g );
                // calculate the distance vector between the current pixel and the moving random point 'o'
                vec3 r = g + (0.5+0.5*sin(vec3(time)+6.2831*o)) - f;
                // calculate the scalar distance of r
                float d = dot(r,r);

                // find the minimum distance
                // it is most important to save the minimum distance into the result 'm'
                // saving other information into 'm' is optional and up to your liking
                // e.g. displaying different colors according to various cell coordinates
                if( d<m.x )
                {
                    m = vec4( d, o );
                }
            }
        }
    }

    return vec2(m.x, m.y+m.z+m.w);
}
void main() {
  float uBlueFactor = 3.0;
  float uPCurveHandle = 1.5;
  // vec3 mainColor = vec3(0.21568627450980393, 0.3843137254901961, 1);
  // vec2 uvScaled = vUv.xy * 2.0 - 1.0;

  // vec2 rand = randomVector(uvScaled);
  //gl_FragColor = vec4(rand, 0, 0.5);

  vec2 res = voronoi(pos*.23, uTime*0.3);

  // darken by pow
  vec3 mycolor = vec3(pow(res.x, 1.5));

  // emphasis on blue
  float blue = mycolor.b * uBlueFactor;

  // cut off the blueness at the top end of the spectrum
  mycolor.b = blue * (1. - smoothstep(0.9,1.0,res.x));

  // adjust red+greeness using pcurve such that greyness/whiteness
  // is only seen at a limited range within the spectrum
  mycolor.r = pcurve(mycolor.r, 4.0, uPCurveHandle);
  mycolor.g = pcurve(mycolor.g, 4.0, uPCurveHandle);


  //gl_FragColor = vec4( vec3(res.x), 1.0 );

  // apply mask 
  float alpha = texture2D(alphaMap, vUv).r;

  //temp: 
  //mycolor = mycolor * alpha;

  gl_FragColor = vec4(mycolor, floor(alpha));
}
