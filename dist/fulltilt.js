/** @internal */
const M_PI = Math.PI;
/** @internal */
const M_PI_2 = M_PI / 2;
/** @internal */
const M_2_PI = 2 * M_PI;
/** @internal */
const degToRad = M_PI / 180;
/** @internal */
const radToDeg = 180 / M_PI;
/** @internal */
const SCREEN_ROTATION_90 = M_PI_2;
/** @internal */
const SCREEN_ROTATION_180 = M_PI;
/** @internal */
const SCREEN_ROTATION_270 = M_2_PI / 3;
/** @internal */
const SCREEN_ROTATION_MINUS_90 = -M_PI_2;

/** @internal */
function handleScreenOrientationChange() {
    const state = State.instance;
    state.screenOrientationAngle = (window.screen.orientation.angle || 0) * degToRad;
}
/** @internal */
const handleDeviceOrientationChange = (event) => {
    const state = State.instance;
    state.sensors.orientation.data = event;
    state.sensors.orientation.callbacks.forEach(cb => cb());
};
/** @internal */
const handleDeviceMotionChange = (event) => {
    const state = State.instance;
    state.sensors.motion.data = event;
    state.sensors.motion.callbacks.forEach(cb => cb());
};

class State {
    static _instance;
    screenOrientationAngle;
    sensors;
    constructor() {
        this.screenOrientationAngle = window.screen.orientation.angle * degToRad;
        this.sensors = {
            orientation: {
                active: false,
                callbacks: [],
                data: undefined
            },
            motion: {
                active: false,
                callbacks: [],
                data: undefined
            }
        };
        if (!window.isSecureContext) {
            throw new Error('Device Orientation and Motion sensors are only available in a secure context.');
        }
        window.screen.orientation.addEventListener('change', handleScreenOrientationChange, false);
    }
    static get instance() {
        if (!this._instance) {
            this._instance = new State();
        }
        return this._instance;
    }
}

async function getDeviceOrientation(options) {
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
    }
    catch (e) {
        control.stop();
        console.error('DeviceOrientation is not supported', e);
        return null;
    }
    return control;
}
async function getDeviceMotion() {
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
    }
    catch (e) {
        control.stop();
        console.error('DeviceMotion is not supported', e);
        return null;
    }
    return control;
}
async function requestPermission(type) {
    const deviceState = {};
    try {
        if (!type || type === 'orientation') {
            if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
                deviceState.orientation = 'granted';
            }
            else {
                deviceState.orientation = await DeviceOrientationEvent.requestPermission();
            }
        }
    }
    catch (e) {
        const err = e;
        if (err.name === 'NotAllowedError') {
            deviceState.orientation = 'prompt';
        }
    }
    try {
        if ((!type || type === 'motion') && typeof DeviceMotionEvent.requestPermission === 'function') {
            if (typeof DeviceMotionEvent.requestPermission !== 'function') {
                deviceState.motion = 'granted';
            }
            else {
                deviceState.motion = await DeviceMotionEvent.requestPermission();
            }
        }
    }
    catch (e) {
        const err = e;
        if (err.name === 'NotAllowedError') {
            deviceState.motion = 'prompt';
        }
    }
    return deviceState;
}
/** @internal */
async function sensorCheck(sensorRootObj) {
    return new Promise((resolve, reject) => {
        const runCheck = (tries) => {
            setTimeout(() => {
                if (sensorRootObj && sensorRootObj.data) {
                    resolve(null);
                }
                else if (tries >= 20) {
                    reject();
                }
                else {
                    runCheck(++tries);
                }
            }, 50);
        };
        runCheck(0);
    });
}

// noinspection JSSuspiciousNameCombination
class DeviceMotion {
    state = State.instance;
    constructor() {
    }
    start(callback) {
        if (callback && typeof callback === "function") {
            this.state.sensors.motion.callbacks.push(callback);
        }
        if (!this.state.sensors.motion.active) {
            window.addEventListener('devicemotion', handleDeviceMotionChange, false);
            this.state.sensors.motion.active = true;
        }
    }
    stop() {
        if (this.state.sensors.motion.active) {
            window.removeEventListener('devicemotion', handleDeviceMotionChange, false);
            this.state.sensors.motion.active = false;
        }
    }
    listen(callback) {
        if (callback && typeof callback === 'function') {
            this.start(callback);
        }
    }
    getScreenAdjustedAcceleration() {
        const accData = this.state.sensors.motion.data && this.state.sensors.motion.data.acceleration
            ? this.state.sensors.motion.data.acceleration
            : { x: 0, y: 0, z: 0 };
        const screenAccData = { x: 0, y: 0, z: 0 };
        switch (this.state.screenOrientationAngle) {
            case SCREEN_ROTATION_90:
                screenAccData.x = -accData.y;
                screenAccData.y = accData.x;
                break;
            case SCREEN_ROTATION_180:
                screenAccData.x = -accData.x;
                screenAccData.y = -accData.y;
                break;
            case SCREEN_ROTATION_270:
            case SCREEN_ROTATION_MINUS_90:
                screenAccData.x = accData.y;
                screenAccData.y = -accData.x;
                break;
            default: // SCREEN_ROTATION_0
                screenAccData.x = accData.x;
                screenAccData.y = accData.y;
                break;
        }
        screenAccData.z = accData.z;
        return screenAccData;
    }
    getScreenAdjustedAccelerationIncludingGravity() {
        const accGData = this.state.sensors.motion.data
            && this.state.sensors.motion.data.accelerationIncludingGravity
            ? this.state.sensors.motion.data.accelerationIncludingGravity
            : { x: 0, y: 0, z: 0 };
        const screenAccGData = { x: 0, y: 0, z: 0 };
        switch (screen.orientation.angle) {
            case SCREEN_ROTATION_90:
                screenAccGData.x = -accGData.y;
                screenAccGData.y = accGData.x;
                break;
            case SCREEN_ROTATION_180:
                screenAccGData.x = -accGData.x;
                screenAccGData.y = -accGData.y;
                break;
            case SCREEN_ROTATION_270:
            case SCREEN_ROTATION_MINUS_90:
                screenAccGData.x = accGData.y;
                screenAccGData.y = -accGData.x;
                break;
            default: // SCREEN_ROTATION_0
                screenAccGData.x = accGData.x;
                screenAccGData.y = accGData.y;
                break;
        }
        screenAccGData.z = accGData.z;
        return screenAccGData;
    }
    getScreenAdjustedRotationRate() {
        const rotRateData = this.state.sensors.motion.data && this.state.sensors.motion.data.rotationRate
            ? this.state.sensors.motion.data.rotationRate
            : { alpha: 0, beta: 0, gamma: 0 };
        const screenRotRateData = { alpha: 0, beta: 0, gamma: 0 };
        switch (screen.orientation.angle) {
            case SCREEN_ROTATION_90:
                screenRotRateData.beta = -rotRateData.gamma;
                screenRotRateData.gamma = rotRateData.beta;
                break;
            case SCREEN_ROTATION_180:
                screenRotRateData.beta = -rotRateData.beta;
                screenRotRateData.gamma = -rotRateData.gamma;
                break;
            case SCREEN_ROTATION_270:
            case SCREEN_ROTATION_MINUS_90:
                screenRotRateData.beta = rotRateData.gamma;
                screenRotRateData.gamma = -rotRateData.beta;
                break;
            default: // SCREEN_ROTATION_0
                screenRotRateData.beta = rotRateData.beta;
                screenRotRateData.gamma = rotRateData.gamma;
                break;
        }
        screenRotRateData.alpha = rotRateData.alpha;
        return screenRotRateData;
    }
    getLastRawEventData() {
        return this.state.sensors.motion.data || {};
    }
}

class DeviceOrientation {
    state = State.instance;
    alphaOffsetScreen = 0;
    alphaOffsetDevice;
    tries = 0;
    maxTries = 200;
    successCount = 0;
    successThreshold = 30;
    constructor(options) {
        if (options?.type === 'world') {
            const setCompassAlphaOffset = (evt) => {
                if (!evt.absolute && evt.webkitCompassAccuracy
                    && +evt.webkitCompassAccuracy >= 0 && +evt.webkitCompassAccuracy < 50) {
                    this.alphaOffsetDevice = new Euler(evt.webkitCompassHeading, 0, 0);
                    this.alphaOffsetDevice.rotateZ(this.state.screenOrientationAngle);
                    this.alphaOffsetScreen = this.state.screenOrientationAngle;
                    // Discard first {successThreshold} responses while a better compass lock is found by UA
                    if (++this.successCount >= this.successThreshold) {
                        window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
                        return;
                    }
                }
                if (++this.tries >= this.maxTries) {
                    window.removeEventListener('deviceorientation', setCompassAlphaOffset, false);
                }
            };
            window.addEventListener('deviceorientation', setCompassAlphaOffset, false);
        }
        else {
            const setGameAlphaOffset = (evt) => {
                if (evt.alpha !== null) { // do regardless of whether 'evt.absolute' is also true
                    this.alphaOffsetDevice = new Euler(evt.alpha, 0, 0);
                    this.alphaOffsetDevice.rotateZ(-screen.orientation.angle);
                    // Discard first {successThreshold} responses while a better compass lock is found by UA
                    if (++this.successCount >= this.successThreshold) {
                        window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
                        return;
                    }
                }
                if (++this.tries >= this.maxTries) {
                    window.removeEventListener('deviceorientation', setGameAlphaOffset, false);
                }
            };
            window.addEventListener('deviceorientation', setGameAlphaOffset, false);
        }
    }
    start(callback) {
        if (callback && typeof callback === 'function') {
            this.state.sensors.orientation.callbacks.push(callback);
        }
        if (!this.state.sensors.orientation.active) {
            window.addEventListener('deviceorientation', handleDeviceOrientationChange, false);
            this.state.sensors.orientation.active = true;
        }
    }
    stop() {
        if (this.state.sensors.orientation.active) {
            window.removeEventListener('deviceorientation', handleDeviceOrientationChange, false);
            this.state.sensors.orientation.active = false;
        }
    }
    listen(callback) {
        this.start(callback);
    }
    getFixedFrameQuaternion() {
        const quaternion = new Quaternion();
        const euler = this.getFixedFrameEuler();
        quaternion.setFromEuler(euler);
        return quaternion;
    }
    getScreenAdjustedQuaternion() {
        const quaternion = this.getFixedFrameQuaternion();
        // Automatically apply screen orientation transform
        quaternion.rotateZ(-this.state.screenOrientationAngle);
        return quaternion;
    }
    getFixedFrameMatrix() {
        const euler = this.getFixedFrameEuler();
        const matrix = new RotationMatrix();
        matrix.setFromEuler(euler);
        return matrix;
    }
    getScreenAdjustedMatrix() {
        const matrix = this.getFixedFrameMatrix();
        // Automatically apply screen orientation transform
        matrix.rotateZ(M_2_PI - this.state.screenOrientationAngle);
        return matrix;
    }
    getFixedFrameEuler() {
        const euler = new Euler();
        const matrix = new RotationMatrix();
        const orientationData = this.state.sensors.orientation.data || { alpha: 0, beta: 0, gamma: 0 };
        let adjustedAlpha = orientationData.alpha;
        if (this.alphaOffsetDevice) {
            matrix.setFromEuler(this.alphaOffsetDevice);
            matrix.rotateZ(-this.alphaOffsetScreen);
            euler.setFromRotationMatrix(matrix);
            if (euler.alpha < 0) {
                euler.alpha += 360;
            }
            euler.alpha %= 360;
            adjustedAlpha -= euler.alpha;
        }
        return euler.set(adjustedAlpha, orientationData.beta, orientationData.gamma);
    }
    getScreenAdjustedEuler() {
        const euler = new Euler();
        const matrix = this.getScreenAdjustedMatrix();
        euler.setFromRotationMatrix(matrix);
        return euler;
    }
    getLastRawEventData() {
        return this.state.sensors.orientation.data || {};
    }
}

class Euler {
    alpha;
    beta;
    gamma;
    constructor(alpha = 0, beta = 0, gamma = 0) {
        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;
    }
    set(alpha, beta, gamma) {
        this.alpha = alpha;
        this.beta = beta;
        this.gamma = gamma;
        return this;
    }
    copy(input) {
        this.alpha = input.alpha;
        this.beta = input.beta;
        this.gamma = input.gamma;
        return this;
    }
    setFromRotationMatrix(matrix) {
        const R = matrix.elements;
        let _alpha, _beta, _gamma;
        if (R[8] > 0) { // cos(beta) > 0
            _alpha = Math.atan2(-R[1], R[4]);
            _beta = Math.asin(R[7]); // beta (-pi/2, pi/2)
            _gamma = Math.atan2(-R[6], R[8]); // gamma (-pi/2, pi/2)
        }
        else if (R[8] < 0) { // cos(beta) < 0
            _alpha = Math.atan2(R[1], -R[4]);
            _beta = -Math.asin(R[7]);
            _beta += (_beta >= 0) ? -M_PI : M_PI; // beta [-pi,-pi/2) U (pi/2,pi)
            _gamma = Math.atan2(R[6], -R[8]); // gamma (-pi/2, pi/2)
        }
        else { // R[8] == 0
            if (R[6] > 0) { // cos(gamma) == 0, cos(beta) > 0
                _alpha = Math.atan2(-R[1], R[4]);
                _beta = Math.asin(R[7]); // beta [-pi/2, pi/2]
                _gamma = -M_PI_2; // gamma = -pi/2
            }
            else if (R[6] < 0) { // cos(gamma) == 0, cos(beta) < 0
                _alpha = Math.atan2(R[1], -R[4]);
                _beta = -Math.asin(R[7]);
                _beta += (_beta >= 0) ? -M_PI : M_PI; // beta [-pi,-pi/2) U (pi/2,pi)
                _gamma = -M_PI_2; // gamma = -pi/2
            }
            else { // R[6] == 0, cos(beta) == 0
                // gimbal lock discontinuity
                _alpha = Math.atan2(R[3], R[0]);
                _beta = (R[7] > 0) ? M_PI_2 : -M_PI_2; // beta = +-pi/2
                _gamma = 0; // gamma = 0
            }
        }
        // alpha is in [-pi, pi], make sure it is in [0, 2*pi).
        if (_alpha < 0) {
            _alpha += M_2_PI; // alpha [0, 2*pi)
        }
        // Convert to degrees
        _alpha *= radToDeg;
        _beta *= radToDeg;
        _gamma *= radToDeg;
        // apply derived euler angles to current object
        this.set(_alpha, _beta, _gamma);
        return this;
    }
    setFromQuaternion(q) {
        let _alpha, _beta, _gamma;
        const sqw = q.w * q.w;
        const sqx = q.x * q.x;
        const sqy = q.y * q.y;
        const sqz = q.z * q.z;
        const unitLength = sqw + sqx + sqy + sqz; // Normalised == 1, otherwise correction divisor.
        const wxyz = q.w * q.x + q.y * q.z;
        const epsilon = 1e-6; // rounding factor
        if (wxyz > (0.5 - epsilon) * unitLength) {
            _alpha = 2 * Math.atan2(q.y, q.w);
            _beta = M_PI_2;
            _gamma = 0;
        }
        else if (wxyz < (-0.5 + epsilon) * unitLength) {
            _alpha = -2 * Math.atan2(q.y, q.w);
            _beta = -M_PI_2;
            _gamma = 0;
        }
        else {
            const aX = sqw - sqx + sqy - sqz;
            const aY = 2 * (q.w * q.z - q.x * q.y);
            const gX = sqw - sqx - sqy + sqz;
            const gY = 2 * (q.w * q.y - q.x * q.z);
            if (gX > 0) {
                _alpha = Math.atan2(aY, aX);
                _beta = Math.asin(2 * wxyz / unitLength);
                _gamma = Math.atan2(gY, gX);
            }
            else {
                _alpha = Math.atan2(-aY, -aX);
                _beta = -Math.asin(2 * wxyz / unitLength);
                _beta += _beta < 0 ? M_PI : -M_PI;
                _gamma = Math.atan2(-gY, -gX);
            }
        }
        // alpha is in [-pi, pi], make sure it is in [0, 2*pi).
        if (_alpha < 0) {
            _alpha += M_2_PI; // alpha [0, 2*pi)
        }
        // Convert to degrees
        _alpha *= radToDeg;
        _beta *= radToDeg;
        _gamma *= radToDeg;
        // apply derived euler angles to current object
        this.set(_alpha, _beta, _gamma);
        return this;
    }
    rotateX(angle) {
        return this.rotateByAxisAngle(this, [1, 0, 0], angle);
    }
    rotateY(angle) {
        return this.rotateByAxisAngle(this, [0, 1, 0], angle);
    }
    rotateZ(angle) {
        return this.rotateByAxisAngle(this, [0, 0, 1], angle);
    }
    rotateByAxisAngle(targetEuler, axis, angle) {
        const _matrix = new RotationMatrix()
            .setFromEuler(targetEuler)
            .rotateByAxisAngle(undefined, axis, angle);
        targetEuler.setFromRotationMatrix(_matrix);
        return targetEuler;
    }
}

class Quaternion {
    x;
    y;
    z;
    w;
    constructor(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }
    set(x = 0, y = 0, z = 0, w = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        return this;
    }
    copy(q) {
        this.x = q.x;
        this.y = q.y;
        this.z = q.z;
        this.w = q.w;
        return this;
    }
    setFromEuler(euler) {
        let _x_2, _y_2, _z_2;
        let cX, cY, cZ, sX, sY, sZ;
        euler = euler || new Euler();
        const _z = (euler.alpha || 0) * degToRad;
        const _x = (euler.beta || 0) * degToRad;
        const _y = (euler.gamma || 0) * degToRad;
        _z_2 = _z / 2;
        _x_2 = _x / 2;
        _y_2 = _y / 2;
        cX = Math.cos(_x_2);
        cY = Math.cos(_y_2);
        cZ = Math.cos(_z_2);
        sX = Math.sin(_x_2);
        sY = Math.sin(_y_2);
        sZ = Math.sin(_z_2);
        this.set(sX * cY * cZ - cX * sY * sZ, // x
        cX * sY * cZ + sX * cY * sZ, // y
        cX * cY * sZ + sX * sY * cZ, // z
        cX * cY * cZ - sX * sY * sZ // w
        );
        this.normalize();
        return this;
    }
    setFromRotationMatrix(matrix) {
        const R = matrix.elements;
        this.set(0.5 * Math.sqrt(1 + R[0] - R[4] - R[8]) * Math.sign(R[7] - R[5]), // x
        0.5 * Math.sqrt(1 - R[0] + R[4] - R[8]) * Math.sign(R[2] - R[6]), // y
        0.5 * Math.sqrt(1 - R[0] - R[4] + R[8]) * Math.sign(R[3] - R[1]), // z
        0.5 * Math.sqrt(1 + R[0] + R[4] + R[8]) // w
        );
        return this;
    }
    multiply(quaternion) {
        const outQuat = this.multiplyQuaternions(this, quaternion);
        this.copy(outQuat);
        return this;
    }
    rotateX(angle) {
        const outQuaternion = this.rotateByAxisAngle(this, [1, 0, 0], angle);
        this.copy(outQuaternion);
        return this;
    }
    rotateY(angle) {
        const outQuaternion = this.rotateByAxisAngle(this, [0, 1, 0], angle);
        this.copy(outQuaternion);
        return this;
    }
    rotateZ(angle) {
        const outQuaternion = this.rotateByAxisAngle(this, [0, 0, 1], angle);
        this.copy(outQuaternion);
        return this;
    }
    multiplyQuaternions(a, b) {
        const multiplied = new Quaternion();
        const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
        const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;
        multiplied.set(qax * qbw + qaw * qbx + qay * qbz - qaz * qby, // x
        qay * qbw + qaw * qby + qaz * qbx - qax * qbz, // y
        qaz * qbw + qaw * qbz + qax * qby - qay * qbx, // z
        qaw * qbw - qax * qbx - qay * qby - qaz * qbz // w
        );
        return multiplied;
    }
    normalize(q) {
        if (!q) {
            q = this;
        }
        var len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
        if (len === 0) {
            q.x = 0;
            q.y = 0;
            q.z = 0;
            q.w = 1;
        }
        else {
            len = 1 / len;
            q.x *= len;
            q.y *= len;
            q.z *= len;
            q.w *= len;
        }
        return q;
    }
    rotateByAxisAngle(targetQuaternion, axis, angle) {
        const transformQuaternion = new Quaternion();
        const halfAngle = (angle || 0) / 2;
        const sA = Math.sin(halfAngle);
        transformQuaternion.set((axis[0] || 0) * sA, // x
        (axis[1] || 0) * sA, // y
        (axis[2] || 0) * sA, // z
        Math.cos(halfAngle) // w
        );
        // Multiply quaternion by q
        const outputQuaternion = this.multiplyQuaternions(targetQuaternion, transformQuaternion);
        return this.normalize(outputQuaternion);
    }
}

class RotationMatrix {
    elements = new Float32Array(9);
    constructor(m11 = 1, m12 = 0, m13 = 0, m21 = 0, m22 = 1, m23 = 0, m31 = 0, m32 = 0, m33 = 1) {
        this.set(m11, m12, m13, m21, m22, m23, m31, m32, m33);
    }
    identity() {
        this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);
        return this;
    }
    ;
    set(m11 = 1, m12 = 0, m13 = 0, m21 = 0, m22 = 1, m23 = 0, m31 = 0, m32 = 0, m33 = 1) {
        this.elements[0] = m11;
        this.elements[1] = m12;
        this.elements[2] = m13;
        this.elements[3] = m21;
        this.elements[4] = m22;
        this.elements[5] = m23;
        this.elements[6] = m31;
        this.elements[7] = m32;
        this.elements[8] = m33;
        return this;
    }
    copy(matrix) {
        this.elements[0] = matrix.elements[0];
        this.elements[1] = matrix.elements[1];
        this.elements[2] = matrix.elements[2];
        this.elements[3] = matrix.elements[3];
        this.elements[4] = matrix.elements[4];
        this.elements[5] = matrix.elements[5];
        this.elements[6] = matrix.elements[6];
        this.elements[7] = matrix.elements[7];
        this.elements[8] = matrix.elements[8];
        return this;
    }
    setFromEuler(euler) {
        euler = euler || {};
        const _z = (euler.alpha || 0) * degToRad;
        const _x = (euler.beta || 0) * degToRad;
        const _y = (euler.gamma || 0) * degToRad;
        const cX = Math.cos(_x);
        const cY = Math.cos(_y);
        const cZ = Math.cos(_z);
        const sX = Math.sin(_x);
        const sY = Math.sin(_y);
        const sZ = Math.sin(_z);
        //
        // ZXY-ordered rotation matrix construction.
        //
        this.set(cZ * cY - sZ * sX * sY, // 1,1
        -cX * sZ, // 1,2
        cY * sZ * sX + cZ * sY, // 1,3
        cY * sZ + cZ * sX * sY, // 2,1
        cZ * cX, // 2,2
        sZ * sY - cZ * cY * sX, // 2,3
        -cX * sY, // 3,1
        sX, // 3,2
        cX * cY // 3,3
        );
        this.normalize();
        return this;
    }
    setFromQuaternion(q) {
        const sqw = q.w * q.w;
        const sqx = q.x * q.x;
        const sqy = q.y * q.y;
        const sqz = q.z * q.z;
        this.set(sqw + sqx - sqy - sqz, // 1,1
        2 * (q.x * q.y - q.w * q.z), // 1,2
        2 * (q.x * q.z + q.w * q.y), // 1,3
        2 * (q.x * q.y + q.w * q.z), // 2,1
        sqw - sqx + sqy - sqz, // 2,2
        2 * (q.y * q.z - q.w * q.x), // 2,3
        2 * (q.x * q.z - q.w * q.y), // 3,1
        2 * (q.y * q.z + q.w * q.x), // 3,2
        sqw - sqx - sqy + sqz // 3,3
        );
        return this;
    }
    multiply(m) {
        const outMatrix = this.multiplyMatrices(this, m);
        this.copy(outMatrix);
        return this;
    }
    rotateX(angle) {
        const outMatrix = this.rotateByAxisAngle(this, [1, 0, 0], angle);
        this.copy(outMatrix);
        return this;
    }
    rotateY(angle) {
        const outMatrix = this.rotateByAxisAngle(this, [0, 1, 0], angle);
        this.copy(outMatrix);
        return this;
    }
    rotateZ(angle) {
        const outMatrix = this.rotateByAxisAngle(this, [0, 0, 1], angle);
        this.copy(outMatrix);
        return this;
    }
    multiplyMatrices(a, b) {
        const matrix = new RotationMatrix();
        const aE = a.elements;
        const bE = b.elements;
        matrix.set(aE[0] * bE[0] + aE[1] * bE[3] + aE[2] * bE[6], aE[0] * bE[1] + aE[1] * bE[4] + aE[2] * bE[7], aE[0] * bE[2] + aE[1] * bE[5] + aE[2] * bE[8], aE[3] * bE[0] + aE[4] * bE[3] + aE[5] * bE[6], aE[3] * bE[1] + aE[4] * bE[4] + aE[5] * bE[7], aE[3] * bE[2] + aE[4] * bE[5] + aE[5] * bE[8], aE[6] * bE[0] + aE[7] * bE[3] + aE[8] * bE[6], aE[6] * bE[1] + aE[7] * bE[4] + aE[8] * bE[7], aE[6] * bE[2] + aE[7] * bE[5] + aE[8] * bE[8]);
        return matrix;
    }
    ;
    normalize(matrix = this) {
        const R = matrix.elements;
        // Calculate matrix determinant
        const determinant = R[0] * R[4] * R[8] - R[0] * R[5] * R[7] - R[1] * R[3] * R[8] + R[1] * R[5] * R[6] + R[2] * R[3] * R[7] - R[2] * R[4] * R[6];
        // Normalize matrix values
        R[0] /= determinant;
        R[1] /= determinant;
        R[2] /= determinant;
        R[3] /= determinant;
        R[4] /= determinant;
        R[5] /= determinant;
        R[6] /= determinant;
        R[7] /= determinant;
        R[8] /= determinant;
        matrix.elements = R;
        return matrix;
    }
    rotateByAxisAngle(targetRotationMatrix = this, axis, angle) {
        let outputMatrix;
        const transformMatrix = new RotationMatrix();
        let sA, cA;
        let validAxis = false;
        transformMatrix.identity(); // reset transform matrix
        sA = Math.sin(angle);
        cA = Math.cos(angle);
        if (axis[0] === 1 && axis[1] === 0 && axis[2] === 0) { // x
            validAxis = true;
            transformMatrix.elements[4] = cA;
            transformMatrix.elements[5] = -sA;
            transformMatrix.elements[7] = sA;
            transformMatrix.elements[8] = cA;
        }
        else if (axis[1] === 1 && axis[0] === 0 && axis[2] === 0) { // y
            validAxis = true;
            transformMatrix.elements[0] = cA;
            transformMatrix.elements[2] = sA;
            transformMatrix.elements[6] = -sA;
            transformMatrix.elements[8] = cA;
        }
        else if (axis[2] === 1 && axis[0] === 0 && axis[1] === 0) { // z
            validAxis = true;
            transformMatrix.elements[0] = cA;
            transformMatrix.elements[1] = -sA;
            transformMatrix.elements[3] = sA;
            transformMatrix.elements[4] = cA;
        }
        if (validAxis) {
            outputMatrix = this.multiplyMatrices(targetRotationMatrix, transformMatrix);
            outputMatrix = this.normalize(outputMatrix);
        }
        else {
            outputMatrix = targetRotationMatrix;
        }
        return outputMatrix;
    }
    ;
}

export { DeviceMotion, DeviceOrientation, Euler, Quaternion, RotationMatrix, getDeviceMotion, getDeviceOrientation, requestPermission };
