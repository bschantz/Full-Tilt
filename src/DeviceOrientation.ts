import {DeviceOrientationOptions, Euler, Quaternion, RotationMatrix, SensorCallback} from "./index";
import {handleDeviceOrientationChange} from "./Events";
import {State} from "./State";
import {M_2_PI} from "./Constants";

export class DeviceOrientation {

	private state: State = State.instance;

	private alphaOffsetScreen = 0
	private alphaOffsetDevice?: Euler;

	private tries = 0;
	private maxTries = 200;
	private successCount = 0;
	private successThreshold = 30;

	constructor(options: DeviceOrientationOptions) {

		if (options?.type === 'world') {
			const setCompassAlphaOffset = (evt: DeviceOrientationEvent) => {

				if (!evt.absolute && evt.webkitCompassAccuracy
					&& +evt.webkitCompassAccuracy >= 0 && +evt.webkitCompassAccuracy < 50) {
					this.alphaOffsetDevice = new Euler(evt.webkitCompassHeading, 0, 0);
					this.alphaOffsetDevice.rotateZ(this.state.screenOrientationAngle);
					this.alphaOffsetScreen = this.state.screenOrientationAngle;

					// Discard first {successThreshold} responses while a better compass lock is found by UA
					if (++this.successCount >= this.successThreshold) {
						window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
						return;
					}
				}

				if (++this.tries >= this.maxTries) {
					window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
				}
			};
			window.addEventListener('deviceorientation', setCompassAlphaOffset, false);
		} else {
			const setGameAlphaOffset = (evt: DeviceOrientationEvent) => {

				if (evt.alpha !== null) { // do regardless of whether 'evt.absolute' is also true
					this.alphaOffsetDevice = new Euler(evt.alpha, 0, 0);
					this.alphaOffsetDevice.rotateZ(-screen.orientation.angle);

					// Discard first {successThreshold} responses while a better compass lock is found by UA
					if (++this.successCount >= this.successThreshold) {
						window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
						return;
					}
				}

				if (++this.tries >= this.maxTries) {
					window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
				}
			};
			window.addEventListener('deviceorientation', setGameAlphaOffset, false);

		}
	}

	start(callback?: SensorCallback) {
		if (callback && typeof callback === 'function') {
			this.state.sensors.orientation.callbacks.push(callback);
		}
		if (!this.state.sensors.orientation.active) {
			window.addEventListener('deviceorientation', handleDeviceOrientationChange, false);
			this.state.sensors.orientation.active = true;
		}
	}

	stop(): void {
		if (this.state.sensors.orientation.active) {
			window.removeEventListener('deviceorientation', handleDeviceOrientationChange, false);
			this.state.sensors.orientation.active = false;
		}
	}

	listen(callback?: SensorCallback): void {
		this.start(callback);
	}

	getFixedFrameQuaternion(): Quaternion {

		const quaternion = new Quaternion();
		const euler = this.getFixedFrameEuler();

		quaternion.setFromEuler(euler);

		return quaternion;
	}

	getScreenAdjustedQuaternion(): Quaternion {
		const quaternion = this.getFixedFrameQuaternion();

		// Automatically apply screen orientation transform
		quaternion.rotateZ(-this.state.screenOrientationAngle);

		return quaternion;
	}

	getFixedFrameMatrix(): RotationMatrix {
		const euler = this.getFixedFrameEuler();
		const matrix = new RotationMatrix();

		matrix.setFromEuler(euler);

		return matrix;
	}

	getScreenAdjustedMatrix(): RotationMatrix {
		const matrix = this.getFixedFrameMatrix();

		// Automatically apply screen orientation transform
		matrix.rotateZ(M_2_PI - this.state.screenOrientationAngle);

		return matrix;
	}

	getFixedFrameEuler(): Euler {
		const euler = new Euler();
		const matrix = new RotationMatrix();

		const orientationData = this.state.sensors.orientation.data || {alpha: 0, beta: 0, gamma: 0};

		let adjustedAlpha = orientationData.alpha;

		if (this.alphaOffsetDevice) {
			matrix.setFromEuler(this.alphaOffsetDevice);
			matrix.rotateZ(-this.alphaOffsetScreen);
			euler.setFromRotationMatrix(matrix);

			if (euler.alpha < 0) {
				euler.alpha += 360;
			}

			euler.alpha %= 360;

			adjustedAlpha -= euler.alpha;
		}

		return euler.set(
			adjustedAlpha,
			orientationData.beta,
			orientationData.gamma
		);
	}

	getScreenAdjustedEuler(): Euler {
		const euler = new Euler();
		const matrix = this.getScreenAdjustedMatrix();

		euler.setFromRotationMatrix(matrix);

		return euler;
	}

	getLastRawEventData() {
		return this.state.sensors.orientation.data || {};
	}
}
