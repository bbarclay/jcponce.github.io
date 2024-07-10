import * as THREE from "three";

let scene, camera, renderer, particles, particlePositions, particleColors;
let numParticles = 1100;
let numTypes;
let colorStep;
let forces, minDistances, radii;
let velocities;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    numTypes = Math.floor(Math.random() * 4) + 2;
    colorStep = 360 / numTypes;

    forces = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    minDistances = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    radii = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    setParameters();

    particlePositions = new Float32Array(numParticles * 3);
    particleColors = new Float32Array(numParticles * 3);
    velocities = new Array(numParticles).fill(null).map(() => new THREE.Vector3(0, 0, 0));

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

    let material = new THREE.PointsMaterial({ size: 4, vertexColors: true });
    particles = new THREE.Points(geometry, material);

    for (let i = 0; i < numParticles; i++) {
        let rad = Math.random() * 100;
        let ang = Math.random() * Math.PI * 2;
        particlePositions[i * 3] = rad * Math.cos(ang);
        particlePositions[i * 3 + 1] = rad * Math.sin(ang);
        particlePositions[i * 3 + 2] = 0;
        let color = new THREE.Color(`hsl(${(i % numTypes) * colorStep}, 70%, 50%)`);
        particleColors[i * 3] = color.r;
        particleColors[i * 3 + 1] = color.g;
        particleColors[i * 3 + 2] = color.b;
    }

    scene.add(particles);

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', setParameters, false);
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setParameters() {
    for (let i = 0; i < numTypes; i++) {
        for (let j = 0; j < numTypes; j++) {
            forces[i][j] = Math.random() * 0.7 + 0.3;
            if (Math.random() < 0.5) forces[i][j] *= -1;
            minDistances[i][j] = Math.random() * 20 + 30;
            radii[i][j] = Math.random() * 180 + 70;
        }
    }
}

function updateParticles() {
    for (let i = 0; i < numParticles; i++) {
        let totalForce = new THREE.Vector3();
        let position = new THREE.Vector3(
            particlePositions[i * 3],
            particlePositions[i * 3 + 1],
            particlePositions[i * 3 + 2]
        );
        let type = i % numTypes;

        for (let j = 0; j < numParticles; j++) {
            if (i !== j) {
                let otherPosition = new THREE.Vector3(
                    particlePositions[j * 3],
                    particlePositions[j * 3 + 1],
                    particlePositions[j * 3 + 2]
                );
                let direction = otherPosition.clone().sub(position);
                let dis = direction.length();
                direction.normalize();

                let otherType = j % numTypes;

                if (dis < minDistances[type][otherType]) {
                    let force = direction.clone().multiplyScalar(Math.abs(forces[type][otherType]) * -3 * ((minDistances[type][otherType] - dis) / minDistances[type][otherType]));
                    totalForce.add(force);
                }

                if (dis < radii[type][otherType]) {
                    let force = direction.clone().multiplyScalar(forces[type][otherType] * ((radii[type][otherType] - dis) / radii[type][otherType]));
                    totalForce.add(force);
                }
            }
        }

        velocities[i].add(totalForce.multiplyScalar(0.05));
        position.add(velocities[i]);
        velocities[i].multiplyScalar(0.85);

        if (position.x > window.innerWidth / 2) position.x -= window.innerWidth;
        if (position.x < -window.innerWidth / 2) position.x += window.innerWidth;
        if (position.y > window.innerHeight / 2) position.y -= window.innerHeight;
        if (position.y < -window.innerHeight / 2) position.y += window.innerHeight;

        particlePositions[i * 3] = position.x;
        particlePositions[i * 3 + 1] = position.y;
        particlePositions[i * 3 + 2] = position.z;
    }

    particles.geometry.attributes.position.needsUpdate = true;
}

init();
animate();


/*
let scene, camera, renderer;
let particles = [];
let numParticles = 1000;
let numTypes;
let colorStep;
let forces, minDistances, radii;

class Particle {
    constructor() {
        let rad = Math.random() * 100;
        let ang = Math.random() * Math.PI * 2;
        this.position = new THREE.Vector3(rad * Math.cos(ang), rad * Math.sin(ang), 0);
        this.velocity = new THREE.Vector3(0, 0, 0);
        this.type = Math.floor(Math.random() * numTypes);

        let geometry = new THREE.SphereGeometry(4, 32, 32);
        let material = new THREE.MeshBasicMaterial({ color: new THREE.Color(`hsl(${this.type * colorStep}, 70%, 50%)`) });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        scene.add(this.mesh);
    }

    update() {
        let totalForce = new THREE.Vector3();
        for (let i = 0; i < particles.length; i++) {
            if (particles[i] !== this) {
                let direction = particles[i].position.clone().sub(this.position);
                let dis = direction.length();
                direction.normalize();

                if (dis < minDistances[this.type][particles[i].type]) {
                    let force = direction.clone().multiplyScalar(Math.abs(forces[this.type][particles[i].type]) * -3 * ((minDistances[this.type][particles[i].type] - dis) / minDistances[this.type][particles[i].type]));
                    totalForce.add(force);
                }

                if (dis < radii[this.type][particles[i].type]) {
                    let force = direction.clone().multiplyScalar(forces[this.type][particles[i].type] * ((radii[this.type][particles[i].type] - dis) / radii[this.type][particles[i].type]));
                    totalForce.add(force);
                }
            }
        }

        this.velocity.add(totalForce.multiplyScalar(0.05));
        this.position.add(this.velocity);
        this.velocity.multiplyScalar(0.85);

        if (this.position.x > window.innerWidth / 2) this.position.x -= window.innerWidth;
        if (this.position.x < -window.innerWidth / 2) this.position.x += window.innerWidth;
        if (this.position.y > window.innerHeight / 2) this.position.y -= window.innerHeight;
        if (this.position.y < -window.innerHeight / 2) this.position.y += window.innerHeight;

        this.mesh.position.copy(this.position);
    }
}

init();
animate();

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    numTypes = Math.floor(Math.random() * 4) + 2;
    colorStep = 360 / numTypes;

    forces = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    minDistances = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    radii = Array.from({ length: numTypes }, () => Array(numTypes).fill(0));
    setParameters();

    for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
    }

    window.addEventListener('resize', onWindowResize, false);
    document.addEventListener('mousedown', setParameters, false);
}

function animate() {
    requestAnimationFrame(animate);
    updateParticles();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function setParameters() {
    for (let i = 0; i < numTypes; i++) {
        for (let j = 0; j < numTypes; j++) {
            forces[i][j] = Math.random() * 0.7 + 0.3;
            if (Math.random() < 0.5) forces[i][j] *= -1;
            minDistances[i][j] = Math.random() * 20 + 30;
            radii[i][j] = Math.random() * 180 + 70;
        }
    }
}

function updateParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
    }
}
*/
