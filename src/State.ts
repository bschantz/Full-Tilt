import {DeviceSensorStructure, SensorCallback} from "./index";
import {degToRad} from "./Constants";
import {handleScreenOrientationChange, normalizeOrientationOffset} from "./Events";
import {wrap} from "./Core";

export class State {
	private static _instance: State;

	public screenOrientationAngle: number;
	public screenOrientationType: OrientationType;
	public sensors: DeviceSensorStructure;

	private constructor() {

		const [angle, reversed] = normalizeOrientationOffset(screen.orientation);
		const offset = reversed ? 360 - angle : angle;
		this.screenOrientationAngle = wrap(screen.orientation.angle + offset, 360) * degToRad;
		this.screenOrientationType = screen.orientation.type;


		this.sensors = {
			orientation: {
				active: false,
				callbacks: [] as SensorCallback[],
				data: undefined as any
			},
			motion: {
				active: false,
				callbacks: [] as SensorCallback[],
				data: undefined as any
			}
		};

		if (!window.isSecureContext) {
			throw new Error('Device Orientation and Motion sensors are only available in a secure context.');
		}


		window.screen.orientation.addEventListener('change', handleScreenOrientationChange, false);

	}

	static get instance(): State {
		if (!this._instance) {
			this._instance = new State();
		}
		return this._instance;
	}
}
