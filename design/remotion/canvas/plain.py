# Turns exported .dc.html artboards into plain HTML pages plus an index of iframes, for measuring.
import os, re, sys, json
src, dst = sys.argv[1], sys.argv[2]
boards = json.load(open(os.path.join(src, 'canvas.json')))['boards']
for f, b in boards.items():
    s = open(os.path.join(src, f)).read()
    body = s.split('</helmet>')[1].split('</x-dc>')[0]
    fonts = re.search(r'<link[^>]+>', s).group(0)
    open(os.path.join(dst, f.replace('.dc.html', '.html')), 'w').write(f'<!doctype html><html><head><meta charset="utf-8">{fonts}<style>body{{margin:0}}</style></head><body>{body}</body></html>')
frames = ''.join(f'<iframe data-name="{f[:-8]}" src="{f[:-8]}.html" width="{b["w"]}" height="{b["h"]}" style="border:0;display:block"></iframe>' for f, b in boards.items() if b['w'] == 390)
open(os.path.join(dst, 'index.html'), 'w').write(f'<!doctype html><html><body style="margin:0">{frames}</body></html>')
