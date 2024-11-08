
// These are necessary definitions that let you graphics card know how to render the shader
#ifdef GL_ES
precision highp float;
#endif

attribute vec3 aPosition;
attribute vec2 aTexCoord;

varying vec2 vTexCoord;

void main() {

  vTexCoord = aTexCoord;

  // copy the position data into a vec4, using 1.0 as the w component
  vec4 positionVec4 = vec4(aPosition, 1.0);
  
  // scale the rect by two, and move it to the center of the screen
  // if we don't do this, it will appear with its bottom left corner in the center of the sketch
  // try commenting this line out to see what happens
  positionVec4.xy = positionVec4.xy * 2.0 - 1.0;

  // Send the vertex information on to the fragment shader
  gl_Position = positionVec4;
}