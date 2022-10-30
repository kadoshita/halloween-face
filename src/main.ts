import { Camera } from '@mediapipe/camera_utils';
import { FaceDetection, Results } from '@mediapipe/face_detection';

(async () => {
    const cameraSelect = <HTMLSelectElement>document.getElementById('camera-select');
    const overlayElement = <HTMLDivElement>document.getElementById('overlay-element');
    const videoElement = <HTMLVideoElement>document.getElementById('input-video');
    const canvasElement = <HTMLCanvasElement>document.getElementById('output-canvas');
    const canvasCtx = canvasElement.getContext('2d');

    function onResults(results: Results) {
        if (canvasCtx === null) {
            return;
        }
        // Draw the overlays.
        canvasCtx.save();
        canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
        canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
        if (results.detections.length > 0) {
            const height = 720 * results.detections[0].boundingBox.height * 1.5;
            const width = 1280 * results.detections[0].boundingBox.width * 1.5;
            overlayElement.style.height = `${height.toFixed()}px`;
            overlayElement.style.width = `${width.toFixed()}px`;
            overlayElement.style.top = `${(
                720 * results.detections[0].boundingBox.yCenter -
                height / 1.25
            ).toFixed()}px`;
            overlayElement.style.left = `${(1280 * results.detections[0].boundingBox.xCenter - width / 2).toFixed()}px`;
            overlayElement.style.fontSize = `${width.toFixed()}px`;
        }
        canvasCtx.restore();
    }

    const faceDetection = new FaceDetection({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4.1646425229/${file}`;
        },
    });
    faceDetection.setOptions({
        selfieMode: true,
        model: 'short',
        minDetectionConfidence: 0.5,
    });
    faceDetection.onResults(onResults);

    let camera = new Camera(videoElement, {
        onFrame: async () => {
            try {
                if (videoElement) {
                    await faceDetection.send({ image: videoElement });
                }
            } catch (error) {
                console.error(error);
            }
        },
        width: 1280,
        height: 720,
        facingMode: cameraSelect.value === 'user' ? 'user' : 'environment',
    });
    await camera.start();

    cameraSelect.addEventListener('change', async () => {
        camera.stop();
        camera = new Camera(videoElement, {
            onFrame: async () => {
                try {
                    if (videoElement) {
                        await faceDetection.send({ image: videoElement });
                    }
                } catch (error) {
                    console.error(error);
                }
            },
            width: 1280,
            height: 720,
            facingMode: cameraSelect.value === 'user' ? 'user' : 'environment',
        });
        await camera.start();
    });
})();
