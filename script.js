import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import gsap from 'gsap';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 110);
camera.lookAt(0, 0, 50);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.enableZoom = true;

// Add ground plane for the model to sit on
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    roughness: 0.8,
    metalness: 0.2 
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate to be horizontal
ground.receiveShadow = true;
scene.add(ground);

// GLTF Model Loader
const gltfLoader = new GLTFLoader();
console.log('Current working directory:', window.location.href);

let model; // Declare model variable at a higher scope

// Create a startup animation sequence
function startupAnimation() {
    controls.enabled = false;
  
    const timeline = gsap.timeline({
        onComplete: () => {
            controls.enabled = true;
        }
    });
  
    // Through the gate
    timeline.to(camera.position, {
        x: 0,
        y: 8,
        z: 45,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0, 50)
    });
  
    // Combined rise and 360 rotation
    timeline.to(camera.position, {
        duration: 3,
        ease: "none",
        onUpdate: function() {
            const progress = this.progress();
            // Continuous rise while starting rotation
            const angle = progress * Math.PI * 2;
            const radius = 100;
            
            // Gradually increase radius and height
            const currentRadius = 45 + (progress * (radius - 45));
            const currentHeight = 8 + (progress * 32); // Rise from 8 to 40
            
            // Calculate a moving lookAt point that follows a smaller circle
            const lookAtRadius = 30;
            const lookAtX = Math.sin(angle) * lookAtRadius;
            const lookAtZ = Math.cos(angle) * lookAtRadius;
            
            camera.position.x = Math.sin(angle) * currentRadius;
            camera.position.y = currentHeight;
            camera.position.z = Math.cos(angle) * currentRadius;
            camera.lookAt(lookAtX, 0, lookAtZ);
        }
    });
  
    // Final position
    timeline.to(camera.position, {
        x: 0,
        y: 20,
        z: 110,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0, 50)
    });
}

gltfLoader.load(
    '/models/audi1.glb',
    (gltf) => {
        model = gltf.scene;
        
        // Scale if model is too big/small
        model.scale.set(3, 3, 3);
        
        // Center the model
        model.position.set(0, 3.8, -12);
        
        // Rotate to match Blender orientation
        model.rotation.x = 0;
        model.rotation.y = Math.PI; // 180 degrees to face front
        model.rotation.z = 0;
        
        // Add shadow support
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow = true;
                node.receiveShadow = true;
                // Optional: Improve material rendering
                if (node.material) {
                    node.material.metalness = 0.9;
                    node.material.roughness = 0.2;
                }
            }
        });
        
        scene.add(model);
        document.getElementById('loading-screen').style.display = 'none';
        
        // Start the animation after model is loaded
        startupAnimation();
        
        // Log success
        console.log('Audi model added to scene');
        
        // Log model position and scale for debugging
        console.log('Model position:', model.position);
        console.log('Model scale:', model.scale);
        
        // After loading the model
        console.log('Scene contents:', scene.children);
    },
    // Progress callback
    (progress) => {
        const percentComplete = (progress.loaded / progress.total) * 100;
        console.log('Loading progress:', percentComplete + '%');
    },
    // Error callback
    (error) => {
        console.error('Failed to load model:', {
            modelPath: '/models/audi1.glb',
            error: error,
            workingDirectory: window.location.href
        });
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.color = 'red';
        errorDiv.style.background = 'white';
        errorDiv.style.padding = '20px';
        errorDiv.innerHTML = `Failed to load model: ${error.message}`;
        document.body.appendChild(errorDiv);
        
        document.getElementById('loading-screen').style.display = 'none';
    }
);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 30, 20);
directionalLight.castShadow = true;

// Add spotlights for the audi building
const spotLight = new THREE.SpotLight(0xffffff, 3);
spotLight.position.set(-10, 20, 0);
spotLight.target.position.set(0, 2.5, 10);
spotLight.angle = Math.PI / 4;
spotLight.penumbra = 0.2;
spotLight.decay = 1;
spotLight.distance = 100;
spotLight.castShadow = true;

// Second spotlight
const spotLight2 = new THREE.SpotLight(0xffffff, 3);
spotLight2.position.set(10, 20, 0);
spotLight2.target.position.set(0, 2.5, 10);
spotLight2.angle = Math.PI / 4;
spotLight2.penumbra = 0.2;
spotLight2.decay = 1;
spotLight2.distance = 100;
spotLight2.castShadow = true;

// Add a third spotlight from the front
const spotLight3 = new THREE.SpotLight(0xffffff, 2);
spotLight3.position.set(0, 15, 20);
spotLight3.target.position.set(0, 2.5, 10);
spotLight3.angle = Math.PI / 4;
spotLight3.penumbra = 0.2;
spotLight3.decay = 1;
spotLight3.distance = 100;
spotLight3.castShadow = true;

scene.add(ambientLight, directionalLight, spotLight, spotLight.target, spotLight2, spotLight2.target, spotLight3, spotLight3.target);

// Enable shadow mapping in renderer
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 1.5;

// Responsive Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    
    controls.update();
    renderer.render(scene, camera);
}

animate();

// Building and Navigation Data
const buildings = [
    { name: 'Library', position: { x: 10, y: 0, z: 15 } },
    { name: 'Hostel', position: { x: -10, y: 0, z: -15 } },
    { name: 'Main Gate', position: { x: 0, y: 0, z: 0 } },
    { name: 'Academic Block', position: { x: 5, y: 0, z: -5 } },
];

const paths = [
    { from: 'Main Gate', to: 'Library', waypoints: [{ x: 5, y: 0, z: 10 }] },
    { from: 'Main Gate', to: 'Hostel', waypoints: [{ x: -5, y: 0, z: -10 }] },
    { from: 'Library', to: 'Academic Block', waypoints: [{ x: 7, y: 0, z: 10 }] },
];

// Highlight Buildings
function highlightBuilding(building) {
    const buildingObject = scene.getObjectByName(building.name);
    if (buildingObject) {
        buildingObject.material.emissive.set(0x00ff00);
        setTimeout(() => buildingObject.material.emissive.set(0x000000), 1000);
    }
}

// Search and Suggestion Functionality
document.getElementById('search-box').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const suggestions = buildings.filter((b) => b.name.toLowerCase().includes(query));
    const suggestionList = document.getElementById('search-suggestions');
    suggestionList.innerHTML = '';
    suggestions.forEach((suggestion) => {
        const li = document.createElement('li');
        li.textContent = suggestion.name;
        li.addEventListener('click', () => highlightBuilding(suggestion));
        suggestionList.appendChild(li);
    });
});

// Draw Navigation Path
function drawPath(waypoints) {
    const points = waypoints.map((wp) => new THREE.Vector3(wp.x, wp.y, wp.z));
    const pathGeometry = new THREE.BufferGeometry().setFromPoints(points);
    const pathMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
    const pathLine = new THREE.Line(pathGeometry, pathMaterial);
    scene.add(pathLine);
}

// Live Navigation with Arrow
function showLiveNavigation(waypoints) {
    let currentIndex = 0;
    const arrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(waypoints[currentIndex].x, waypoints[currentIndex].y, waypoints[currentIndex].z),
        5,
        0xff0000
    );
    scene.add(arrow);

    const navigate = () => {
        if (currentIndex < waypoints.length - 1) {
            const nextPoint = waypoints[currentIndex + 1];
            gsap.to(arrow.position, {
                x: nextPoint.x,
                y: nextPoint.y,
                z: nextPoint.z,
                duration: 2,
                onComplete: () => {
                    currentIndex++;
                    if (waypoints[currentIndex + 1]) {
                        arrow.setDirection(
                            new THREE.Vector3(
                                waypoints[currentIndex + 1].x - nextPoint.x,
                                waypoints[currentIndex + 1].y - nextPoint.y,
                                waypoints[currentIndex + 1].z - nextPoint.z
                            ).normalize()
                        );
                    }
                    navigate();
                },
            });
        } else {
            scene.remove(arrow);
        }
    };
    navigate();
}

// Reset Navigation
function resetCameraPosition() {
    gsap.to(camera.position, {
        x: 0,
        y: 20,
        z: 110,
        duration: 1,
        ease: "power2.inOut",
        onUpdate: () => camera.lookAt(0, 0, 50)
    });
}

document.getElementById('reset-navigation').addEventListener('click', () => {
    scene.children = scene.children.filter((child) => !(child instanceof THREE.Line || child instanceof THREE.ArrowHelper));
    resetCameraPosition();
});

// Feedback Form Handling
document.getElementById('submit-feedback').addEventListener('click', () => {
    const feedbackText = document.getElementById('feedback-text').value;
    if (feedbackText.trim()) {
        // Here you would typically send the feedback to a server
        alert('Thank you for your feedback!');
        document.getElementById('feedback-text').value = '';
    } else {
        alert('Please enter some feedback before submitting.');
    }
});

// Add these helper functions if you need to debug model placement
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(100, 100);
scene.add(gridHelper);

// Create main gate (inverted U shape)
const gateMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513,  // Brown color
    roughness: 0.7,
    metalness: 0.2
});

// Top beam
const topBeam = new THREE.Mesh(
    new THREE.BoxGeometry(20, 2, 2),
    gateMaterial
);
topBeam.position.set(0, 11, 49);

// Left pillar
const leftPillar = new THREE.Mesh(
    new THREE.BoxGeometry(2, 10, 2),
    gateMaterial
);
leftPillar.position.set(-9, 5, 49);

// Right pillar
const rightPillar = new THREE.Mesh(
    new THREE.BoxGeometry(2, 10, 2),
    gateMaterial
);
rightPillar.position.set(9, 5, 49);

// Create a group for the gate
const gateGroup = new THREE.Group();
gateGroup.add(topBeam);
gateGroup.add(leftPillar);
gateGroup.add(rightPillar);

// Add shadows
[topBeam, leftPillar, rightPillar].forEach(part => {
    part.castShadow = true;
    part.receiveShadow = true;
});

scene.add(gateGroup);

// Add text to the gate
const textGeometry = new THREE.TextGeometry('IGDTUW', {
    size: 1,
    height: 0.2,
});
const textMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold color
const gateText = new THREE.Mesh(textGeometry, textMaterial);
gateText.position.set(-3, 7, 51);  // Adjusted height to be on top beam
scene.add(gateText);