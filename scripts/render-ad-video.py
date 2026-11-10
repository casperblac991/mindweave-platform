from pathlib import Path
import math
import wave
import subprocess
import shutil
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
TMP = Path('/tmp/mindweave-ad-video')
FRAMES = TMP / 'frames'
OUT = ROOT / 'assets' / 'mindweave-ad-vertical.mp4'
W, H, FPS, SECONDS = 768, 1344, 30, 15
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


def fade(t, start, duration=0.5):
    return max(0, min(255, int(255 * min(1, max(0, (t-start)/duration)))))


def logo(draw, y, alpha=255, scale=1.0):
    x = W // 2
    r = int(44 * scale)
    fill = (*CYAN, alpha)
    rounded(draw, (x-r, y-r, x+r, y+r), int(18*scale), fill=fill)
    draw.ellipse((x-int(22*scale), y-int(22*scale), x+int(22*scale), y+int(22*scale)), fill=(*BG, alpha))
    draw.arc((x-int(17*scale), y-int(14*scale), x+int(17*scale), y+int(16*scale)), 205, 335, fill=fill, width=max(2, int(5*scale)))
    draw.arc((x-int(13*scale), y-int(18*scale), x+int(13*scale), y+int(11*scale)), 25, 155, fill=fill, width=max(2, int(5*scale)))
    center_text(draw, (x, y+int(75*scale)), 'MindWeave', f(FONT_LATIN, int(27*scale)), (*TEXT, alpha))


def make_frame(i):
    t = i / FPS
    im = Image.new('RGBA', (W, H), (*BG, 255))
    px = im.load()
    pulse = 0.5 + 0.5 * math.sin(t * 2.0)
    for y in range(H):
        for x in range(W):
            glow = max(0.0, 1.0 - (((x-W*.5)/(W*.85))**2 + ((y-H*.25)/(H*.75))**2))
            px[x, y] = (int(5+4*glow), int(10+18*glow), int(15+42*glow), 255)
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    nodes = [(100, 160), (670, 205), (150, 520), (620, 520), (384, 330)]
    for a, b in [((100,160),(384,330)), ((670,205),(384,330)), ((150,520),(384,330)), ((620,520),(384,330))]:
        d.line([a,b], fill=(*CYAN, 75), width=3)
    for j, (x, y) in enumerate(nodes):
        rr = 9 + 4 * math.sin(t*2.5+j)
        d.ellipse((x-rr,y-rr,x+rr,y+rr), fill=(*([CYAN, PURPLE][j%2]), 165))
    im = Image.alpha_composite(im, layer.filter(ImageFilter.GaussianBlur(0.8)))
    d = ImageDraw.Draw(im)

    # Hook: first two seconds
    if t < 3.0:
        a = fade(t, 0.0, 0.45)
        logo(d, 155, a)
        center_text(d, (W//2, 330), 'تكتب كثيرًا؟', f(FONT_AR, 44), (*TEXT, a), rtl_text=True)
        center_text(d, (W//2, 415), 'ابدأ بأمر أوضح', f(FONT_AR_REG, 30), (*CYAN, a), rtl_text=True)
        d.line((150, 480, 618, 480), fill=(*CYAN, int(a*.45)), width=3)

    # Free value proposition
    if 2.2 <= t < 6.5:
        p = min(1, (t-2.2)/0.45)
        y = int(650 - 80*p)
        rounded(d, (60, y, W-60, y+245), 24, fill=(10,22,40,240), outline=(*CYAN, 190), width=2)
        center_text(d, (W//2, y+48), '10 أوامر مجانية', f(FONT_AR, 36), (*CYAN,255), rtl_text=True)
        center_text(d, (W//2, y+108), 'لعمل وتسويق وتعلّم أفضل', f(FONT_AR_REG, 23), (*TEXT,255), rtl_text=True)
        labels = ['عمل', 'تسويق', 'تعلّم']
        for j, label in enumerate(labels):
            xx = 145 + j*240
            yy = y+188
            color = CYAN if t > 2.6 + j*.35 else (80,100,120)
            d.ellipse((xx-8,yy-8,xx+8,yy+8), fill=(*color,255))
            center_text(d, (xx+52, yy), label, f(FONT_AR_REG, 19), (*TEXT,255), rtl_text=True)

    # Prompt Lab interaction
    if 5.8 <= t < 10.2:
        p = min(1, (t-5.8)/0.5)
        y = int(865 - 70*p)
        rounded(d, (60, y, W-60, y+220), 24, fill=(10,22,40,242), outline=(*PURPLE, 210), width=2)
        center_text(d, (W//2, y+42), 'Prompt Lab', f(FONT_LATIN, 28), (*CYAN,255))
        center_text(d, (W//2, y+92), 'فكرة خام  →  خطة واضحة', f(FONT_AR_REG, 25), (*TEXT,255), rtl_text=True)
        center_text(d, (W//2, y+150), 'جرّب قبل أن تشتري', f(FONT_AR_REG, 22), (*MUTED,255), rtl_text=True)

    # Trust / proof beat
    if 9.8 <= t < 12.8:
        a = fade(t, 9.8, .4)
        center_text(d, (W//2, 600), 'مجاني · عربي · عملي', f(FONT_AR, 31), (*TEXT,a), rtl_text=True)
        center_text(d, (W//2, 680), 'بدون بطاقة دفع', f(FONT_AR_REG, 25), (*CYAN,a), rtl_text=True)
        rounded(d, (105, 770, W-105, 860), 18, fill=(10,42,54,a), outline=(*CYAN,a), width=2)
        center_text(d, (W//2, 815), 'ابدأ من أول أمر اليوم', f(FONT_AR_REG, 24), (*TEXT,a), rtl_text=True)

    # CTA
    if t >= 12.2:
        a = fade(t, 12.2, .5)
        logo(d, 970, a, .8)
        center_text(d, (W//2, 1090), 'جرّب Prompt Lab مجانًا', f(FONT_AR, 30), (*TEXT,a), rtl_text=True)
        center_text(d, (W//2, 1160), 'mindweave.store', f(FONT_LATIN, 23), (*CYAN,a))
        rounded(d, (170, 1210, W-170, 1270), 18, fill=(*CYAN,a))
        center_text(d, (W//2, 1240), 'ابدأ الآن', f(FONT_AR_REG, 22), (*BG,a), rtl_text=True)
    return im.convert('RGB')


def make_audio(path):
    rate = 44100
    n = int(rate * SECONDS)
    with wave.open(str(path), 'w') as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(rate)
        for i in range(n):
            t = i / rate
            fade_out = min(1, t/.25, (SECONDS-t)/.6)
            bass = 0.035 * math.sin(2*math.pi*(174 + 8*math.sin(t*.55))*t)
            pulse = 0.018 * math.sin(2*math.pi*348*t) * (0.5+0.5*math.sin(t*2.0))
            chime = 0.0
            for start, freq in [(2.25,880),(5.9,660),(9.9,784),(12.3,988)]:
                if start <= t < start+.24:
                    q = t-start
                    chime += 0.075 * math.sin(2*math.pi*freq*q) * math.exp(-8*q)
            value = int(max(-1, min(1, (bass+pulse+chime)*fade_out)) * 32767)
            wf.writeframesraw(value.to_bytes(2,'little',signed=True)*2)


def main():
    if TMP.exists(): shutil.rmtree(TMP)
    FRAMES.mkdir(parents=True)
    for i in range(FPS*SECONDS):
        make_frame(i).save(FRAMES / f'{i:05d}.png')
    wav = TMP / 'bed.wav'
    make_audio(wav)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(['ffmpeg','-y','-framerate',str(FPS),'-i',str(FRAMES/'%05d.png'),'-i',str(wav),'-c:v','libx264','-pix_fmt','yuv420p','-r',str(FPS),'-c:a','aac','-b:a','128k','-shortest','-movflags','+faststart',str(OUT)],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE)
    print(OUT)

if __name__ == '__main__': main()
