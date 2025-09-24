import consola from "consola";
import { createCanvas, Image } from 'canvas'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

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

type ProcessImageResult = {
    htmlString: string;
    terminalString: string;
    plainTextString: string;
}

const sanitizeFileName = (str: string): string => {
    return str
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '') // Remove filesystem invalid characters
        .replace(/\s+/g, '-') // Replace whitespace with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
        .substring(0, 100); // Limit length
}

const writeAsciiFiles = async (
    result: ProcessImageResult,
    date: string,
    title: string,
    copyright: string
): Promise<void> => {
    try {
        // Parse date to get year, month, day
        const dateParts = date.split('-');
        if (dateParts.length !== 3) {
            throw new Error(`Invalid date format: ${date}. Expected YYYY-MM-DD`);
        }
        const [year, month, day] = dateParts;

        // Create sanitized filename parts
        const sanitizedTitle = sanitizeFileName(title);
        const sanitizedCopyright = sanitizeFileName(copyright);
        const baseFileName = `${day}-${sanitizedTitle}-${sanitizedCopyright}`;

        // Create directory structure: data/year/month/
        const dirPath = join('data', year!, month!);
        mkdirSync(dirPath, { recursive: true });

        // Write HTML file
        const htmlPath = join(dirPath, `${baseFileName}.html`);
        writeFileSync(htmlPath, result.htmlString);

        // Write plain text file
        const txtPath = join(dirPath, `${baseFileName}.txt`);
        const txtContent = `Title: ${title}
Date: ${date}
Copyright: ${copyright}

${result.plainTextString}`;
        writeFileSync(txtPath, txtContent);

        // Write terminal ASCII file (with ANSI codes)
        const ansiPath = join(dirPath, `${baseFileName}.ansi`);
        const ansiContent = `Title: ${title}
Date: ${date}
Copyright: ${copyright}

${result.terminalString}`;
        writeFileSync(ansiPath, ansiContent);

        consola.success(`Files written to ${dirPath}:`);
        consola.info(`- ${baseFileName}.html`);
        consola.info(`- ${baseFileName}.txt`);
        consola.info(`- ${baseFileName}.ansi`);

    } catch (error) {
        consola.error("Failed to write ASCII files:", error);
        throw error;
    }
}

const processImage = async (img: Image, date: string, title: string, copyright: string): Promise<ProcessImageResult> => {
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
    let htmlAscii = '';
    let terminalAscii = '';
    let plainTextAscii = '';

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
            htmlAscii += `<span style="color: rgb(${r},${g},${b})">${char}</span>`;

            // Create ANSI colored character for terminal
            terminalAscii += `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;

            // Create plain text character
            plainTextAscii += char;
        }
        htmlAscii += '\n';
        terminalAscii += '\n';
        plainTextAscii += '\n';
    }

    // Create complete HTML content with metadata
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - ${date}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #000;
            color: #fff;
            display: flex;
            flex-direction: column;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            padding: 20px;
        }
        .metadata {
            text-align: center;
            margin-bottom: 20px;
            color: #888;
        }
        .metadata h1 {
            color: #fff;
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .metadata p {
            margin: 5px 0;
            font-size: 12px;
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
    <div class="metadata">
        <h1>${title}</h1>
        <p>Date: ${date}</p>
        <p>Copyright: ${copyright}</p>
    </div>
    <div id="ascii">${htmlAscii}</div>
</body>
</html>`;

    consola.success("ASCII strings generated successfully");
    console.log("Terminal ASCII:\n" + terminalAscii);

    return {
        htmlString: htmlContent,
        terminalString: terminalAscii,
        plainTextString: plainTextAscii
    };
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

    const result = await processImage(img, firstWallpaper.date, firstWallpaper.title, firstWallpaper.copyright);
    await writeAsciiFiles(result, firstWallpaper.date, firstWallpaper.title, firstWallpaper.copyright);
    consola.success('Success');
};

main().catch((error) => {
    consola.error(error);
    process.exit(1);
})

