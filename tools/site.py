#!/usr/bin/env python3
"""Builds the examples website into site/: index.html (the catalog) and ex/<id>.html (each example)."""
import html, json, pathlib, re, shutil, sys

root = pathlib.Path(__file__).resolve().parent.parent
sys.path.insert(0, str(root / 'tools'))
import make  # noqa: E402

REPO = 'https://github.com/ingpress/forumwp-react-examples'
chapters_dir = root.parent / 'chapters'
site = root / 'site'  # build output; copy index.html, .nojekyll and ex/ to the repo root to publish
if site.exists():
    shutil.rmtree(site)
(site / 'ex').mkdir(parents=True)

titles = {}
for f in sorted(chapters_dir.glob('[0-9][0-9]-*.md')):
    first = f.read_text().split('\n', 1)[0]
    m = re.match(r'# Chapter (\d+): (.*)', first)
    if m:
        titles[int(m.group(1))] = m.group(2)

def key(ex_id):
    return [int(x) if x.isdigit() else x for x in re.split(r'[.]', ex_id)]

examples = []
for f in sorted((root / 'src').rglob('*.jsx')):
    ex_id, meta, page = make.build(f)
    slug = ex_id.replace('.', '-')
    (site / 'ex' / f'{slug}.html').write_text(page)
    examples.append({
        'id': ex_id, 'slug': slug, 'title': meta.get('title', ''), 'section': meta.get('section', ''),
        'api': meta.get('api') == 'fake', 'expect': meta.get('expect', ''),
        'src': f'{REPO}/blob/main/src/{f.relative_to(root / "src")}',
    })
examples.sort(key=lambda e: key(e['id']))

by_chapter = {}
for e in examples:
    by_chapter.setdefault(int(e['id'].split('.')[0]), []).append(e)

def card(e):
    tags = []
    if e['api']:
        tags.append('<span class="tag">fake REST API</span>')
    if e['expect'] == 'error':
        tags.append('<span class="tag tag-bug">shows an error on purpose</span>')
    if e['expect'] == 'warning':
        tags.append('<span class="tag tag-warn">shows a React warning</span>')
    return f'''<li class="ex" id="ex-{e["slug"]}">
  <div class="ex-head"><span class="num">{e["id"]}</span><h3>{html.escape(e["title"])}</h3></div>
  <div class="tags">{"".join(tags)}</div>
  <div class="actions">
    <a class="btn primary" href="ex/{e["slug"]}.html" target="_blank" rel="noopener">Run</a>
    <button class="btn" data-open="codepen" data-slug="{e["slug"]}" data-title="Example {e["id"]}: {html.escape(e["title"])}">CodePen</button>
    <button class="btn" data-open="jsfiddle" data-slug="{e["slug"]}" data-title="Example {e["id"]}: {html.escape(e["title"])}">JSFiddle</button>
    <button class="btn" data-open="codesandbox" data-slug="{e["slug"]}" data-title="Example {e["id"]}: {html.escape(e["title"])}">CodeSandbox</button>
    <a class="btn ghost" href="{e["src"]}" target="_blank" rel="noopener">Source</a>
  </div>
</li>'''

sections = []
nav = []
for n in sorted(by_chapter):
    t = html.escape(titles.get(n, f'Chapter {n}'))
    nav.append(f'<a href="#ch-{n}"><span>{n}</span>{t}</a>')
    sections.append(f'<section class="chapter" id="ch-{n}"><h2><span class="chnum">Chapter {n}</span>{t}</h2><ul class="list">{"".join(card(e) for e in by_chapter[n])}</ul></section>')

page = (root / 'tools' / 'site-index.html').read_text()
page = (page.replace('{{NAV}}', '\n'.join(nav))
            .replace('{{SECTIONS}}', '\n'.join(sections))
            .replace('{{COUNT}}', str(len(examples))))
(site / 'index.html').write_text(page)
(site / '.nojekyll').write_text('')
print(len(examples), 'examples,', len(by_chapter), 'chapters')
