import {ScreenAcceleration, ScreenRotation, SensorCallback} from "./index";
import {SCREEN_ROTATION_180, SCREEN_ROTATION_270, SCREEN_ROTATION_90, SCREEN_ROTATION_MINUS_90} from "./Constants";
import {handleDeviceMotionChange} from "./Events";
import {State} from "./State";

// noinspection JSSuspiciousNameCombination
export class DeviceMotion {
	private state: State = State.instance;

	constructor() {
	}

	start(callback?: SensorCallback) {
		if (callback && typeof callback === "function") {
			this.state.sensors.motion.callbacks.push(callback);
		}

		if (!this.state.sensors.motion.active) {
			window.addEventListener('devicemotion', handleDeviceMotionChange, false);
			this.state.sensors.motion.active = true;
		}
	}

	stop() {
		if (this.state.sensors.motion.active) {
			window.removeEventListener('devicemotion', handleDeviceMotionChange, false);
			this.state.sensors.motion.active = false;
		}
	}

	listen(callback?: SensorCallback) {
		if (callback && typeof callback === 'function') {
			this.start(callback);
		}
	}

	getScreenAdjustedAcceleration() {
		const accData: DeviceMotionEventAcceleration = {
			x: this.state.sensors.motion.data?.acceleration?.x || 0,
			y: this.state.sensors.motion.data?.acceleration?.y || 0,
			z: this.state.sensors.motion.data?.acceleration?.z || 0,
		};
		const screenAccData: ScreenAcceleration = {x: 0, y: 0, z: 0};

		switch (this.state.screenOrientationAngle) {
			case SCREEN_ROTATION_90:
				screenAccData.x = -(accData.y || 0);
				screenAccData.y = accData.x || 0;
				break;
			case SCREEN_ROTATION_180:
				screenAccData.x = -(accData.x || 0);
				screenAccData.y = -(accData.y || 0);
				break;
			case SCREEN_ROTATION_270:
			case SCREEN_ROTATION_MINUS_90:
				screenAccData.x = accData.y || 0;
				screenAccData.y = -(accData.x || 0);
				break;
			default: // SCREEN_ROTATION_0
				screenAccData.x = accData.x || 0;
				screenAccData.y = accData.y || 0;
				break;
		}

		screenAccData.z = accData.z || 0;

		return screenAccData;
	}

	getScreenAdjustedAccelerationIncludingGravity() {
		const accGData: ScreenAcceleration = {
			x: this.state.sensors.motion.data?.accelerationIncludingGravity?.x || 0,
			y: this.state.sensors.motion.data?.accelerationIncludingGravity?.y || 0,
			z: this.state.sensors.motion.data?.accelerationIncludingGravity?.z || 0,
		};
		const screenAccGData: ScreenAcceleration = {x: 0, y: 0, z: 0};

		switch (screen.orientation.angle) {
			case SCREEN_ROTATION_90:
				screenAccGData.x = -accGData.y;
				screenAccGData.y = accGData.x;
				break;
			case SCREEN_ROTATION_180:
				screenAccGData.x = -accGData.x;
				screenAccGData.y = -accGData.y;
				break;
			case SCREEN_ROTATION_270:
			case SCREEN_ROTATION_MINUS_90:
				screenAccGData.x = accGData.y;
				screenAccGData.y = -accGData.x;
				break;
			default: // SCREEN_ROTATION_0
				screenAccGData.x = accGData.x;
				screenAccGData.y = accGData.y;
				break;
		}

		screenAccGData.z = accGData.z;

		return screenAccGData;
	}

	getScreenAdjustedRotationRate() {
		const rotRateData: DeviceMotionEventRotationRate = {
			alpha: this.state.sensors.motion.data?.rotationRate?.alpha || 0,
			beta: this.state.sensors.motion.data?.rotationRate?.beta || 0,
			gamma: this.state.sensors.motion.data?.rotationRate?.gamma || 0,
		};
		const screenRotRateData: ScreenRotation = {alpha: 0, beta: 0, gamma: 0};

		switch (screen.orientation.angle) {
			case SCREEN_ROTATION_90:
				screenRotRateData.beta = -(rotRateData.gamma || 0);
				screenRotRateData.gamma = rotRateData.beta || 0;
				break;
			case SCREEN_ROTATION_180:
				screenRotRateData.beta = -(rotRateData.beta || 0);
				screenRotRateData.gamma = -(rotRateData.gamma || 0);
				break;
			case SCREEN_ROTATION_270:
			case SCREEN_ROTATION_MINUS_90:
				screenRotRateData.beta = rotRateData.gamma || 0;
				screenRotRateData.gamma = -(rotRateData.beta || 0);
				break;
			default: // SCREEN_ROTATION_0
				screenRotRateData.beta = rotRateData.beta || 0;
				screenRotRateData.gamma = rotRateData.gamma || 0;
				break;
		}

		screenRotRateData.alpha = rotRateData.alpha || 0;

		return screenRotRateData;
	}

	getLastRawEventData() {
		return this.state.sensors.motion.data || {};
	}
}
