


// "Fractal Cartoon" - former "DE edge detection" by Kali

// Cartoon-like effect using eiffies's edge detection found here: 
// https://www.shadertoy.com/view/4ss3WB
// I used my own method previously but was too complicated and not compiling everywhere.
// Thanks to the suggestion by WouterVanNifterick. 

// There are no lights and no AO, only color by normals and dark edges.


// update: Nyan Cat cameo, thanks to code from mu6k: https://www.shadertoy.com/view/4dXGWH


// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision highp float;
#endif


// These are our passed in information from the sketch.js
uniform vec2 iResolution;
uniform vec2 iMouse;
uniform float iTime;

varying vec2 vTexCoord;

// "Fractal Cartoon" - former "DE edge detection" by Kali

// There are no lights and no AO, only color by normals and dark edges.

// update: Nyan Cat cameo, thanks to code from mu6k: https://www.shadertoy.com/view/4dXGWH


#define rot(a) mat2(cos(a),sin(a),-sin(a),cos(a))

float opSmoothUnion( float d1, float d2, float k ) {
    float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
    return mix( d2, d1, h ) - k*h*(1.0-h); }

float sdSphere( vec3 p, float s )
{
  return length(p)-s;
}

float sdBox( vec3 p, vec3 b )
{
  vec3 q = abs(p) - b;
  return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
}

float sdOctahedron( vec3 p, float s)
{
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
}

vec3 opRep(in vec3 p, in vec3 c)
{
    return mod(p+0.5 * c, c)-.5*c;  
}

float map(vec3 pos) 
{
    
    //pos = vec3(2*rot(time));
    pos = opRep(pos,vec3(6));
    
    float world = sdOctahedron(pos, sin(iTime));

    //world = opSmoothUnion(world, sdSphere(pos, 0.5), 0.5);
    world = sdSphere(pos, 0.5);
    
    return world;
}

float castRay(vec3 ro, vec3 rd)
{
    float c = 0.0; //si y'a contact, on aura la distance
    
    for(int i = 0; i < 128; i++)
    {
        float ray = map(ro + rd*c);
        
        if(ray < (0.0001*c))
        {
            return float(i)/(float(128)/2.);
        }
        c+=ray;
    } 
    return -1.0;
}

vec3 render(vec3 ro, vec3 rd) 
{
    
    float contact = castRay(ro ,rd); 
    
    vec3 col = vec3(0.);
    
    if(contact == -1.){
        col = vec3(0.);
    }else{
        col = vec3(1.-contact, 0.2, 0.2);
    }
    return col;
}


void main() {
    // copy the vTexCoord
    // vTexCoord is a value that goes from 0.0 - 1.0 depending on the pixels location
    // we can use it to access every pixel on the screen
  
    vec2 coord = vTexCoord;
    //vec2 fragCoord = vTexCoord;

    float u = coord.x * 2.0 - 1.0;
    float v = coord.y * 2.0 - 1.0;
    const float scale = 1.0;

    // Make sure pixels are square
    u = u / scale * iResolution.x / iResolution.y;
    v = v / scale;

    vec2 uv = vec2(u, v);
   
    float fov = 2.5; //fieldOfView

    // Centrer la caméra
    vec3 camPos = vec3(10.*rot(iTime/35.));
    vec3 camTar = vec3(0);
    
    // Direction de la vue / du rayon
    vec3 forward = normalize(camTar - camPos);
    vec3 right = normalize(cross(vec3(0, -1, 0), forward));
    vec3 up = normalize(cross(right, forward));
    vec3 viewDir = normalize(uv.x * right + uv.y * up+ forward*fov);
    
    vec3 col = vec3(uv.x,uv.y,0.0);
    col = render(camPos,viewDir);
      
  // gl_FragColor is a built in shader variable, and your .frag file must contain it
  // We are setting the vec3 color into a new vec4, with a transparency of 1 (no opacity)
	gl_FragColor = vec4(col,1.0);
}