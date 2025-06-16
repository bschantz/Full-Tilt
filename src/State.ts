import {DeviceSensorStructure, SensorCallback} from "./index";
import {degToRad} from "./Constants";
import {handleScreenOrientationChange} from "./Events";

export class State {
	private static _instance: State;

	public screenOrientationAngle: number;
	public sensors: DeviceSensorStructure;

	private constructor() {
		this.screenOrientationAngle = window.screen.orientation.angle * degToRad

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
