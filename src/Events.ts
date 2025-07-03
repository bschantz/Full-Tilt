import {degToRad} from "./Constants";
import {State} from "./State";
import {wrap} from "./Core";

/** @internal */
export function handleScreenOrientationChange() {
	const state = State.instance;
	const [angle, reversed] = normalizeOrientationOffset(screen.orientation);
	const offset = reversed ? -angle : angle;
	state.screenOrientationAngle = wrap(screen.orientation.angle + offset, 360) * degToRad;
	state.screenOrientationType = screen.orientation.type;
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

/** @internal */
export function normalizeOrientationOffset(orientation: ScreenOrientation): [number, boolean] {
	const platform = (navigator as any).userAgentData?.platform || navigator?.platform || 'unknown';
	let offset = 0;
	let reversed = platform === 'iPad' || (platform === 'MacIntel' && navigator.maxTouchPoints > 0) ;
	switch (orientation.type) {
		case "portrait-primary":
			if (orientation.angle === 90) {
				offset = 90;
			}
			break;
		case "portrait-secondary":
			if (orientation.angle === 270) {
				offset = 90;
			}
			break;
		case "landscape-primary":
			if (orientation.angle === 0 && reversed) {
				offset = 270;
			}
			break;
		case "landscape-secondary":
			if (orientation.angle === 180 && reversed) {
				offset = 270;
			}
			break;
	}

	return [offset, reversed];
}
