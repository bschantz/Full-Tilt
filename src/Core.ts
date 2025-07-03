import {DeviceMotion, DeviceOrientation, DeviceOrientationOptions, DevicePermissionState, SensorType} from "./index";
import {State} from "./State";

export async function getDeviceOrientation(options: DeviceOrientationOptions) {
	const state = State.instance;

	// const permission = await requestPermission('orientation');
	// if (permission.orientation == 'denied') {
	// 	throw new Error('Access to device orientation sensors denied');
	// }
	// if (permission.orientation == 'prompt') {
	// 	return permission;
	// }
	const control = new DeviceOrientation(options);
	control.start();

	try {
		await sensorCheck(state.sensors.orientation);
	} catch (e) {
		control.stop();
		console.error('FullTilt: DeviceOrientation is not supported', e);
		return null;
	}
	return control;
}

export async function getDeviceMotion() {
	const state = State.instance;

	// const permission = await requestPermission('motion');
	// if (permission.motion !== 'granted') {
	// 	throw new Error('Access to device motion sensors denied');
	// }
	//
	const control = new DeviceMotion();
	control.start();

	try {
		await sensorCheck(state.sensors.motion);
	} catch (e) {
		control.stop();
		console.error('FullTilt: DeviceMotion is not supported', e);
		return null;
	}
	return control;
}

export async function requestPermission(type?: SensorType): Promise<DevicePermissionState> {
	const deviceState: DevicePermissionState = {};
	try {
		if (!type || type === 'orientation') {
			if (typeof (DeviceOrientationEvent as any).requestPermission !== 'function') {
				deviceState.orientation = 'granted';
			} else {
				deviceState.orientation = await (DeviceOrientationEvent as any).requestPermission();
			}
		}
	} catch (e: any) {
		const err: Error = e;
		if (err.name === 'NotAllowedError') {
			deviceState.orientation = 'prompt';
		}
	}

	try {
		if ((!type || type === 'motion') && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
			if (typeof (DeviceMotionEvent as any).requestPermission !== 'function') {
				deviceState.motion = 'granted';
			} else {
				deviceState.motion = await (DeviceMotionEvent as any).requestPermission();
			}
		}
	} catch (e: any) {
		const err: Error = e;
		if (err.name === 'NotAllowedError') {
			deviceState.motion = 'prompt';
		}
	}

	return deviceState;
}

/** @internal */
export async function sensorCheck(sensorRootObj: any) {

	return new Promise((resolve, reject) => {
		const runCheck = (tries: number) => {

			setTimeout(() => {
				if (sensorRootObj && sensorRootObj.data) {
					resolve(null);
				} else if (tries >= 20) {
					reject();
				} else {
					runCheck(++tries);
				}
			}, 50);
		};
		runCheck(0);
	});
}

/** @internal */
export function wrap(input: number, max: number): number {
	while (input < max) {
		input += max;
	}

	return input % max;
}
