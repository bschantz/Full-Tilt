declare function getDeviceOrientation(options: DeviceOrientationOptions): Promise<DeviceOrientation | null>;
declare function getDeviceMotion(): Promise<DeviceMotion | null>;
declare function requestPermission(type?: SensorType): Promise<DevicePermissionState>;

declare class DeviceMotion {
    private state;
    constructor();
    start(callback?: SensorCallback): void;
    stop(): void;
    listen(callback?: SensorCallback): void;
    getScreenAdjustedAcceleration(): ScreenAcceleration;
    getScreenAdjustedAccelerationIncludingGravity(): ScreenAcceleration;
    getScreenAdjustedRotationRate(): ScreenRotation;
    getLastRawEventData(): any;
}

declare class DeviceOrientation {
    private state;
    private alphaOffsetScreen;
    private alphaOffsetDevice?;
    private tries;
    private maxTries;
    private successCount;
    private successThreshold;
    constructor(options: DeviceOrientationOptions);
    start(callback?: SensorCallback): void;
    stop(): void;
    listen(callback?: SensorCallback): void;
    getFixedFrameQuaternion(): Quaternion;
    getScreenAdjustedQuaternion(): Quaternion;
    getFixedFrameMatrix(): RotationMatrix;
    getScreenAdjustedMatrix(): RotationMatrix;
    getFixedFrameEuler(): Euler;
    getScreenAdjustedEuler(): Euler;
    get lastRawEventData(): any;
    get screenOrientationAngle(): number;
    get screenOrientationType(): OrientationType;
}

declare class Euler {
    alpha: number;
    beta: number;
    gamma: number;
    constructor(alpha?: number, beta?: number, gamma?: number);
    set(alpha: number, beta: number, gamma: number): this;
    copy(input: Euler): this;
    setFromRotationMatrix(matrix: RotationMatrix): this;
    setFromQuaternion(q: Quaternion): this;
    rotateX(angle: number): Euler;
    rotateY(angle: number): Euler;
    rotateZ(angle: number): Euler;
    private rotateByAxisAngle;
}

declare class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    set(x?: number, y?: number, z?: number, w?: number): this;
    copy(q: Quaternion): this;
    setFromEuler(euler: Euler): this;
    setFromRotationMatrix(matrix: RotationMatrix): this;
    multiply(quaternion: Quaternion): this;
    rotateX(angle: number): this;
    rotateY(angle: number): this;
    rotateZ(angle: number): this;
    multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion;
    normalize(q?: Quaternion): Quaternion;
    rotateByAxisAngle(targetQuaternion: Quaternion, axis: number[], angle: number): Quaternion;
}

declare class RotationMatrix {
    elements: Float32Array<ArrayBuffer>;
    constructor(m11?: number, m12?: number, m13?: number, m21?: number, m22?: number, m23?: number, m31?: number, m32?: number, m33?: number);
    private identity;
    set(m11?: number, m12?: number, m13?: number, m21?: number, m22?: number, m23?: number, m31?: number, m32?: number, m33?: number): this;
    copy(matrix: RotationMatrix): this;
    setFromEuler(euler: Euler): this;
    setFromQuaternion(q: Quaternion): this;
    multiply(m: RotationMatrix): this;
    rotateX(angle: number): this;
    rotateY(angle: number): this;
    rotateZ(angle: number): this;
    multiplyMatrices(a: RotationMatrix, b: RotationMatrix): RotationMatrix;
    normalize(matrix?: RotationMatrix): RotationMatrix;
    rotateByAxisAngle(targetRotationMatrix: RotationMatrix | undefined, axis: number[], angle: number): RotationMatrix;
}

declare global {
    interface DeviceOrientationEvent {
        webkitCompassHeading?: number;
        webkitCompassAccuracy?: number;
    }
}
interface DeviceOrientationOptions {
    type: DeviceOrientationType;
}
type DeviceOrientationType = 'world' | 'game';
type SensorType = 'orientation' | 'motion';
interface DeviceSensorStructure {
    orientation: DeviceSensorData;
    motion: DeviceSensorData;
}
interface DeviceSensorData {
    active: boolean;
    callbacks: SensorCallback[];
    data: any;
}
interface ScreenAcceleration {
    x: number;
    y: number;
    z: number;
}
interface ScreenRotation {
    alpha: number;
    beta: number;
    gamma: number;
}
type SensorCallback = () => void;
interface DevicePermissionState {
    orientation?: PermissionState;
    motion?: PermissionState;
}

export { DeviceMotion, DeviceOrientation, Euler, Quaternion, RotationMatrix, getDeviceMotion, getDeviceOrientation, requestPermission };
export type { DeviceOrientationOptions, DeviceOrientationType, DevicePermissionState, DeviceSensorData, DeviceSensorStructure, ScreenAcceleration, ScreenRotation, SensorCallback, SensorType };
