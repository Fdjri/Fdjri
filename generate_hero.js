const fs = require('fs');
const figlet = require('figlet');
const Jimp = require('jimp');

function generateWordmarkSVG(text, outputFile) {
    let asciiArt;
    try {
        asciiArt = figlet.textSync(text, { font: 'Slant' });
    } catch (e) {
        asciiArt = figlet.textSync(text);
    }

    const lines = asciiArt.trimEnd().split('\n');
    const charWidth = 8;
    const lineHeight = 14;
    const width = Math.max(...lines.map(line => line.length)) * charWidth;
    const height = lines.length * lineHeight;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <style>
        .text {
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
            fill: #222;
            white-space: pre;
            clip-path: url(#wipe-clip);
        }
        @media (prefers-color-scheme: dark) {
            .text { fill: #eee; }
        }
        @keyframes wipe {
            from { width: 0; }
            to { width: 100%; }
        }
        .wipe-rect {
            animation: wipe 2s ease-in-out forwards;
        }
    </style>
    <defs>
        <clipPath id="wipe-clip">
            <rect x="0" y="0" width="0" height="100%" class="wipe-rect" />
        </clipPath>
    </defs>
    <rect width="100%" height="100%" fill="transparent"/>
    <g class="text">\n`;

    lines.forEach((line, i) => {
        const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&#160;');
        svg += `        <text x="0" y="\${lineHeight + i * lineHeight}">\${escapedLine}</text>\n`;
    });

    svg += `    </g>\n</svg>`;
    fs.writeFileSync(outputFile, svg, 'utf-8');
    console.log(`Generated ${outputFile}`);
}

async function generateAsciiSVG(imagePath, outputFile, widthChars = 80) {
    try {
        const img = await Jimp.read(imagePath);
        img.greyscale();
        
        const aspectRatio = img.bitmap.height / img.bitmap.width;
        const heightChars = Math.floor(widthChars * aspectRatio * 0.5);
        
        img.resize(widthChars, heightChars);
        
        const chars = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "].reverse();
        
        let asciiStr = "";
        for (let y = 0; y < img.bitmap.height; y++) {
            for (let x = 0; x < img.bitmap.width; x++) {
                const color = Jimp.intToRGBA(img.getPixelColor(x, y));
                asciiStr += chars[Math.floor(color.r / 26)];
            }
            asciiStr += "\\n";
        }
        
        const lines = asciiStr.trimEnd().split('\\n');
        
        const charWidth = 8;
        const lineHeight = 12;
        const width = widthChars * charWidth;
        const height = heightChars * lineHeight;
        
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <style>
            .ascii {
                font-family: monospace;
                font-size: 10px;
                fill: #333;
                white-space: pre;
                clip-path: url(#type-clip);
            }
            @media (prefers-color-scheme: dark) {
                .ascii { fill: #ccc; }
            }
            @keyframes typing {
                from { height: 0; }
                to { height: 100%; }
            }
            .typing-rect {
                animation: typing 3s steps(\${heightChars}, end) forwards;
            }
        </style>
        <defs>
            <clipPath id="type-clip">
                <rect x="0" y="0" width="100%" height="0" class="typing-rect" />
            </clipPath>
        </defs>
        <rect width="100%" height="100%" fill="transparent"/>
        <g class="ascii">\n`;
        
        lines.forEach((line, i) => {
            const escapedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/ /g, '&#160;');
            svg += `        <text x="0" y="\${10 + i * lineHeight}">\${escapedLine}</text>\n`;
        });
        
        svg += `    </g>\n</svg>`;
        
        fs.writeFileSync(outputFile, svg, 'utf-8');
        console.log(`Generated ${outputFile}`);
    } catch (err) {
        console.error("Error processing image:", err);
    }
}

generateWordmarkSVG("Fdjritw", "wordmark.svg");
generateAsciiSVG("D:\\\\Private\\\\Aji\\\\github assets\\\\profile.jpeg", "profile-ascii.svg");
