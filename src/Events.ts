import {degToRad} from "./Constants";
import {State} from "./State";

/** @internal */
export function handleScreenOrientationChange() {
	const state = State.instance;
	state.screenOrientationAngle = (window.screen.orientation.angle || 0) * degToRad;
}

/** @internal */
export const handleDeviceOrientationChange = (event: DeviceOrientationEvent): void => {
	const state = State.instance;

	state.sensors.orientation.data = event;
	state.sensors.orientation.callbacks.forEach(cb => cb());
}

/** @internal */
export const handleDeviceMotionChange = (event: DeviceMotionEvent) => {
	const state = State.instance;

	state.sensors.motion.data = event;
	state.sensors.motion.callbacks.forEach(cb => cb());
}
