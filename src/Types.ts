declare global {
	interface DeviceOrientationEvent {
		webkitCompassHeading?: number;
		webkitCompassAccuracy?: number;
	}
}

export interface DeviceOrientationOptions {
	type: DeviceOrientationType;
}

export type DeviceOrientationType = 'world'|'game';
export type SensorType = 'orientation'|'motion';

export interface DeviceSensorStructure {
	orientation: DeviceSensorData;
	motion: DeviceSensorData;
}

export interface DeviceSensorData {
	active: boolean;
	callbacks: SensorCallback[];
	data: any;
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

export type PermissionState = 'granted'|'denied';
