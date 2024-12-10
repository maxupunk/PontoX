interface Box {
    x: number;
    y: number;
    width: number;
    height: number;
}

const imageMarge = 100;
const offset = 30;

export function getCutImage(box: Box) {
    const { x, y, width, height } = box;
    return {
        x: x - imageMarge,
        y: y - (imageMarge + offset),
        width: width + (2 * imageMarge),
        height: height + (2 * (imageMarge))
    }
}