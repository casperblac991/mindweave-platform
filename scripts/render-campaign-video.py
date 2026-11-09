from pathlib import Path
import math
import wave
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
TMP = Path('/tmp/mindweave-motion-video')
FRAMES = TMP / 'frames'
OUT = ROOT / 'assets' / 'mindweave-campaign-intro.mp4'
W, H, FPS, SECONDS = 768, 1344, 30, 6
BG = (5, 10, 15)
CYAN = (0, 212, 255)
PURPLE = (124, 58, 237)
TEXT = (232, 244, 253)
MUTED = (122, 155, 181)
FONT_AR = '/usr/share/fonts/truetype/noto/NotoKufiArabic-ExtraBold.ttf'
FONT_AR_REG = '/usr/share/fonts/truetype/noto/NotoSansArabic-SemiCondensedMedium.ttf'
FONT_LATIN = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def f(path, size):
    return ImageFont.truetype(path, size)


def center_text(draw, xy, text, font, fill, rtl_text=False, anchor='mm'):
    if rtl_text:
        draw.text(xy, text, font=font, fill=fill, anchor=anchor, direction='rtl', language='ar')
    else:
        draw.text(xy, text, font=font, fill=fill, anchor=anchor)


def rounded(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def logo(draw, y, alpha=255):
    x = W // 2
    r = 44
    fill = (*CYAN, alpha)
    rounded(draw, (x-r, y-r, x+r, y+r), 18, fill=fill)
    draw.ellipse((x-22, y-22, x+22, y+22), fill=(5, 10, 15, alpha))
    draw.arc((x-17, y-14, x+17, y+16), 205, 335, fill=fill, width=5)
    draw.arc((x-13, y-18, x+13, y+11), 25, 155, fill=fill, width=5)
    center_text(draw, (x, y+75), 'MindWeave', f(FONT_LATIN, 27), (*TEXT, alpha))


def make_frame(i):
    t = i / FPS
    im = Image.new('RGBA', (W, H), (*BG, 255))
    px = im.load()
    for y in range(H):
        for x in range(W):
            glow = max(0.0, 1.0 - (((x-W*.5)/(W*.82))**2 + ((y-H*.3)/(H*.72))**2))
            pulse = 0.5 + 0.5 * math.sin(t * 2.1)
            px[x, y] = (int(5+4*glow), int(10+18*glow), int(15+42*glow), 255)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    # connected idea nodes
    nodes = [(145, 190), (620, 220), (210, 505), (566, 505), (384, 330)]
    for a, b in [((145,190),(384,330)), ((620,220),(384,330)), ((210,505),(384,330)), ((566,505),(384,330))]:
        d.line([a,b], fill=(*CYAN, 80), width=3)
    for j, (x, y) in enumerate(nodes):
        rr = 10 + 4 * math.sin(t*3+j)
        d.ellipse((x-rr,y-rr,x+rr,y+rr), fill=(*([CYAN, PURPLE][j%2]), 180))
    layer = layer.filter(ImageFilter.GaussianBlur(0.8))
    im = Image.alpha_composite(im, layer)
    d = ImageDraw.Draw(im)

    # 0.0–1.4 logo reveal
    a = max(0, min(255, int(255 * min(1, t/0.5))))
    logo(d, 155, a)
    if t < 1.5:
        center_text(d, (W//2, 315), 'ابدأ بذكاء', f(FONT_AR, 40), (*TEXT, a), rtl_text=True)

    # prompt card reveal and hold
    if t >= 1.1:
        p = min(1, (t-1.1)/0.45)
        y = int(690 - 80*p)
        rounded(d, (72, y, W-72, y+210), 24, fill=(10,22,40,235), outline=(*CYAN, 180), width=2)
        center_text(d, (W//2, y+45), '10 أوامر مجانية', f(FONT_AR, 34), (*CYAN,255), rtl_text=True)
        center_text(d, (W//2, y+105), 'لعمل وتسويق وتعلّم أفضل', f(FONT_AR_REG, 22), (*TEXT,255), rtl_text=True)
        for j in range(3):
            xx = 150 + j*220
            yy = y+165
            draw_color = CYAN if j < int(max(0, min(3, (t-1.4)*2))) else (80,100,120)
            d.ellipse((xx-8,yy-8,xx+8,yy+8), fill=(*draw_color,255))
            d.line((xx+18,yy,xx+78,yy), fill=(*draw_color,220), width=5)

    # before/after transformation
    if 3.25 <= t < 5.0:
        p = min(1, (t-3.25)/0.55)
        left_x = int(70 - 90*p)
        right_x = int(438 + 90*p)
        rounded(d, (left_x, 950, left_x+250, 1088), 18, fill=(20,30,45,240), outline=(*PURPLE,220), width=2)
        rounded(d, (right_x, 950, right_x+260, 1088), 18, fill=(10,42,54,240), outline=(*CYAN,220), width=2)
        center_text(d, (left_x+125, 994), 'فكرة خام', f(FONT_AR_REG, 23), (*TEXT,255), rtl_text=True)
        center_text(d, (right_x+130, 994), 'خطة واضحة', f(FONT_AR_REG, 23), (*TEXT,255), rtl_text=True)
        d.line((left_x+175, 1060, right_x+75, 1060), fill=(*CYAN,220), width=5)
        d.polygon([(right_x+75,1060),(right_x+55,1048),(right_x+55,1072)], fill=(*CYAN,220))

    if t >= 4.75:
        p = min(1, (t-4.75)/0.5)
        center_text(d, (W//2, 1145), 'جرّب المختبر مجانًا', f(FONT_AR, 29), (*TEXT, int(255*p)), rtl_text=True)
        center_text(d, (W//2, 1205), 'Prompt Lab', f(FONT_LATIN, 20), (*CYAN, int(255*p)))
        center_text(d, (W//2, 1250), 'mindweave.store', f(FONT_LATIN, 21), (*CYAN, int(255*p)))
    return im.convert('RGB')


def make_audio(path):
    rate = 44100
    n = int(rate * SECONDS)
    with wave.open(str(path), 'w') as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(rate)
        for i in range(n):
            t = i / rate
            fade = min(1, t/.25, (SECONDS-t)/.45)
            base = 0.035 * math.sin(2*math.pi*(174 + 10*math.sin(t*1.3))*t)
            pulse = 0.018 * math.sin(2*math.pi*348*t) * (0.5+0.5*math.sin(t*2.0))
            chime = 0.0
            for start, freq in [(1.2,880),(3.35,660),(4.85,988)]:
                if start <= t < start+.24:
                    q = t-start
                    chime += 0.08 * math.sin(2*math.pi*freq*q) * math.exp(-8*q)
            value = int(max(-1, min(1, (base+pulse+chime)*fade)) * 32767)
            wf.writeframesraw(value.to_bytes(2,'little',signed=True)*2)


def main():
    if TMP.exists(): shutil.rmtree(TMP)
    FRAMES.mkdir(parents=True)
    for i in range(FPS*SECONDS):
        make_frame(i).save(FRAMES / f'{i:05d}.png', quality=95)
    wav = TMP / 'bed.wav'
    make_audio(wav)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg','-y','-framerate',str(FPS),'-i',str(FRAMES/'%05d.png'),'-i',str(wav),'-c:v','libx264','-pix_fmt','yuv420p','-r',str(FPS),'-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(OUT)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    print(OUT)

if __name__ == '__main__': main()
