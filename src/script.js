import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import init from './init';

import './style.css';

const { sizes, camera, scene, canvas, controls, renderer } = init();

camera.position.set(70, 40, 10);

// Добавляем плокость пола
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(100, 100),
	// Внимание! MeshStandardMaterial будет отображаться только если на сцене присутствуют источники света
	new THREE.MeshStandardMaterial({
		color: 0x2e8b57,
		metalness: 0,
		roughness: 0.5,
	}),
);

// Немного разворачиваем по Ox и включаем отображение теней на нашем полу
floor.receiveShadow = true;
floor.rotation.x = -Math.PI * 0.5;
floor.position.y = -0.1;
// Добавляем наш пол на сцену
scene.add(floor);

// Добавляем источники света (полусферический + направленный)
// 1. Полусферический источник света
const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.75);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);
// 2. Направленный источник света
const dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
dirLight.position.set(-8, 12, 8);
dirLight.castShadow = true;
dirLight.shadow.mapSize = new THREE.Vector2(1024, 1024);
scene.add(dirLight);

// Загружаем 3d-модели
const modelLoader = new GLTFLoader();

modelLoader.load(
	'/models/DragonAttenuation/DragonAttenuation.gltf',
	(gltfDragon) => {
		console.log('dragon model loading succsessful');
		const dragon = gltfDragon.scene.children[1];
		dragon.material.thickness = 1.5;
		dragon.scale.set(3, 3, 3);
		dragon.position.set(-27, 0, 35);
		dragon.rotation.z = Math.PI * 0.7;
		scene.add(dragon);
	},
);

modelLoader.load('/models/Fox/Fox.gltf', (gltfFox) => {
	console.log('fox model loading succsessful');
	const fox = gltfFox.scene;
	fox.scale.set(0.2, 0.2, 0.2);
	fox.position.set(1, 0, 5);
	fox.rotation.y = Math.PI * -0.25;
	scene.add(fox);
});

modelLoader.load('/models/DamagedHelmet/DamagedHelmet.gltf', (helmetGltf) => {
	console.log('helmet model loading succsessful');
	const helmet = helmetGltf.scene;
	helmet.scale.set(5, 5, 5);
	helmet.position.set(27, 3.6, 30);
	helmet.rotation.z = Math.PI * -0.35;
	helmet.rotation.y = Math.PI * -0.3;
	scene.add(helmet);
});

let robotMixer = null;

modelLoader.load('/models/BrainStem/BrainStem.gltf', (gltfRobot) => {
	console.log('robot model loading succsessful');
	const robot = gltfRobot.scene;
	robot.scale.set(25, 25, 25);
	robot.position.set(-20, 0, -20);
	robot.rotation.y = Math.PI * 0.25;
	scene.add(robot);

	robotMixer = new THREE.AnimationMixer(robot);
	const action = robotMixer.clipAction(gltfRobot.animations[0]);
	action.play();
});

const clock = new THREE.Clock();
const tick = () => {
	controls.update();
	renderer.render(scene, camera);

	const delta = clock.getDelta();
	if (robotMixer) {
		robotMixer.update(delta * 0.5);
	}

	window.requestAnimationFrame(tick);
};
tick();

/** Базовые обпаботчики событий длы поддержки ресайза */
window.addEventListener('resize', () => {
	// Обновляем размеры
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Обновляем соотношение сторон камеры
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Обновляем renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
});

window.addEventListener('dblclick', () => {
	if (!document.fullscreenElement) {
		canvas.requestFullscreen();
	} else {
		document.exitFullscreen();
	}
});
