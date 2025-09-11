import { parseGIF, decompressFrames } from "gifuct-js";

self.onmessage = (e) => {
    const buff = e.data
    const gif = parseGIF(buff)
    const width = gif.lsd.width
    const height = gif.lsd.height
    const scale = 2
    const levels = "@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ";

    const frames = decompressFrames(gif, true)
    const texts = [] as string[]

    for (let i = 0; i < frames.length; ++i) {
        const f = frames[i]
        const canvas = new OffscreenCanvas(f.dims.width, f.dims.height)
        const ctx = canvas.getContext("2d")
        const image_data = new ImageData(
            new Uint8ClampedArray(f.patch),
            f.dims.width,
            f.dims.height
        )
        ctx?.putImageData(image_data, 0, 0)
        const frameImageData = ctx?.getImageData(0, 0, width, height)
        const data = frameImageData?.data

        if (data) {
            let text = "";
            for (let y = 0; y < height; y += scale) {
                let row = "";
                for (let x = 0; x < width; x += scale) {
                    const idx = (y * width + x) * 4;
                    const avg = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
                    const charIndex = Math.floor(avg / 255 * (levels.length - 1));
                    row += levels[charIndex];
                }
                text += row + "\n";
            }
            texts.push(text);
        }
    }

    // 将结果发送回主线程
    self.postMessage(texts);
}