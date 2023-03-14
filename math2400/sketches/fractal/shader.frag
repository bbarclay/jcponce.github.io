/*

Original code by mathmasterzach: 
https://www.shadertoy.com/view/4tGczc

*/

// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision highp float;
#endif

// These are our passed in information from the sketch.js
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform bool u_pressed;

varying vec2 vTexCoord;

mat2 rot2(float a) {
	float c = cos(a);
	float s = sin(a);
	return mat2(c, s,-s, c);
}
vec3 rotate(vec3 p, vec3 a){
    vec3 q=p;
    q.yz=rot2(a.y)*q.yz;
    q.xy=rot2(a.z)*q.xy;
    q.xz=rot2(a.x)*q.xz;
	return q;
}
vec3 hsv2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
float smax( in float a, in float b, in float s ){
    float h = clamp( 0.5 + 0.5*(a-b)/s, 0.0, 1.0 );
    return mix(b, a, h) + h*(1.0-h)*s;
}
vec2 path(float z){
    return vec2(.01*sin(z*40.)+.03*sin(z*13.),.03*cos(z*21.)+.08*cos(z*3.)+1.*z);
}
float de(vec3 p){
    vec2 pth=path(p.z);
    float t = max(abs(p.x+pth.x),abs(p.y+pth.y));
    p = fract(p)-0.5;
    float d = 9e9;
    float s = 1.;
    for (int i = 1 ; i <= 10; i++) {
        float m = dot(p,p)*.7;
        p/=m;
        p.xy = fract(p.xy)-0.5;
        s *= m;
        p.xyz=p.yzx;
    }
    float f=1.0;
    d=min(d,(length(p)-f)*s);
    return smax(d,-t, 0.05);
}
float deSM(vec3 p){
    vec2 pth=path(p.z);
    float t = max(abs(p.x+pth.x),abs(p.y+pth.y));
    p = fract(p)-0.5;
    float d = 9e9;
    float s = 1.;
    for (int i = 1 ; i <= 5; i++) {
        float m = dot(p,p)*.7;
        p/=m;
        p.xy = fract(p.xy)-0.5;
        s *= m;
        p.xyz=p.yzx;
    }
    float f=1.0;
    d=min(d,(length(p)-f)*s);
    return smax(d,-t, 0.05);
}
float map(vec3 p){
    float d=de(p);
    p.xy+=path(p.z);
    d=max(d,.01-max(abs(p.x),abs(p.y)));
    p.y+=.01;
    d=min(d,max(abs(p.x)-.001,abs(p.y)-.001));
    return d;
}
const float FAR_DIST=50.0;
const float NEAR_DIST=.0001;
const int ITERATIONS=128;
vec3 trace(vec3 o, vec3 r){
    float t = 0.;
    vec3 p;
    float steps=0.;
    for (int i = 0; i < ITERATIONS; i++){
        p = o + r * t;
        float d = map(p);
        t += d*.5;
        if(d<NEAR_DIST){
        	break;
        }
        if(t>FAR_DIST){
    		return vec3(0.0);
    	}
        steps++;
    }
    vec2 eps = vec2(0.0, .0001);
    vec3 normal = normalize(vec3(
        map(p + eps.yxx) - map(p - eps.yxx),
        map(p + eps.xyx) - map(p - eps.xyx),
        map(p + eps.xxy) - map(p - eps.xxy)));
    float diffuse = max(0.0, dot(-normalize(r), normal)*.5+.4);
    //light in front of person
    //vec3 p2=vec3(-path((iTime+1.)/20.),(iTime+1.)/20.);
    //float diffuse = max(0.0, dot(-normalize(p-p2), normal));
    float specular = pow(diffuse, 32.0);
    //smooth color
    vec3 albedo = hsv2rgb(vec3(40.*deSM(p),1.,1.));
    //hard bands of color
    //vec3 albedo = hsv2rgb(vec3(.1*floor(de8xSM(p)*400.),1.,1.));
    return mix(albedo*(diffuse + specular),vec3(0.),steps/float(ITERATIONS));
}
mat3 setCamera( in vec3 ro, in vec3 ta, float cr ){
	vec3 cw = normalize(ta-ro);
	vec3 cp = vec3(sin(cr), cos(cr),0.0);
	vec3 cu = normalize( cross(cw,cp) );
	vec3 cv = normalize( cross(cu,cw) );
    return mat3( cu, cv, cw );
}


void main() {
    // copy the vTexCoord
    // vTexCoord is a value that goes from 0.0 - 1.0 depending on the pixels location
    // we can use it to access every pixel on the screen
  
    vec2 coord = vTexCoord;

    float u = coord.x * 2.0 - 1.0;
    float v = coord.y * 2.0 - 1.0;
    const float scale = 1.21;

    // Make sure pixels are square
    u = u * scale * u_resolution.x / u_resolution.y;
    v = v * scale;

    vec2 uv = vec2(u, v);
  
   // vec3 col = vec3(0.0);

	float speed = 1.0/70.0;
    vec3 o = vec3(-path(u_time * speed),u_time * speed);
    vec3 ta = vec3(-path(.01+(u_time * speed)),.01+(u_time * speed));
    mat3 ca = setCamera( o, ta, 0.0 );
    //vec3 r = ca * normalize( vec3(uv.xy,1.5));
    vec2 nMouse = vec2(u_mouse.x, u_mouse.y);
    vec3 r;
    //if(u_mouse.x==0.&&u_mouse.y==0.){
	if(u_pressed == false){
    	r = ca *  normalize( vec3(uv.xy,1.5));
    }else{
    	r = ca *  normalize( rotate(vec3(uv.xy,1.5),vec3(nMouse.x,nMouse.y,0.0)));
    }
    //fragColor = vec4(trace(o, r),1.0);

  // gl_FragColor is a built in shader variable, and your .frag file must contain it
  // We are setting the vec3 color into a new vec4, with a transparency of 1 (no opacity)
	gl_FragColor = vec4(trace(o, r),1.0);
}