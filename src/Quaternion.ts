import {degToRad} from "./Constants";
import {Euler, RotationMatrix} from "./index";

export class Quaternion {
	x: number;
	y: number;
	z: number;
	w: number;

	constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;
	}

	set(x: number = 0, y: number = 0, z: number = 0, w: number = 0): this {
		this.x = x;
		this.y = y;
		this.z = z;
		this.w = w;

		return this;
	}

	copy(q: Quaternion): this {
		this.x = q.x;
		this.y = q.y;
		this.z = q.z;
		this.w = q.w;

		return this
	}

	setFromEuler(euler: Euler): this {
		let _x_2, _y_2, _z_2;
		let cX, cY, cZ, sX, sY, sZ;

		euler = euler || new Euler();

		const _z = ( euler.alpha || 0 ) * degToRad;
		const _x = ( euler.beta || 0 ) * degToRad;
		const _y = ( euler.gamma || 0 ) * degToRad;

		_z_2 = _z / 2;
		_x_2 = _x / 2;
		_y_2 = _y / 2;

		cX = Math.cos( _x_2 );
		cY = Math.cos( _y_2 );
		cZ = Math.cos( _z_2 );
		sX = Math.sin( _x_2 );
		sY = Math.sin( _y_2 );
		sZ = Math.sin( _z_2 );

		this.set(
			sX * cY * cZ - cX * sY * sZ, // x
			cX * sY * cZ + sX * cY * sZ, // y
			cX * cY * sZ + sX * sY * cZ, // z
			cX * cY * cZ - sX * sY * sZ  // w
		);

		this.normalize();

		return this;
	}

	setFromRotationMatrix(matrix: RotationMatrix): this {
		const R = matrix.elements;

		this.set(
			0.5 * Math.sqrt( 1 + R[0] - R[4] - R[8] ) * Math.sign( R[7] - R[5] ), // x
			0.5 * Math.sqrt( 1 - R[0] + R[4] - R[8] ) * Math.sign( R[2] - R[6] ), // y
			0.5 * Math.sqrt( 1 - R[0] - R[4] + R[8] ) * Math.sign( R[3] - R[1] ), // z
			0.5 * Math.sqrt( 1 + R[0] + R[4] + R[8] )                             // w
		);

		return this;
	}

	multiply(quaternion: Quaternion): this {

		const outQuat = this.multiplyQuaternions( this, quaternion );
		this.copy( outQuat );

		return this;
	}

	rotateX(angle: number): this {
		const outQuaternion = this.rotateByAxisAngle(this, [1, 0, 0], angle)
		this.copy( outQuaternion );
		return this;
	}

	rotateY(angle: number): this {
		const outQuaternion = this.rotateByAxisAngle(this, [0, 1, 0], angle)
		this.copy( outQuaternion );
		return this;
	}

	rotateZ(angle: number): this {
		const outQuaternion = this.rotateByAxisAngle(this, [0, 0, 1], angle)
		this.copy( outQuaternion );
		return this;
	}

	multiplyQuaternions( a: Quaternion, b: Quaternion ): Quaternion {
		const multiplied = new Quaternion();

		const qax = a.x, qay = a.y, qaz = a.z, qaw = a.w;
		const qbx = b.x, qby = b.y, qbz = b.z, qbw = b.w;

		multiplied.set(
			qax * qbw + qaw * qbx + qay * qbz - qaz * qby, // x
			qay * qbw + qaw * qby + qaz * qbx - qax * qbz, // y
			qaz * qbw + qaw * qbz + qax * qby - qay * qbx, // z
			qaw * qbw - qax * qbx - qay * qby - qaz * qbz  // w
		);

		return multiplied;
	}

	normalize(q?: Quaternion): Quaternion {
		if (!q) {
			q = this;
		}

		var len = Math.sqrt( q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w );

		if ( len === 0 ) {

			q.x = 0;
			q.y = 0;
			q.z = 0;
			q.w = 1;

		} else {

			len = 1 / len;

			q.x *= len;
			q.y *= len;
			q.z *= len;
			q.w *= len;

		}

		return q;
	}

	rotateByAxisAngle( targetQuaternion: Quaternion, axis: number[], angle: number): Quaternion {
		const transformQuaternion = new Quaternion();

		const halfAngle = ( angle || 0 ) / 2;
		const sA = Math.sin( halfAngle );

		transformQuaternion.set(
			( axis[ 0 ] || 0 ) * sA, // x
			( axis[ 1 ] || 0 ) * sA, // y
			( axis[ 2 ] || 0 ) * sA, // z
			Math.cos( halfAngle )    // w
		);

		// Multiply quaternion by q
		const outputQuaternion = this.multiplyQuaternions( targetQuaternion, transformQuaternion );

		return this.normalize( outputQuaternion );

	}

}

