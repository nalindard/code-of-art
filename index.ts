import consola from "consola";
import { createCanvas, Image } from 'canvas'
import { writeFileSync } from 'fs'

const CONTRIES = {
    AU: "au",
    BR: "br",
    CA: "ca",
    CN: "cn",
    DE: "de",
    FR: "fr",
    IN: "in",
    IT: "it",
    JP: "jp",
    ES: "es",
    GB: "gb",
    US: "us",
} as const;

type Country = typeof CONTRIES[keyof typeof CONTRIES];

type Wallpaper = {
    title: string,
    copyright: string,
    fullUrl: string,
    thumbUrl: string,
    imageUrl: string,
    pageUrl: string,
    date: string //`${number}-${number}-${number}`//"2025-09-22"
}

/**
 * 
 * @description Fetches the wallpapers from the Bing API
 * 
 * @param country Specifies the Bing region for image results. 
 * Specifies the Bing region for image results.
 * Accepted values: au br ca cn de fr in it jp es gb us
 * @param numberOfImages The number of images to return. 
 * Min -> 1, Max -> 7
 * @returns An array of wallpapers
 */
const getWallpapers = async (country: Country, numberOfImages: number): Promise<Wallpaper[]> => {
    try {
        const response = await fetch(`https://peapix.com/bing/feed?country=${country}&n=${numberOfImages}`);
        const data = await response.json() as Wallpaper[];
        return data
    } catch (error) {
        consola.error(error);
        throw error;
    }
}

/**
 * 
 * @description Fetches the image data from the given url
 * 
 * @param imageUrl The url of the image
 * @returns The image data as a buffer
 */
const getImageData = async (imageUrl: string): Promise<Buffer> => {
    try {
        const response = await fetch(imageUrl);
        const data = await response.arrayBuffer();
        return Buffer.from(data);
    } catch (error) {
        consola.error(error);
        throw error;
    }
}

const processImage = async (img: Image): Promise<void> => {
    // ASCII characters from dense to light for luminance mapping
    const asciiChars = '@#S%?*+;:,.'.split('');
    const charLength = asciiChars.length;

    // Set canvas size to image size, adjusted for character aspect ratio
    const maxWidth = 240; // Max width in characters
    const charAspectRatio = 1.5; // Adjusted for typical monospaced font
    const imageAspectRatio = img.height / img.width;
    const width = Math.min(img.width, maxWidth);
    const height = Math.floor(width * imageAspectRatio / charAspectRatio);

    // canvas.width = width;
    // canvas.height = height;

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Draw image on canvas
    ctx.drawImage(img, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height).data;
    let ascii = '';
    let terminalAscii = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const r = imageData[i];
            const g = imageData[i + 1];
            const b = imageData[i + 2];

            if (!r || !g || !b) continue;

            // Calculate luminance
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            // Map luminance to ASCII character
            const charIndex = Math.floor((1 - luminance / 255) * (charLength - 1));
            const char = asciiChars[charIndex];

            // Create colored span for HTML
            ascii += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;

            // Create ANSI colored character for terminal
            terminalAscii += `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
        }
        ascii += '\n';
        terminalAscii += '\n';
    }

    consola.success("HTML ASCII generated");
    console.log("Terminal ASCII:\n" + terminalAscii);

    // Write HTML ASCII to file
    try {
        const htmlContent = `
                            <!DOCTYPE html>
                            <html lang="en">
                            <head>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <title>Generated ASCII Art</title>
                                <style>
                                    body {
                                        font-family: 'Courier New', monospace;
                                        background: #000;
                                        color: #fff;
                                        display: flex;
                                        justify-content: center;
                                        align-items: center;
                                        min-height: 100vh;
                                        margin: 0;
                                        padding: 0px;
                                    }
                                    #ascii {
                                        white-space: pre;
                                        line-height: 1;
                                        font-size: 8px;
                                        letter-spacing: 0.5px;
                                        text-align: center;
                                    }
                                </style>
                            </head>
                            <body>
                                <div id="ascii">${ascii}</div>
                            </body>
                            </html>
                            `;

        writeFileSync('generated-ascii.html', htmlContent);
        consola.success("HTML file 'generated-ascii.html' created successfully!");
    } catch (error) {
        consola.error("Failed to write HTML file:", error);
    }

    // Adjust font size to fit container if needed
    // const containerWidth = window.innerWidth - 40; // Account for margins
    // const charWidth = 8; // Approximate pixel width per character
    // if (width * charWidth > containerWidth) {
    // const fontSize = Math.floor(containerWidth / width);
    // output.style.fontSize = `${fontSize}px`;
    // }
}

const main = async (): Promise<void> => {
    consola.success('Start')
    const data = await getWallpapers('jp', 7)
    const firstWallpaper = data[0];
    if (!firstWallpaper) {
        consola.error("No wallpapers found");
        process.exit(1);
    }

    const imageData = await getImageData(firstWallpaper.imageUrl)
    const img = new Image();
    img.src = imageData;

    await processImage(img);
    consola.success('Success');
};

main().catch((error) => {
    consola.error(error);
    process.exit(1);
})

