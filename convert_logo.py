import base64
import shutil

shutil.copy('assets/logo-white.png', 'assets/logo.png')

with open('assets/logo-white.png', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2200 680" width="100%" height="100%">
  <image href="data:image/png;base64,{b64}" width="2200" height="680" />
</svg>'''

with open('assets/logo.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print("Updated assets/logo.png and assets/logo.svg successfully!")
