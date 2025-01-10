import * as faceapi from 'face-api.js'
import { ref } from 'vue'

interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

export default function useFaceDetection() {
    const video = ref()
    const canvas = ref()
    let canvasContext: CanvasRenderingContext2D

    const deviceList: any = ref()
    const selectedDevice = ref()
    const stream = ref()
    const faceMatcher = ref()

    const treineServe = ref(false)
    const distanceThreshold = ref(0.6)

    const loading = ref(false)

    const faceMarkInterval = ref()

    const imageMarge = 125;
    const offset = 25;

    const TinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions()

    onMounted(async () => {
        console.log('start composable...')
        loading.value = true
        //
        await getVideoDevices()
        await startVideo()
        await loadModels()

        const treineServeData = await $fetch('/api/treine')
        distanceThreshold.value = treineServeData.distanceThreshold
        if ('faceMatcherJson' in treineServeData) {
            await loadFaceLabelJSON(treineServeData.faceMatcherJson)
            treineServe.value = true
        }
        // carrega o modelo de reconhecimento facial
        await faceapi.detectSingleFace(video.value, TinyFaceDetectorOptions)
        //
        loading.value = false
    })

    onUnmounted(() => {
        closeVideo()
    })

    const getCutImage = (box: Box) => {
        const { x, y, width, height } = box;
        return {
            x: x - imageMarge,
            y: y - (imageMarge + offset),
            width: width + (2 * imageMarge),
            height: height + (2 * (imageMarge))
        }
    }

    const getVideoDevices = async () => {
        console.log('Getting video devices...')
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            deviceList.value = devices.filter(device => device.kind === 'videoinput')
            return deviceList.value
        } catch (error) {
            console.error('Error getting video devices:', error)
            return []
        }
    }

    const startVideo = async (deviceId = null) => {
        console.log('Starting video...')
        try {
            if (deviceList.value.length === 0) {
                console.error('No video devices found')
                return false
            }

            if (deviceId) {
                selectedDevice.value = deviceId
            } else {
                selectedDevice.value = localStorage.getItem('selectedDevice') || ''
            }

            const constraints: any = selectedDevice.value ? { deviceId: selectedDevice.value } : true;

            stream.value = await navigator.mediaDevices.getUserMedia({ video: constraints })
            if (video.value) {
                video.value.srcObject = stream.value
                const stream_settings = stream.value.getVideoTracks()[0].getSettings();
                // Set the canvas with the same size of the video
                if (canvas.value) {
                    canvas.value.width = stream_settings.width;
                    canvas.value.height = stream_settings.height;
                    canvasContext = canvas.value.getContext('2d')
                } else {
                    console.error('Canvas not seted')
                }
                // Set the last used device id
                if (selectedDevice.value) {
                    localStorage.setItem('selectedDevice', selectedDevice.value);
                }
            } else {
                console.error('Video not seted')
            }
        } catch (error) {
            console.error('Error starting video:', error)
        }
    }

    const loadModels = async () => {
        console.log('Loading models...')
        try {
            await Promise.all([
                faceapi.nets.faceLandmark68Net.loadFromUri('/weights'),
                faceapi.nets.faceRecognitionNet.loadFromUri('/weights'),
                faceapi.nets.faceExpressionNet.loadFromUri('/weights'),
                faceapi.nets.ssdMobilenetv1.loadFromUri('/weights'),
                faceapi.nets.tinyFaceDetector.loadFromUri('/weights'),
                faceapi.nets.mtcnn.loadFromUri('/weights')
            ])
            console.log('Models loaded')
        } catch (error) {
            console.error('Error loading models:', error)
        }
    }

    const loadFaceLabelJSON = async (labels: any) => {
        console.log('Loading face label JSON...')
        try {
            faceMatcher.value = faceapi.FaceMatcher.fromJSON(labels)
        } catch (error) {
            console.error('Error loading face matcher:', error)
        }
    }

    const markFacePlay = () => {
        const timeRefresh = 200
        if (!faceMarkInterval.value) {
            console.log('Marking face...')
            faceMarkInterval.value = setInterval(() => {
                markFace()
            }, timeRefresh)
        } else {
            console.log('Stop marking face...')
            clearInterval(faceMarkInterval.value);
            faceMarkInterval.value = '';
            setTimeout(() => {
                canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height)
            }, timeRefresh)
        }
    }

    const markFace = async () => {
        const detection = await faceapi
            .detectSingleFace(video.value, TinyFaceDetectorOptions)
            .withFaceLandmarks();
        if (detection) {
            // Clear previous drawings
            canvasContext.clearRect(0, 0, canvas.value.width, canvas.value.height);
            // mark face
            const resizedDetections = faceapi.resizeResults(detection, { width: canvas.value.width, height: canvas.value.height })
            faceapi.draw.drawDetections(canvas.value, resizedDetections)
        }
    }

    const getFaceImage = (box: any) => {
        console.log('Cut face of image...')
        const cut = getCutImage(box);
        const canvasFace = document.createElement('canvas');
        canvasFace.width = cut.width;
        canvasFace.height = cut.height;
        canvasFace.style.display = 'none';

        const context: any = canvasFace.getContext('2d');
        context.drawImage(video.value, cut.x, cut.y, cut.width, cut.height, 0, 0, cut.width, cut.height);
        return canvasFace.toDataURL('image/png');
    }

    const facialIdentification = async () => {
        console.log('Processing image...')
        if (stream.value) {
            loading.value = true
            const singleResult = await faceapi
                .detectSingleFace(video.value)
                .withFaceLandmarks()
                .withFaceExpressions()
                .withFaceDescriptor()

            if (singleResult) {
                const bestMatch = faceMatcher.value.findBestMatch(singleResult.descriptor, distanceThreshold.value)
                if (bestMatch.label !== 'unknown') {
                    const expressions: any = singleResult.expressions
                    // get the expression with highest confidence
                    const expressioUser = Object.keys(singleResult.expressions).reduce((a: any, b: any) => expressions[a] > expressions[b] ? a : b);
                    // get the face image
                    const imageFace = getFaceImage(singleResult.detection.box)

                    loading.value = false
                    return { bestMatch, expressioUser, imageFace, success: true }
                } else {

                    loading.value = false
                    return { message: "Não estou reconhecendo... Tente ficar parado.", success: false }
                }
            } else {
                loading.value = false
                return { message: "Não foi encontrado rosto da imagem!", success: false }
            }
        }
    }

    const getImageFace = async () => {
        console.log('Processing image...')
        if (stream.value) {
            loading.value = true
            const singleResult = await faceapi
                .detectSingleFace(video.value, new faceapi.MtcnnOptions())
                .withFaceLandmarks()

            if (singleResult) {
                const imageFace = getFaceImage(singleResult.detection.box)
                loading.value = false
                return { imageFace, success: true }
            } else {
                loading.value = false
                return { message: "Não foi encontrado rosto da imagem!", success: false }
            }
        }
    }

    const closeVideo = () => {
        if (stream.value) {
            stream.value.getTracks().forEach((track: any) => {
                track.stop()
            })
        }
        if (faceMarkInterval.value) {
            clearInterval(faceMarkInterval.value);
        }
    }

    return {
        video,
        canvas,
        loading,
        treineServe,
        deviceList,
        selectedDevice,
        getVideoDevices,
        startVideo,
        loadFaceLabelJSON,
        markFacePlay,
        facialIdentification,
        getImageFace
    }
}