import {SensorType} from "./index";

/** @internal */
export class PermissionManager {

	static async request(type: SensorType): Promise<PermissionState> {
		try {
			if (type === 'orientation' && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
				return await (DeviceOrientationEvent as any).requestPermission();
			}
			if (type === 'motion' && typeof (DeviceMotionEvent as any).requestPermission === 'function') {
				return await (DeviceMotionEvent as any).requestPermission();
			}
		} catch (error) {
			console.error('FullTilt: Permission request failed', error);
			return 'denied';
		}
		return 'granted';
	}
}

