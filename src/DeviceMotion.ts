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
		const accData = this.state.sensors.motion.data && this.state.sensors.motion.data.acceleration
			? this.state.sensors.motion.data.acceleration
			: {x: 0, y: 0, z: 0};
		const screenAccData: ScreenAcceleration = {x: 0, y: 0, z: 0};

		switch (this.state.screenOrientationAngle) {
			case SCREEN_ROTATION_90:
				screenAccData.x = -accData.y;
				screenAccData.y = accData.x;
				break;
			case SCREEN_ROTATION_180:
				screenAccData.x = -accData.x;
				screenAccData.y = -accData.y;
				break;
			case SCREEN_ROTATION_270:
			case SCREEN_ROTATION_MINUS_90:
				screenAccData.x = accData.y;
				screenAccData.y = -accData.x;
				break;
			default: // SCREEN_ROTATION_0
				screenAccData.x = accData.x;
				screenAccData.y = accData.y;
				break;
		}

		screenAccData.z = accData.z;

		return screenAccData;
	}

	getScreenAdjustedAccelerationIncludingGravity() {
		const accGData = this.state.sensors.motion.data
		&& this.state.sensors.motion.data.accelerationIncludingGravity
			? this.state.sensors.motion.data.accelerationIncludingGravity
			: {x: 0, y: 0, z: 0};
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
		const rotRateData = this.state.sensors.motion.data && this.state.sensors.motion.data.rotationRate
			? this.state.sensors.motion.data.rotationRate
			: {alpha: 0, beta: 0, gamma: 0};
		const screenRotRateData: ScreenRotation = {alpha: 0, beta: 0, gamma: 0};

		switch (screen.orientation.angle) {
			case SCREEN_ROTATION_90:
				screenRotRateData.beta = -rotRateData.gamma;
				screenRotRateData.gamma = rotRateData.beta;
				break;
			case SCREEN_ROTATION_180:
				screenRotRateData.beta = -rotRateData.beta;
				screenRotRateData.gamma = -rotRateData.gamma;
				break;
			case SCREEN_ROTATION_270:
			case SCREEN_ROTATION_MINUS_90:
				screenRotRateData.beta = rotRateData.gamma;
				screenRotRateData.gamma = -rotRateData.beta;
				break;
			default: // SCREEN_ROTATION_0
				screenRotRateData.beta = rotRateData.beta;
				screenRotRateData.gamma = rotRateData.gamma;
				break;
		}

		screenRotRateData.alpha = rotRateData.alpha;

		return screenRotRateData;
	}

	getLastRawEventData() {
		return this.state.sensors.motion.data || {};
	}
}
