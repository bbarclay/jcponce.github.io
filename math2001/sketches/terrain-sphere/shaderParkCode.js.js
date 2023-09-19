// Shader Park API avaible here:
// https://docs.shaderpark.com/references-js/

// Note: this function is treated as a string, so you will
// not be able to access constants you define outside this function
// Shader Park will convert this code into a shader for you.
function shaderParkCode() {
	let scale = 1.3;
	let s = getSpace();
	let n = fractalNoise(s*scale);
	let grain = noise(s*100)
	n += grain * .02;
	color(0, 0, n/255*195);
	sphere(0.7+0.2*n); 
}