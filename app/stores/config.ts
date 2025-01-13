import { defineStore } from 'pinia';

interface FaceConfig {
    faceDetectionMethod: 'TinyFaceDetector' | 'SsdMobilenetv1' | 'Mtcnn';
    distanceThreshold: number;
}

export const useConfigStore = defineStore('config', {
    state: () => {
        // Try to load from localStorage
        const stored = localStorage.getItem('config');
        const defaults:FaceConfig = {
            faceDetectionMethod: 'TinyFaceDetector',
            distanceThreshold: 0.4,
        };

        return stored ? JSON.parse(stored) : defaults;
    },
    actions: {
        setFaceDetectionMethod(method: string) {
            this.faceDetectionMethod = method;
            this.persistToStorage();
        },
        setDistanceThreshold(threshold: number) {
            this.distanceThreshold = threshold;
            this.persistToStorage();
        },
        persistToStorage() {
            localStorage.setItem('config', JSON.stringify({
                faceDetectionMethod: this.faceDetectionMethod,
                distanceThreshold: this.distanceThreshold
            }));
        },
    },
});