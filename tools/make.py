#!/usr/bin/env python3
"""Wraps example .jsx files in the runnable HTML template. Usage: make.py src_dir out_dir"""
import html, json, pathlib, re, sys

root = pathlib.Path(__file__).resolve().parent.parent
template = (root / '_template.html').read_text()
mock = (root / 'tools' / 'fake-api.js').read_text() if (root / 'tools' / 'fake-api.js').exists() else ''

def header(code):
    meta = {}
    for line in code.splitlines():
        m = re.match(r'^// @(\w+)\s+(.*)$', line)
        if m:
            meta[m.group(1)] = m.group(2).strip()
        elif line.strip() and not line.startswith('//'):
            break
    return meta

def build(path):
    code = path.read_text()
    meta = header(code)
    ex_id = meta.get('id', path.stem)
    extra = ''
    if meta.get('api') == 'fake':
        extra = '<script>\n' + mock + '\n</script>'
    out = (template.replace('{{TITLE}}', html.escape(f"{ex_id}: {meta.get('title', '')}"))
           .replace('{{ID}}', ex_id)
           .replace('{{EXTRA_HTML}}', extra)
           .replace('{{CODE}}', code.replace('</script', '<\\/script')))
    return ex_id, meta, out

if __name__ == '__main__':
    src, dst = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
    dst.mkdir(parents=True, exist_ok=True)
    index = []
    for f in sorted(src.rglob('*.jsx')):
        ex_id, meta, out = build(f)
        (dst / f'{f.stem}.html').write_text(out)
        index.append({'id': ex_id, 'file': f'{f.stem}.html', 'src': str(f.relative_to(src)), **meta})
    (dst / 'index.json').write_text(json.dumps(index, indent=1))
    print(len(index), 'examples')
