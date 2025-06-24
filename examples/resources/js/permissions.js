import { requestPermission } from '../../../dist/fulltilt.min.js';

export const getPermissions = async (permissionType) => {
	const permission = await requestPermission(permissionType);
	return new Promise((resolve) => {
		const resolvedPermission = resolvePermissions(permission);
		switch (resolvedPermission) {
			case 'granted':
				return resolve(true);
			case 'denied':
				return resolve(false);
			default: // 'prompt'
				const dialog = document.querySelector('dialog#permission');
				const requestButton = document.getElementById('request');
				const cancelButton = document.getElementById('cancel');

				requestButton.addEventListener('click', async () => {
					const innerPermission = await requestPermission(permissionType);
					const resolvedInnerPermission = resolvePermissions(innerPermission);
					dialog.requestClose(resolvedInnerPermission);
				});

				cancelButton.addEventListener('click', () => {
					dialog.requestClose(false);
				})

				dialog.addEventListener('close', async () => {
					return resolve(dialog.returnValue === 'granted')
				});
				dialog.showModal();
		}
	});
};

function resolvePermissions(permission) {
	if (permission.orientation && !permission.motion) {
		return permission.orientation;
	}
	if (!permission.orientation && permission.motion) {
		return permission.motion;
	}
	if (permission.orientation === 'prompt' || permission.motion === 'prompt') {
		return 'prompt';
	}
	if (permission.orientation === 'granted' || permission.motion === 'granted') {
		return 'granted';
	}
	return 'denied';
}
