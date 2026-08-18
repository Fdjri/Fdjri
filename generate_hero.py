import sys
import pyfiglet
from PIL import Image, ImageEnhance

def generate_wordmark_svg(text, output_file):
    try:
        # Use a nice 3D/slanted font
        ascii_art = pyfiglet.figlet_format(text, font="slant")
    except Exception:
        ascii_art = pyfiglet.figlet_format(text)
        
    lines = ascii_art.rstrip("\n").split('\n')
    
    char_width = 8
    line_height = 14
    width = max(len(line) for line in lines) * char_width
    height = len(lines) * line_height

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
    <style>
        .text {{
            font-family: monospace;
            font-size: 12px;
            font-weight: bold;
            fill: #222;
            white-space: pre;
            clip-path: url(#wipe-clip);
        }}
        @media (prefers-color-scheme: dark) {{
            .text {{ fill: #eee; }}
        }}
        @keyframes wipe {{
            from {{ width: 0; }}
            to {{ width: 100%; }}
        }}
        .wipe-rect {{
            animation: wipe 2s ease-in-out forwards;
        }}
    </style>
    <defs>
        <clipPath id="wipe-clip">
            <rect x="0" y="0" width="0" height="100%" class="wipe-rect" />
        </clipPath>
    </defs>
    <rect width="100%" height="100%" fill="transparent"/>
    <g class="text">
'''
    for i, line in enumerate(lines):
        escaped_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&#160;')
        svg += f'        <text x="0" y="{line_height + i * line_height}">{escaped_line}</text>\n'
        
    svg += '''    </g>
</svg>'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated {output_file}")


def generate_ascii_svg(image_path, output_file, width_chars=120):
    img = Image.open(image_path).convert('L')
    
    # Enhance contrast and sharpness for better facial details
    img = ImageEnhance.Contrast(img).enhance(1.8)
    img = ImageEnhance.Sharpness(img).enhance(2.0)
    
    aspect_ratio = img.height / img.width
    height_chars = int(width_chars * aspect_ratio * 0.5)
    img = img.resize((width_chars, height_chars))
    
    # Use getdata() and cast to list
    pixels = list(img.getdata())
    chars = ["@", "%", "#", "*", "+", "=", "-", ":", ".", " "]
    chars.reverse()
    
    ascii_str = ""
    for pixel_value in pixels:
        ascii_str += chars[pixel_value // 26]
    
    lines = [ascii_str[index: index + width_chars] for index in range(0, len(ascii_str), width_chars)]
    
    char_width = 8
    line_height = 12
    width = width_chars * char_width
    height = height_chars * line_height
    
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}">
    <style>
        .ascii {{
            font-family: monospace;
            font-size: 10px;
            fill: #333;
            white-space: pre;
            clip-path: url(#type-clip);
        }}
        @media (prefers-color-scheme: dark) {{
            .ascii {{ fill: #ccc; }}
        }}
        @keyframes typing {{
            from {{ height: 0; }}
            to {{ height: 100%; }}
        }}
        .typing-rect {{
            animation: typing 3s steps({height_chars}, end) forwards;
        }}
    </style>
    <defs>
        <clipPath id="type-clip">
            <rect x="0" y="0" width="100%" height="0" class="typing-rect" />
        </clipPath>
    </defs>
    <rect width="100%" height="100%" fill="transparent"/>
    <g class="ascii">
'''
    for i, line in enumerate(lines):
        escaped_line = line.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&#160;')
        svg += f'        <text x="0" y="{10 + i * line_height}">{escaped_line}</text>\n'
        
    svg += '''    </g>
</svg>'''

    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(svg)
    print(f"Generated {output_file}")


if __name__ == "__main__":
    generate_wordmark_svg("Fdjritw", "wordmark.svg")
    generate_ascii_svg("profile.jpg", "profile-ascii.svg")
