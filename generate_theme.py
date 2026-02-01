import colorsys

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

def luminance(rgb):
    a = [v / 255.0 for v in rgb]
    a = [((v + 0.055) / 1.055) ** 2.4 if v > 0.03928 else v / 12.92 for v in a]
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722

def contrast_ratio(rgb1, rgb2):
    lum1 = luminance(rgb1)
    lum2 = luminance(rgb2)
    brightest = max(lum1, lum2)
    darkest = min(lum1, lum2)
    return (brightest + 0.05) / (darkest + 0.05)

BRAND_BLUE = "#4A90E2"
BRAND_GREEN = "#7ED321"

def generate_css():
    light_theme = {
        '--bg-primary': "#0A0A0F",
        '--bg-card': "#1A1B2E",
        '--text-primary': "#F8FAFC",
        '--text-secondary': "#CBD5E1",
        '--border-color': "#8B5CF6",
        '--accent-main': "#00FFFF",
        '--accent-success': "#00FF88"
    }

    dark_theme = {
        '--bg-primary': "#000000",
        '--bg-card': "#0F0F23",
        '--text-primary': "#FFFFFF",
        '--text-secondary': "#94A3B8",
        '--border-color': "#C084FC",
        '--accent-main': "#00FFAA",
        '--accent-success': "#4ADE80"
    }

    css_content = "/* Antigravity Theme v1.0 - Floating Cosmic Void */\n:root {\n"
    for k, v in light_theme.items():
        css_content += f"    {k}: {v};\n"
    css_content += "}\n\n.dark {\n"
    for k, v in dark_theme.items():
        css_content += f"    {k}: {v};\n"
    css_content += "}\n"

    print("--- Contrast Check ---")
    
    # Light Mode Check
    bg = hex_to_rgb(light_theme['--bg-card'])
    text = hex_to_rgb(light_theme['--text-primary'])
    ratio = contrast_ratio(bg, text)
    print(f"Light Mode Contrast: {ratio:.2f} (Req > 12:1)")

    # Dark Mode Check
    bg = hex_to_rgb(dark_theme['--bg-card'])
    text = hex_to_rgb(dark_theme['--text-primary'])
    ratio = contrast_ratio(bg, text)
    print(f"Dark Mode Contrast: {ratio:.2f} (Req > 15:1)")

    return css_content

if __name__ == "__main__":
    css = generate_css()
    with open("theme_antigravity.css", "w") as f:
        f.write(css)
    print("Antigravity theme deployed.")
