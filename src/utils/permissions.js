/**
 * Checks and requests camera permissions using the Permissions API.
 * @returns {Promise<boolean>} A promise that resolves to true if permission is granted, and false otherwise.
 */
export async function requestCameraPermissions() {
  if (!('permissions' in navigator)) {
    alert("Your browser does not support the Permissions API, but you can still proceed.");
    return true; // Fallback for older browsers
  }

  try {
    const status = await navigator.permissions.query({ name: 'camera' });

    if (status.state === 'granted' || status.state === 'prompt') {
      return true;
    }

    if (status.state === 'denied') {
      alert('Camera permission has been denied. Please enable it in your browser settings to use this feature.');
      return false;
    }
  } catch (error) {
    console.error("Error checking camera permissions:", error);
    alert("Could not check for camera permissions. Please ensure your browser is up to date.");
    return false;
  }
}