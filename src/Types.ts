declare global {
	interface DeviceOrientationEvent {
		webkitCompassHeading?: number;
		webkitCompassAccuracy?: number;
	}
}

export interface DeviceOrientationOptions {
	type: DeviceOrientationType;
	requireLiveData?: boolean;
}

export interface DeviceMotionOptions {
	requireLiveData?: boolean;
}

export type DeviceOrientationType = 'world'|'game';
export type SensorType = 'orientation'|'motion';

export interface DeviceSensorStructure {
	orientation: OrientationSensorData;
	motion: MotionSensorData;
}

export interface DeviceSensorData {
	active: boolean;
	callbacks: SensorCallback[];
}

export interface OrientationSensorData extends DeviceSensorData {
	data: DeviceOrientationEvent;
}

export interface MotionSensorData extends DeviceSensorData {
	data: DeviceMotionEvent;
}

export interface ScreenAcceleration {
	x: number;
	y: number;
	z: number;
}

export interface ScreenRotation {
	alpha: number;
	beta: number;
	gamma: number;
}

export type SensorCallback = () => void;

export interface DevicePermissionState {
	orientation?: PermissionState;
	motion?: PermissionState;
}
