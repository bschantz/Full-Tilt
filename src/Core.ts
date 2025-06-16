import {DeviceMotion, DeviceOrientation, DeviceOrientationOptions} from "./index";
import {State} from "./State";
import {PermissionManager} from "./PermissionManager";

export async function getDeviceOrientation(options: DeviceOrientationOptions) {
	const state = State.instance;

	const permission = await PermissionManager.request('orientation');
	if (permission !== 'granted') {
		throw new Error('Access to device orientation sensors denied');
	}
	const control = new DeviceOrientation(options);
	control.start();

	try {
		await sensorCheck(state.sensors.orientation);
	} catch (e) {
		control.stop();
		console.error('DeviceOrientation is not supported', e);
		return null;
	}
	return control;
}

export async function getDeviceMotion() {
	const state = State.instance;

	const permission = await PermissionManager.request('motion');
	if (permission !== 'granted') {
		throw new Error('Access to device motion sensors denied');
	}

	const control = new DeviceMotion();
	control.start();

	try {
		await sensorCheck(state.sensors.motion);
	} catch (e) {
		control.stop();
		console.error('DeviceMotion is not supported', e);
		return null;
	}
	return control;
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
