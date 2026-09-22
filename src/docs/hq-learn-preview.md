# HQ Learn — LMS Design Preview

Converted from the original HTML preview. The complete HTML/CSS/JavaScript source is preserved below so the design, interactions, responsive behavior, student/admin views, light/dark themes, courses, live classes, study tools, certificates, and admin UI remain fully documented.

## Source

```html
<!doctype html>
<html lang="en" data-theme="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>HQ Learn: LMS design preview</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,300..800&display=swap" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
:root{
  --hq-red:#e0142c;--hq-red-dim:#8e0b1c;--hq-red-deep:#c21024;--hq-red-ink:#5c0512;
  --hq-black:#070708;--hq-panel:#0e0e11;--hq-line:#1e1e24;--hq-mute:#8a8a94;--hq-ink:#131315;
  --hq-bone:#efeae1;--hq-bone-deep:#e4ded2;--hq-amber:#c9a25e;
  --ease:cubic-bezier(.2,.7,.2,1);
  --f:'Bricolage Grotesque','Avenir Next','Segoe UI',system-ui,sans-serif;
  box-sizing:border-box;
  padding-top:env(safe-area-inset-top,0px);
  padding-bottom:env(safe-area-inset-bottom,0px);
  /* light (default) */
  --bg:var(--hq-bone);--surface:#f8f5ef;--surface-2:var(--hq-bone-deep);
  --text:var(--hq-ink);--muted:#6b6862;--line:#d4cdbf;
  --accent:var(--hq-red);--accent-press:var(--hq-red-deep);--accent-text:#c21024;--reward:var(--hq-amber);
}
html{scroll-padding-top:env(safe-area-inset-top,0px)}
:root[data-theme="light"]{
  --bg:var(--hq-bone);--surface:#f8f5ef;--surface-2:var(--hq-bone-deep);
  --text:var(--hq-ink);--muted:#6b6862;--line:#d4cdbf;--accent-text:#c21024;
}
:root[data-theme="dark"]{
  --bg:var(--hq-black);--surface:var(--hq-panel);--surface-2:#17171b;
  --text:var(--hq-bone);--muted:var(--hq-mute);--line:var(--hq-line);--accent-text:#ff6b7a;
}
html,body{min-height:100%}
body{background:var(--bg);color:var(--text);font:400 15px/1.5 var(--f);font-optical-sizing:auto;-webkit-font-smoothing:antialiased}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;text-align:inherit}
ul{list-style:none;padding:0}
.i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:none}
:focus-visible{outline:2px solid var(--accent);outline-offset:2px;border-radius:6px}
::view-transition-old(root),::view-transition-new(root){animation:none;mix-blend-mode:normal}

/* layout */
.app{display:grid;grid-template-columns:248px minmax(0,1fr);min-height:100vh}
.side{position:sticky;top:env(safe-area-inset-top,0px);height:100vh;display:flex;flex-direction:column;gap:22px;padding:24px 16px 20px;border-right:1px solid var(--line)}
.brand{display:flex;align-items:center;gap:10px;font-weight:750;font-size:19px;letter-spacing:-.02em;padding:0 8px}
.mark{width:28px;height:28px;border-radius:50%;background:var(--accent);position:relative;flex:none}
.mark::after{content:"";position:absolute;right:-2px;bottom:-2px;width:10px;height:10px;border-radius:50%;background:var(--reward);box-shadow:0 0 0 3px var(--bg)}
.role{display:grid;grid-template-columns:1fr 1fr;padding:4px;border-radius:12px;background:var(--surface-2);gap:4px}
.role button{padding:7px 0;border-radius:9px;text-align:center;font-weight:600;font-size:14px;color:var(--muted);transition:background .25s,color .25s}
.role button[aria-pressed="true"]{background:var(--bg);color:var(--text)}
#nav{position:relative;display:flex;flex-direction:column;gap:4px}
.nav-ind{position:absolute;left:0;right:0;top:0;height:44px;border-radius:12px;background:var(--text);transition:transform .38s var(--ease),height .3s;opacity:0}
#nav button{position:relative;z-index:1;display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;color:var(--muted);font-weight:550;transition:color .25s}
#nav button:hover{color:var(--text)}
#nav button[aria-current="page"]{color:var(--bg)}
.me{margin-top:auto;display:flex;align-items:center;gap:12px;padding:10px 8px;border-top:1px solid var(--line)}
.me .av{width:38px;height:38px;border-radius:50%;background:var(--hq-red-ink);color:var(--hq-bone);display:grid;place-items:center;font-weight:700;font-size:14px}
.me b{display:block;font-weight:600;line-height:1.2}.me span{font-size:13px;color:var(--muted)}

main{padding:24px clamp(18px,3.2vw,48px) 72px;min-width:0;max-width:1240px;width:100%;margin:0 auto}
.top{display:flex;align-items:center;gap:16px;margin-bottom:28px;position:relative}
.top h1{flex:1;font-size:clamp(26px,3.4vw,40px);font-weight:720;letter-spacing:-.025em;line-height:1.05;font-stretch:90%}
.iconbtn{position:relative;width:44px;height:44px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);background:var(--surface);transition:transform .2s var(--ease),border-color .2s}
.iconbtn:hover{border-color:var(--muted)}.iconbtn:active{transform:scale(.94)}
.badge{position:absolute;top:-3px;right:-3px;min-width:19px;height:19px;padding:0 5px;border-radius:99px;background:var(--accent);color:#fff;font-size:11px;font-weight:700;display:grid;place-items:center;transition:transform .25s var(--ease)}
.badge[hidden]{display:none}
#themeBtn .moon{display:none}
:root[data-theme="dark"] #themeBtn .sun{display:none}
:root[data-theme="dark"] #themeBtn .moon{display:block}

.panel{position:absolute;right:0;top:56px;width:min(360px,calc(100vw - 36px));background:var(--surface);border:1px solid var(--line);border-radius:18px;padding:8px;box-shadow:0 24px 60px -24px rgba(0,0,0,.45);z-index:20;opacity:0;transform:translateY(-8px) scale(.98);transform-origin:top right;pointer-events:none;transition:opacity .2s,transform .3s var(--ease)}
.panel.open{opacity:1;transform:none;pointer-events:auto}
.panel header{display:flex;justify-content:space-between;align-items:center;padding:10px 12px 8px}
.panel header b{font-size:16px}
.linkbtn{color:var(--accent-text);font-weight:600;font-size:13.5px}
.ann{display:flex;gap:12px;padding:12px;border-radius:12px}
.ann+.ann{border-top:1px solid var(--line);border-radius:0}
.ann i{flex:none;width:9px;height:9px;border-radius:50%;margin-top:7px;background:var(--accent);transition:transform .3s,opacity .3s}
.ann.read i{transform:scale(0);opacity:0}
.ann p{font-weight:550;line-height:1.35}.ann span{font-size:13px;color:var(--muted)}

h3{font-size:18px;font-weight:650;letter-spacing:-.01em;margin-bottom:10px}
.muted{color:var(--muted)}
.view[hidden]{display:none}
.view.enter{animation:enter .4s var(--ease)}
@keyframes enter{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 20px;border-radius:99px;background:var(--accent);color:#fff;font-weight:650;transition:background .2s,transform .15s var(--ease)}
.btn:hover{background:var(--accent-press)}.btn:active{transform:scale(.97)}
.btn:disabled{background:var(--surface-2);color:var(--muted);cursor:not-allowed;transform:none}
.btn.ghost{background:transparent;color:var(--text);border:1px solid var(--line)}
.btn.ghost:hover{border-color:var(--text)}
.btn.sm{padding:7px 14px;font-size:14px}

/* ticket */
.ticket{position:relative;display:grid;grid-template-columns:minmax(0,1fr) 262px;color:#fff;border-radius:26px;background-color:var(--accent);background-image:repeating-radial-gradient(circle at 98% 140%,transparent 0 40px,rgba(92,5,18,.3) 40px 42px)}
.t-main{padding:36px 38px 34px}
.live{display:inline-flex;align-items:center;gap:9px;font-weight:650;font-size:15px}
.dot{width:10px;height:10px;border-radius:50%;background:#fff;animation:pulse 1.8s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(255,255,255,.75)}70%,100%{box-shadow:0 0 0 12px rgba(255,255,255,0)}}
.ticket h2{font-size:clamp(34px,5vw,60px);line-height:.98;font-weight:780;letter-spacing:-.03em;font-stretch:86%;margin:16px 0 12px}
.t-sub{opacity:.92;max-width:44ch}
.t-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:20px}
.t-meta span{padding:6px 13px;border-radius:99px;background:rgba(0,0,0,.2);font-size:13.5px;font-weight:550}
.t-stub{position:relative;padding:30px 26px;display:flex;flex-direction:column;justify-content:center;gap:6px;border-left:2px dashed rgba(255,255,255,.5)}
.t-stub::before,.t-stub::after{content:"";position:absolute;left:-15px;width:28px;height:28px;border-radius:50%;background:var(--bg)}
.t-stub::before{top:-14px}.t-stub::after{bottom:-14px}
.count{font-size:52px;font-weight:750;line-height:1;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.t-stub p{opacity:.9;margin-bottom:12px}
.btn.bone{background:var(--hq-bone);color:var(--hq-red-deep)}
.btn.bone:hover{background:#fff}

.home-grid{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(260px,1fr);gap:44px;margin-top:40px}
.row{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:16px;align-items:center;width:100%;padding:16px 10px;border-top:1px solid var(--line);border-radius:0;transition:background .2s}
.row:first-child{border-top:0}
.row:hover{background:var(--surface)}
.row b{display:block;font-weight:620;font-size:16px}.row span.s{color:var(--muted);font-size:14px}
.ring{position:relative;width:56px;height:56px;display:block}
.ring svg{width:56px;height:56px;transform:rotate(-90deg)}
.ring circle{fill:none;stroke-width:5}
.ring .bg{stroke:var(--line)}
.ring .v{stroke:var(--accent);stroke-linecap:round;stroke-dasharray:157px;stroke-dashoffset:157px;transition:stroke-dashoffset 1s var(--ease) .1s}
.ring.done .v{stroke:var(--reward)}
.go .ring .v{stroke-dashoffset:calc(157px * (1 - var(--p) / 100))}
.ring b{position:absolute;inset:0;display:grid;place-items:center;font-size:13px;font-weight:700}
.tl{position:relative;margin-top:6px}
.tl li{position:relative;padding:0 0 22px 32px}
.tl li::before{content:"";position:absolute;left:5px;top:8px;bottom:-8px;width:2px;background:var(--line)}
.tl li:last-child::before{display:none}
.tl li i{position:absolute;left:0;top:5px;width:12px;height:12px;border-radius:50%;background:var(--bg);border:2px solid var(--muted)}
.tl li.now i{border-color:var(--accent);background:var(--accent)}
.tl li.ok i{border-color:var(--reward);background:var(--reward)}
.tl b{display:block;font-weight:620}.tl span{color:var(--muted);font-size:14px}
.pin{margin-top:26px;padding:18px 20px;border-radius:16px 16px 16px 4px;background:var(--surface-2)}
.pin b{display:block;margin-bottom:4px}
.streak{display:inline-flex;align-items:center;gap:8px;margin-top:16px;padding:8px 14px;border-radius:99px;border:1px solid var(--reward);font-weight:600;font-size:14px}
.streak i{width:10px;height:10px;border-radius:50%;background:var(--reward)}

/* courses */
.tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:22px}
.tile{display:flex;flex-direction:column;border-radius:22px 22px 14px 14px;overflow:hidden;background:var(--surface);border:1px solid var(--line);transition:transform .3s var(--ease)}
.tile:hover{transform:translateY(-4px)}
.art{position:relative;height:150px;padding:16px 18px;display:flex;align-items:flex-end;font-size:76px;font-weight:800;line-height:.75;letter-spacing:-.05em;font-stretch:80%;overflow:hidden}
.a1{background:var(--hq-red);color:rgba(255,255,255,.32)}
.a2{background:var(--hq-red-ink);color:rgba(239,234,225,.3)}
.a3{background:var(--hq-amber);color:rgba(19,19,21,.4)}
.tag{position:absolute;top:14px;right:14px;padding:5px 12px;border-radius:99px;background:var(--hq-ink);color:var(--hq-amber);font-size:13px;font-weight:650;letter-spacing:0;line-height:1.3;font-stretch:100%}
.tile-b{padding:16px 18px 20px}
.tile-b b{display:block;font-size:17px;font-weight:650;line-height:1.25}
.tile-b span{display:block;color:var(--muted);font-size:14px;margin:4px 0 14px}
.tile-b .bar{margin:0}
.bar{height:6px;border-radius:99px;background:var(--surface-2);overflow:hidden}
.bar i{display:block;height:100%;width:0;background:var(--accent);border-radius:99px;transition:width 1s var(--ease) .1s}
.go .bar i{width:calc(var(--p) * 1%)}
.bar.done i{background:var(--reward)}

/* course detail */
.back{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-weight:600;margin-bottom:16px}
.back:hover{color:var(--text)}
.course-grid{display:grid;grid-template-columns:minmax(240px,340px) minmax(0,1fr);gap:44px}
.mod{position:relative;padding:0 0 18px 34px}
.mod::before{content:"";position:absolute;left:8px;top:22px;bottom:-4px;width:2px;background:var(--line)}
.mod:last-child::before{display:none}
.mod .node{position:absolute;left:0;top:2px;width:19px;height:19px;border-radius:50%;display:grid;place-items:center;background:var(--bg);border:2px solid var(--muted);color:var(--muted)}
.mod .node svg{width:11px;height:11px;stroke-width:3}
.mod.ok .node{background:var(--reward);border-color:var(--reward);color:var(--hq-ink)}
.mod.now .node{border-color:var(--accent);box-shadow:0 0 0 4px color-mix(in srgb,var(--accent) 22%,transparent)}
.mod.lock{opacity:.6}
.mod summary{cursor:pointer;font-weight:650;font-size:16px;list-style:none}
.mod summary::-webkit-details-marker{display:none}
.mod small{display:block;color:var(--muted);font-weight:400;font-size:13.5px}
.mod ul{margin-top:8px}
.mod li{padding:5px 0;color:var(--muted);font-size:14.5px}
.mod li.cur{color:var(--text);font-weight:600}
.mod li.cur::before{content:"Current: ";color:var(--accent-text)}
.tabs{display:flex;gap:6px;border-bottom:1px solid var(--line);margin-bottom:22px}
.tabs button{padding:10px 16px;font-weight:600;color:var(--muted);border-bottom:2px solid transparent;margin-bottom:-1px;transition:color .2s}
.tabs button[aria-selected="true"]{color:var(--text);border-color:var(--accent)}
.pane[hidden]{display:none}
.pane{animation:enter .3s var(--ease)}
.dots{display:flex;gap:6px;margin-bottom:18px}
.dots i{height:5px;flex:1;border-radius:9px;background:var(--surface-2);transition:background .3s}
.dots i.on{background:var(--accent)}.dots i.ok{background:var(--reward)}
.q{font-size:clamp(20px,2.4vw,26px);font-weight:650;line-height:1.2;letter-spacing:-.01em;margin-bottom:18px;max-width:34ch}
.opts{display:grid;gap:10px;max-width:560px}
.opt{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);font-weight:550;transition:border-color .2s,transform .2s var(--ease),background .2s}
.opt:hover:not(:disabled){border-color:var(--text);transform:translateX(4px)}
.opt .i{width:18px;height:18px;opacity:0;transition:opacity .2s}
.opt.right{border-color:var(--reward);background:color-mix(in srgb,var(--reward) 18%,var(--surface));animation:pop .4s var(--ease)}
.opt.wrong{border-color:var(--accent);background:color-mix(in srgb,var(--accent) 10%,var(--surface));animation:shake .4s}
.opt.right .i,.opt.wrong .i{opacity:1}
@keyframes pop{50%{transform:scale(1.02)}}
@keyframes shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
.why{margin:16px 0;max-width:56ch;color:var(--muted)}
.why b{color:var(--text)}
.info{padding:22px 24px;border-radius:18px;background:var(--surface-2);max-width:560px}
.info dl{display:grid;grid-template-columns:auto 1fr;gap:6px 22px;margin:14px 0 20px}
.info dt{color:var(--muted)}.info dd{font-weight:600}

/* player */
.live-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(260px,1fr);gap:40px}
.player{border-radius:20px;overflow:hidden;background:#0b0b0d;color:var(--hq-bone)}
.stage{position:relative;aspect-ratio:16/9;display:grid;place-items:center;background:radial-gradient(120% 130% at 15% 0%,var(--hq-red-ink),#0b0b0d 68%);cursor:pointer}
.stage-title{position:absolute;left:22px;bottom:18px;right:24px;font-size:clamp(18px,2.6vw,30px);font-weight:720;line-height:1.05;letter-spacing:-.015em;font-stretch:88%;max-width:16ch}
.bigplay{width:76px;height:76px;border-radius:50%;background:var(--hq-red);color:#fff;display:grid;place-items:center;transition:transform .25s var(--ease),opacity .25s}
.bigplay .i{width:28px;height:28px;fill:currentColor;stroke:none;margin-left:3px}
.stage:hover .bigplay{transform:scale(1.07)}
.player.playing .bigplay{opacity:0;transform:scale(.7)}
.ctrl{display:flex;align-items:center;gap:12px;padding:12px 16px;background:#131315}
.pbtn{width:34px;height:34px;display:grid;place-items:center;border-radius:50%;background:var(--hq-bone);color:var(--hq-ink)}
.pbtn .i{width:16px;height:16px;fill:currentColor;stroke:none}
.tm{font-size:13px;font-variant-numeric:tabular-nums;color:#b9b4aa;min-width:38px}
.scrub{flex:1;min-width:0;appearance:none;-webkit-appearance:none;height:6px;border-radius:99px;background:linear-gradient(90deg,var(--hq-red) var(--pct,0%),#2c2c33 var(--pct,0%));cursor:pointer}
.scrub::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:var(--hq-bone);border:0}
.scrub::-moz-range-thumb{width:15px;height:15px;border-radius:50%;background:var(--hq-bone);border:0}
.spd{padding:4px 10px;border-radius:8px;background:#26262c;font-weight:650;font-size:13px}
.marks{display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;align-items:center}
.chip{display:inline-flex;align-items:center;gap:8px;padding:6px 13px;border-radius:99px;background:var(--surface-2);font-size:13.5px;transition:transform .2s var(--ease)}
.chip:hover{transform:translateY(-2px)}
.chip b{color:var(--accent-text);font-variant-numeric:tabular-nums}
.agenda li{padding:14px 0;border-top:1px solid var(--line);display:flex;gap:14px;align-items:center;justify-content:space-between}
.agenda li:first-child{border-top:0}
.agenda b{display:block;font-weight:620}.agenda span{color:var(--muted);font-size:14px}
.lib{margin-top:40px}
.rep{display:grid;grid-template-columns:130px minmax(0,1fr) 120px;gap:18px;align-items:center;width:100%;padding:14px 10px;border-top:1px solid var(--line);transition:background .2s}
.rep:hover{background:var(--surface)}
.rep .th{height:64px;border-radius:10px;background:linear-gradient(135deg,var(--hq-red-ink),var(--hq-red));display:grid;place-items:center;color:#fff;position:relative;overflow:hidden}
.rep .th .i{fill:currentColor;stroke:none;width:20px;height:20px}
.rep .th u{position:absolute;left:0;bottom:0;height:4px;background:var(--hq-amber);width:calc(var(--p) * 1%)}
.rep b{display:block;font-weight:620}.rep span{color:var(--muted);font-size:14px}
.rep.on{background:var(--surface)}
.rep em{font-style:normal;font-size:13.5px;color:var(--muted);text-align:right}

/* study */
.study-grid{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:40px}
.focus{display:flex;align-items:center;gap:22px;margin-top:22px;padding:18px 22px;border-radius:20px;background:var(--surface-2)}
.frw{position:relative;width:92px;height:92px;flex:none}
.frw svg{width:92px;height:92px;transform:rotate(-90deg)}
.frw circle{fill:none;stroke-width:7}
.frw .bg{stroke:var(--line)}.frw .v{stroke:var(--accent);stroke-linecap:round;stroke-dasharray:326.7;stroke-dashoffset:0;transition:stroke-dashoffset 1s linear}
.frw b{position:absolute;inset:0;display:grid;place-items:center;font-size:19px;font-weight:700;font-variant-numeric:tabular-nums}
.focus p{margin-bottom:10px}.focus p b{display:block;font-size:17px}
.focus .btns{display:flex;gap:8px;flex-wrap:wrap}
.composer{display:grid;gap:10px}
textarea{width:100%;min-height:96px;padding:14px 16px;border-radius:16px;border:1.5px solid var(--line);background:var(--surface);color:var(--text);font:inherit;resize:vertical;transition:border-color .2s}
textarea:focus{outline:none;border-color:var(--accent)}
.notes{margin-top:22px}
.note{display:grid;grid-template-columns:auto 1fr;gap:14px;padding:14px 4px;border-top:1px solid var(--line)}
.note.new{animation:hl 1.4s var(--ease)}
@keyframes hl{0%{background:color-mix(in srgb,var(--reward) 40%,transparent);transform:translateY(-8px)}100%{background:transparent;transform:none}}

/* certificates */
.cert-grid{display:grid;grid-template-columns:minmax(230px,300px) minmax(0,1fr);gap:40px}
.cl button{display:block;width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid transparent;transition:background .2s,border-color .2s}
.cl button+button{margin-top:6px}
.cl button:hover{background:var(--surface)}
.cl button[aria-pressed="true"]{border-color:var(--text);background:var(--surface)}
.cl b{display:block;font-weight:620;line-height:1.25}.cl span{display:flex;align-items:center;gap:6px;font-size:13.5px;color:var(--muted);margin-top:4px}
.cl span .i{width:14px;height:14px}
.cl .ok{color:var(--text)}
.field{display:grid;gap:6px;margin-bottom:20px;max-width:440px}
.field label{font-weight:600}
input[type=text]{padding:13px 16px;border-radius:14px;border:1.5px solid var(--line);background:var(--surface);color:var(--text);font:inherit;transition:border-color .2s}
input[type=text]:focus{outline:none;border-color:var(--accent)}
input[type=text]:disabled{opacity:.5}
.cert-wrap{position:relative;container-type:inline-size;max-width:760px}
.cert{position:relative;aspect-ratio:1.414/1;background:#f7f2e7;color:#131315;border-radius:8px;padding:4cqw;box-shadow:0 26px 60px -28px rgba(0,0,0,.5);transition:filter .4s}
.cert::before{content:"";position:absolute;inset:2.2cqw;border:.4cqw solid #e0142c}
.cert::after{content:"";position:absolute;inset:3.2cqw;border:.14cqw solid #c9a25e}
.cert-in{position:relative;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:1.3cqw}
.cert small{font-size:1.75cqw;color:#5b5750}
.cert h4{font-size:3.3cqw;font-weight:700;letter-spacing:-.01em;font-stretch:88%}
.cert .nm{font-size:6.2cqw;font-weight:760;line-height:1.05;letter-spacing:-.025em;min-height:7.2cqw;padding:0 3cqw .8cqw;border-bottom:.22cqw solid #c9a25e;max-width:88%;overflow-wrap:anywhere}
.cert .nm.empty{color:#b3ab9b;font-weight:500}
.cert .course{font-size:2.9cqw;font-weight:650}
.cert .sig{margin-top:1.4cqw;font-size:2.1cqw;font-style:italic}
.cert .vid{position:absolute;left:0;bottom:-1cqw;font-size:1.4cqw;color:#7c7668}
.seal{position:absolute;right:2.5cqw;bottom:-.5cqw;width:11cqw;height:11cqw;border-radius:50%;background:radial-gradient(circle at 35% 30%,#ecd39c,#c9a25e 55%,#98773a);display:grid;place-items:center;text-align:center;color:#5c0512;font-weight:800;font-size:1.55cqw;line-height:1.1;transform:rotate(-8deg);box-shadow:0 1cqw 2cqw -1cqw rgba(0,0,0,.4)}
.seal.stamp{animation:stamp .7s var(--ease)}
@keyframes stamp{0%{transform:scale(2.4) rotate(-40deg);opacity:0}55%{transform:scale(.9) rotate(-8deg);opacity:1}100%{transform:scale(1) rotate(-8deg)}}
.lockcover{position:absolute;inset:0;display:none;place-items:center;text-align:center;padding:24px}
.lockcover div{background:var(--bg);color:var(--text);padding:20px 26px;border-radius:18px;box-shadow:0 20px 50px -20px rgba(0,0,0,.5)}
.lockcover .i{width:26px;height:26px;margin-bottom:6px}
.cert-wrap.locked .cert{filter:blur(7px) saturate(.5)}
.cert-wrap.locked .lockcover{display:grid}
.cert-actions{margin-top:22px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}

/* admin */
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin-bottom:40px}
.stats div{padding:20px 22px;border-left:1px solid var(--line)}
.stats div:first-child{border-left:0;padding-left:4px}
.stats b{display:block;font-size:34px;font-weight:740;letter-spacing:-.03em;line-height:1.1;font-variant-numeric:tabular-nums}
.stats span{color:var(--muted);font-size:14px}
.admin-grid{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr);gap:44px}
.chart{display:flex;align-items:flex-end;gap:12px;height:220px;padding-top:10px;border-bottom:1px solid var(--line)}
.chart div{flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%;align-items:center;gap:6px}
.chart i{display:block;width:100%;border-radius:8px 8px 3px 3px;background:var(--surface-2);height:0;transition:height .9s var(--ease)}
.chart .cur i{background:var(--accent)}
.go .chart i{height:var(--h)}
.chart em{font-style:normal;font-size:12.5px;color:var(--muted);position:absolute;transform:translateY(24px)}
.axis{display:flex;gap:12px;margin-top:8px;color:var(--muted);font-size:13px}.axis span{flex:1;text-align:center}
.att li{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 0;border-top:1px solid var(--line)}
.att li:first-child{border-top:0}
.att b{display:block;font-weight:620}.att span{color:var(--muted);font-size:14px}
.drop{display:grid;place-items:center;gap:6px;text-align:center;padding:34px 20px;border:2px dashed var(--line);border-radius:22px 22px 22px 6px;width:100%;transition:border-color .2s,background .2s;margin-bottom:34px}
.drop:hover{border-color:var(--accent);background:var(--surface)}
.drop .i{width:28px;height:28px;color:var(--accent)}
.drop b{font-size:17px}.drop span{color:var(--muted)}
.sess{display:grid;grid-template-columns:minmax(0,1fr) 110px 170px;gap:16px;align-items:center;padding:15px 8px;border-top:1px solid var(--line)}
.sess:first-child{border-top:0}
.sess b{display:block;font-weight:620}.sess span.s{color:var(--muted);font-size:14px}
.st{display:inline-flex;align-items:center;gap:8px;font-weight:600;font-size:14px}
.st i{width:9px;height:9px;border-radius:50%;background:var(--reward)}
.st.miss i{background:var(--accent)}
.prog{height:5px;border-radius:9px;background:var(--surface-2);overflow:hidden;margin-top:6px;width:130px}
.prog u{display:block;height:100%;width:0;background:var(--accent);transition:width 1.6s linear}

.toast{position:fixed;left:50%;bottom:calc(26px + env(safe-area-inset-bottom,0px));transform:translate(-50%,30px);opacity:0;background:var(--text);color:var(--bg);padding:12px 20px;border-radius:99px;font-weight:600;font-size:14.5px;z-index:50;pointer-events:none;transition:opacity .25s,transform .4s var(--ease);max-width:calc(100vw - 32px);text-align:center}
.toast.show{opacity:1;transform:translate(-50%,0)}

@media (max-width:1020px){
  .home-grid,.course-grid,.live-grid,.study-grid,.cert-grid,.admin-grid{grid-template-columns:minmax(0,1fr);gap:36px}
}
@media (max-width:820px){
  .app{grid-template-columns:minmax(0,1fr)}
  .side{position:static;height:auto;flex-direction:row;align-items:center;gap:12px;padding:14px 18px 0;border:0}
  .side .role{margin-left:auto;width:180px}
  .me{display:none}
  #nav{position:fixed;left:0;right:0;bottom:0;z-index:30;flex-direction:row;gap:0;padding:6px 6px calc(6px + env(safe-area-inset-bottom,0px));background:var(--bg);border-top:1px solid var(--line)}
  .nav-ind{display:none}
  #nav button{flex:1;flex-direction:column;gap:3px;padding:8px 2px;font-size:11.5px;text-align:center;justify-content:center;align-items:center}
  #nav button[aria-current="page"]{color:var(--accent-text)}
  main{padding-bottom:100px}
  .toast{bottom:calc(90px + env(safe-area-inset-bottom,0px))}
  .ticket{grid-template-columns:minmax(0,1fr)}
  .t-main{padding:28px 24px 24px}
  .t-stub{border-left:0;border-top:2px dashed rgba(255,255,255,.5);padding:24px}
  .t-stub::before{left:-15px;top:-15px}
  .t-stub::after{left:auto;right:-15px;top:-15px;bottom:auto}
  .stats{grid-template-columns:1fr 1fr}
  .stats div:nth-child(3){border-left:0;padding-left:4px}
  .stats div:nth-child(n+3){border-top:1px solid var(--line)}
  .rep{grid-template-columns:96px minmax(0,1fr)}.rep em{display:none}
  .sess{grid-template-columns:minmax(0,1fr)}
  .row{grid-template-columns:auto minmax(0,1fr)}.row .btn{display:none}
}
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
}
</style>
</head>
<body>
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-home" viewBox="0 0 24 24"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></symbol>
  <symbol id="i-book" viewBox="0 0 24 24"><path d="M4 19V5a2 2 0 0 1 2-2h14v15H6a2 2 0 0 0-2 2zm0 0a2 2 0 0 0 2 2h14"/></symbol>
  <symbol id="i-video" viewBox="0 0 24 24"><rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3z"/></symbol>
  <symbol id="i-pen" viewBox="0 0 24 24"><path d="M4 20l4-1 11-11a2.1 2.1 0 0 0-3-3L5 16z"/><path d="M14 7l3 3"/></symbol>
  <symbol id="i-award" viewBox="0 0 24 24"><circle cx="12" cy="9" r="6"/><path d="M8.5 14L7 21l5-3 5 3-1.5-7"/></symbol>
  <symbol id="i-bell" viewBox="0 0 24 24"><path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/></symbol>
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z"/></symbol>
  <symbol id="i-pause" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></symbol>
  <symbol id="i-bookmark" viewBox="0 0 24 24"><path d="M6 3h12v18l-6-4-6 4z"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-lock" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></symbol>
  <symbol id="i-chart" viewBox="0 0 24 24"><path d="M5 20V11M12 20V4M19 20v-6M2 20h20"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></symbol>
  <symbol id="i-back" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></symbol>
</svg>

<div class="app">
  <aside class="side">
    <div class="brand"><span class="mark"></span>HQ Learn</div>
    <div class="role" role="group" aria-label="Switch view">
      <button data-role="student" aria-pressed="true">Student</button>
      <button data-role="admin" aria-pressed="false">Admin</button>
    </div>
    <nav id="nav" aria-label="Main"></nav>
    <div class="me"><span class="av" id="meAv">NE</span><div><b id="meName">Ngozi Eze</b><span id="meSub">Frontend, cohort 7</span></div></div>
  </aside>

  <main>
    <header class="top">
      <h1 id="pageTitle">Welcome back, Ngozi</h1>
      <button class="iconbtn" id="bellBtn" aria-label="Announcements" aria-expanded="false"><svg class="i"><use href="#i-bell"/></svg><span class="badge" id="badge">2</span></button>
      <button class="iconbtn" id="themeBtn" aria-label="Switch between light and dark mode"><svg class="i sun"><use href="#i-sun"/></svg><svg class="i moon"><use href="#i-moon"/></svg></button>
      <div class="panel" id="panel" role="dialog" aria-label="Announcements">
        <header><b>Announcements</b><button class="linkbtn" id="readAll">Mark all as read</button></header>
        <div id="annList"></div>
      </div>
    </header>

    <!-- STUDENT: HOME -->
    <section class="view" data-view="home">
      <div class="ticket">
        <div class="t-main">
          <p class="live"><i class="dot"></i>Live class today</p>
          <h2>Compound components</h2>
          <p class="t-sub">Week 6 of Advanced React Patterns, with Dr. Amaka Obi. Recording is uploaded after class.</p>
          <div class="t-meta"><span>4:00 pm</span><span>90 minutes</span><span>Zoom</span></div>
        </div>
        <div class="t-stub">
          <div class="count" id="count">12:34</div>
          <p>until class starts</p>
          <button class="btn bone" id="joinBtn">Join on Zoom</button>
        </div>
      </div>

      <div class="home-grid">
        <section>
          <h3>Continue learning</h3>
          <div id="homeRows"></div>
          <span class="streak"><i></i>6 day study streak</span>
        </section>
        <section>
          <h3>This week</h3>
          <ul class="tl">
            <li class="now"><i></i><b>Live class: Compound components</b><span>Today, 4:00 pm</span></li>
            <li><i></i><b>Quiz 6</b><span>Thursday, closes 11:59 pm</span></li>
            <li><i></i><b>Mid-course exam</b><span>Friday, 9:00 am, 60 minutes</span></li>
          </ul>
          <div class="pin"><b>Thursday's TypeScript class moves to 5:00 pm</b><span class="muted">Posted today by Dr. Amaka Obi</span><div style="margin-top:10px"><button class="linkbtn" id="openAnn">See all announcements</button></div></div>
        </section>
      </div>
    </section>

    <!-- STUDENT: COURSES -->
    <section class="view" data-view="courses" hidden>
      <div class="tiles" id="tiles"></div>
    </section>

    <!-- STUDENT: COURSE DETAIL -->
    <section class="view" data-view="course" hidden>
      <button class="back" data-go="courses"><svg class="i"><use href="#i-back"/></svg>All courses</button>
      <div class="course-grid">
        <div>
          <h3>Modules</h3>
          <div>
            <details class="mod ok"><summary><span class="node"><svg class="i"><use href="#i-check"/></svg></span>Foundations<small>4 of 4 lessons</small></summary><ul><li>Rendering model</li><li>Hooks refresher</li><li>Effects without surprises</li><li>Module quiz</li></ul></details>
            <details class="mod ok"><summary><span class="node"><svg class="i"><use href="#i-check"/></svg></span>State patterns<small>5 of 5 lessons</small></summary><ul><li>Reducers</li><li>State machines in UI</li><li>Context without re-renders</li></ul></details>
            <details class="mod now" open><summary><span class="node"></span>Composition<small>2 of 5 lessons</small></summary><ul><li>Hooks vs render props</li><li class="cur">Compound components</li><li>Slots and polymorphic props</li><li>Headless UI</li></ul></details>
            <details class="mod lock"><summary><span class="node"><svg class="i"><use href="#i-lock"/></svg></span>Performance<small>Unlocks after Composition</small></summary></details>
          </div>
        </div>
        <div>
          <div class="tabs" role="tablist">
            <button role="tab" data-tab="rec" aria-selected="true">Recordings</button>
            <button role="tab" data-tab="quiz" aria-selected="false">Quiz 6</button>
            <button role="tab" data-tab="exam" aria-selected="false">Exam</button>
          </div>
          <div class="pane" data-pane="rec">
            <p class="muted" style="margin-bottom:12px">Every live class is recorded and added here within a few hours.</p>
            <div id="courseReps"></div>
          </div>
          <div class="pane" data-pane="quiz" hidden><div id="quiz"></div></div>
          <div class="pane" data-pane="exam" hidden>
            <div class="info">
              <h3>Mid-course exam</h3>
              <p class="muted">Covers modules 1 to 3. Answers save automatically, so a dropped connection will not lose your work.</p>
              <dl><dt>Opens</dt><dd>Friday, 9:00 am</dd><dt>Duration</dt><dd>60 minutes</dd><dt>Attempts</dt><dd>1</dd></dl>
              <button class="btn" disabled>Opens in 4 days</button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- STUDENT: LIVE -->
    <section class="view" data-view="live" hidden>
      <div class="live-grid">
        <div>
          <div data-mount="live"></div>
          <div class="marks" id="marks"><button class="btn ghost sm" id="addMark"><svg class="i" style="width:16px;height:16px"><use href="#i-bookmark"/></svg>Bookmark this moment</button></div>
        </div>
        <div>
          <h3>Coming up</h3>
          <ul class="agenda">
            <li><div><b>Compound components</b><span>Today, 4:00 pm</span></div><button class="btn sm" data-toast="Opening Zoom. This is a preview.">Join</button></li>
            <li><div><b>TypeScript: Generics in practice</b><span>Thursday, 5:00 pm</span></div><button class="btn ghost sm" data-toast="Added to your calendar.">Remind me</button></li>
          </ul>
        </div>
      </div>
      <div class="lib"><h3>Replay library</h3><div id="lib"></div></div>
    </section>

    <!-- STUDENT: STUDY -->
    <section class="view" data-view="study" hidden>
      <div class="study-grid">
        <div>
          <div data-mount="study"></div>
          <div class="focus">
            <div class="frw"><svg viewBox="0 0 92 92" aria-hidden="true"><circle class="bg" cx="46" cy="46" r="41.5"/><circle class="v" id="fRing" cx="46" cy="46" r="41.5" style="stroke-dasharray:260.7;"/></svg><b id="fTime">25:00</b></div>
            <div><p><b>Focus timer</b><span class="muted">25 minutes, then a short break.</span></p><div class="btns"><button class="btn sm" id="fToggle">Start focus</button><button class="btn ghost sm" id="fReset">Reset</button></div></div>
          </div>
        </div>
        <div>
          <h3>Notes</h3>
          <div class="composer">
            <textarea id="noteText" placeholder="Write what you just learned. It links to this moment in the recording."></textarea>
            <div><button class="btn" id="addNote" disabled>Add note at 0:00</button></div>
          </div>
          <div class="notes" id="notes"></div>
        </div>
      </div>
    </section>

    <!-- STUDENT: CERTS -->
    <section class="view" data-view="certs" hidden>
      <div class="cert-grid">
        <div class="cl" id="certList"></div>
        <div>
          <div class="field"><label for="certName">Name on certificate</label><input type="text" id="certName" placeholder="Type your full name" autocomplete="name"><span class="muted" style="font-size:13.5px">Check the spelling before you download.</span></div>
          <div class="cert-wrap" id="certWrap">
            <div class="cert">
              <div class="cert-in">
                <small>HQ Learn certificate of completion</small>
                <h4>This certifies that</h4>
                <div class="nm empty" id="certNm">Your name</div>
                <small>has completed</small>
                <div class="course" id="certCourse">Design Systems with Tailwind</div>
                <div class="sig">Dr. Amaka Obi</div>
                <span class="vid">21 September 2026, ID HQ-7F3K-2291</span>
                <span class="seal" id="seal">HQ<br>Learn<br>Verified</span>
              </div>
            </div>
            <div class="lockcover"><div><svg class="i"><use href="#i-lock"/></svg><p><b id="lockMsg">Finish the course to unlock</b></p></div></div>
          </div>
          <div class="cert-actions"><button class="btn" id="dlBtn" disabled>Download PDF</button><span class="muted" id="dlHint">Type your name to continue.</span></div>
        </div>
      </div>
    </section>

    <!-- ADMIN: OVERVIEW -->
    <section class="view" data-view="overview" hidden>
      <div class="stats">
        <div><b>248</b><span>Active students</span></div>
        <div><b>86%</b><span>Class attendance</span></div>
        <div><b>74%</b><span>Average quiz score</span></div>
        <div><b id="pendingCount">2</b><span>Recordings missing</span></div>
      </div>
      <div class="admin-grid">
        <section>
          <h3>Attendance by week</h3>
          <div class="chart" id="chart"></div>
          <div class="axis" id="axis"></div>
        </section>
        <section>
          <h3>Needs a nudge</h3>
          <ul class="att" id="att"></ul>
        </section>
      </div>
    </section>

    <!-- ADMIN: RECORDINGS -->
    <section class="view" data-view="recs" hidden>
      <button class="drop" id="drop"><svg class="i"><use href="#i-upload"/></svg><b>Drop a Zoom recording here</b><span>Or choose a file. We match it to the session for you.</span></button>
      <h3>Sessions</h3>
      <div id="sessions"></div>
    </section>
  </main>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>

<script>
(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
const fmt=s=>{s=Math.max(0,Math.floor(s));const h=Math.floor(s/3600),m=Math.floor(s%3600/60),c=s%60;return (h?h+':'+String(m).padStart(2,'0'):m)+':'+String(c).padStart(2,'0')};
const icon=(n,c='')=>`<svg class="i ${c}"><use href="#i-${n}"/></svg>`;
const ring=(p,c='')=>`<span class="ring ${c}" style="--p:${p}"><svg viewBox="0 0 56 56" aria-hidden="true"><circle class="bg" cx="28" cy="28" r="25"/><circle class="v" cx="28" cy="28" r="25"/></svg><b>${p}%</b></span>`;
let toastT;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}

/* data */
const COURSES=[
 {id:'react',name:'Advanced React Patterns',p:68,next:'Compound components',lessons:18,art:'a1',g:'Re'},
 {id:'ts',name:'TypeScript for Product Teams',p:42,next:'Generics in practice',lessons:22,art:'a2',g:'Ts'},
 {id:'ds',name:'Design Systems with Tailwind',p:100,next:'Completed',lessons:14,art:'a3',g:'Ds'}];
const REPLAYS=[
 {id:'w5',title:'Week 5: Hooks vs render props',dur:3492,seen:.74,date:'Mon 14 Sep'},
 {id:'w4',title:'Week 4: Context without the re-renders',dur:3880,seen:1,date:'Mon 7 Sep'},
 {id:'w3',title:'Week 3: State machines in UI',dur:3125,seen:.2,date:'Mon 31 Aug'}];
const ANN=[
 {t:"Thursday's TypeScript class moves to 5:00 pm",m:'Today',u:true},
 {t:'Mid-course exam opens Friday at 9:00 am. 60 minutes, one attempt.',m:'Yesterday',u:true},
 {t:'Week 5 replays are now available.',m:'Mon 14 Sep',u:false}];
const NAV={
 student:[['home','Home','home'],['courses','Courses','book'],['live','Live & Replays','video'],['study','Study','pen'],['certs','Certificates','award']],
 admin:[['overview','Overview','chart'],['recs','Recordings','upload']]};
const TITLES={home:'Welcome back, Ngozi',courses:'My courses',course:'Advanced React Patterns',live:'Live classes and replays',study:'Study session',certs:'Certificates',overview:'Cohort overview',recs:'Recordings'};
let role='student',cur='home';

/* theme */
function applyTheme(t){document.documentElement.dataset.theme=t;try{localStorage.setItem('hq-theme',t)}catch(e){}}
try{const s=localStorage.getItem('hq-theme');if(s==='dark'||s==='light')document.documentElement.dataset.theme=s}catch(e){}
$('#themeBtn').addEventListener('click',e=>{
  const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
  const r=e.currentTarget.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!document.startViewTransition||reduce){applyTheme(next);return}
  try{
    const vt=document.startViewTransition(()=>applyTheme(next));
    const rad=Math.hypot(Math.max(x,innerWidth-x),Math.max(y,innerHeight-y));
    vt.ready.then(()=>{document.documentElement.animate({clipPath:[`circle(0px at ${x}px ${y}px)`,`circle(${rad}px at ${x}px ${y}px)`]},{duration:650,easing:'cubic-bezier(.2,.7,.2,1)',pseudoElement:'::view-transition-new(root)'})}).catch(()=>{});
  }catch(err){applyTheme(next)}
});

/* nav + routing */
const nav=$('#nav');
function buildNav(){nav.innerHTML='<span class="nav-ind"></span>'+NAV[role].map(([id,l,ic])=>`<button data-go="${id}">${icon(ic)}<span>${l}</span></button>`).join('')}
function moveInd(){const ind=$('.nav-ind'),b=$('#nav [aria-current]');if(!ind||!b)return;ind.style.transform=`translateY(${b.offsetTop}px)`;ind.style.height=b.offsetHeight+'px';ind.style.opacity=1}
function go(id){
  cur=id;
  $$('.view').forEach(v=>{v.hidden=v.dataset.view!==id;v.classList.remove('go','enter')});
  const v=$(`.view[data-view="${id}"]`);void v.offsetWidth;v.classList.add('enter');
  requestAnimationFrame(()=>requestAnimationFrame(()=>v.classList.add('go')));
  const navId=id==='course'?'courses':id;
  $$('#nav button').forEach(b=>{b.dataset.go===navId?b.setAttribute('aria-current','page'):b.removeAttribute('aria-current')});
  moveInd();$('#pageTitle').textContent=TITLES[id];closePanel();window.scrollTo(0,0);
}
function setRole(r){
  role=r;$$('.role button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.role===r));
  buildNav();
  $('#meAv').textContent=r==='admin'?'AO':'NE';$('#meName').textContent=r==='admin'?'Dr. Amaka Obi':'Ngozi Eze';$('#meSub').textContent=r==='admin'?'Instructor and admin':'Frontend, cohort 7';
  go(NAV[r][0][0]);
}
document.addEventListener('click',e=>{
  const g=e.target.closest('[data-go]');if(g){go(g.dataset.go);return}
  const rl=e.target.closest('[data-role]');if(rl){setRole(rl.dataset.role);return}
  const c=e.target.closest('[data-course]');if(c){openCourse(c.dataset.course);return}
  const t=e.target.closest('[data-toast]');if(t){toast(t.dataset.toast);return}
  if(!e.target.closest('#panel')&&!e.target.closest('#bellBtn'))closePanel();
});
addEventListener('resize',moveInd);
document.fonts&&document.fonts.ready.then(moveInd);

/* home + courses */
$('#homeRows').innerHTML=COURSES.filter(c=>c.p<100).map(c=>`<button class="row" data-course="${c.id}">${ring(c.p)}<span><b>${c.name}</b><span class="s">Next: ${c.next}</span></span><span class="btn ghost sm">Resume</span></button>`).join('');
$('#tiles').innerHTML=COURSES.map(c=>`<button class="tile" data-course="${c.id}"><span class="art ${c.art}">${c.g}${c.p===100?'<span class="tag">Completed</span>':''}</span><span class="tile-b"><b>${c.name}</b><span>${c.lessons} lessons. ${c.p===100?'Certificate ready.':'Next: '+c.next}</span><span class="bar ${c.p===100?'done':''}" style="--p:${c.p};display:block"><i></i></span></span></button>`).join('');
function openCourse(id){
  const c=COURSES.find(x=>x.id===id);
  if(c.p===100){go('certs');return}
  TITLES.course=c.name;go('course');
}
let cd=754;const cnt=$('#count');
setInterval(()=>{cd=Math.max(0,cd-1);cnt.textContent=cd?fmt(cd):'Live'},1000);
$('#joinBtn').addEventListener('click',()=>toast('Opening Zoom. This is a preview.'));

/* announcements */
function renderAnn(){
  $('#annList').innerHTML=ANN.map((a,i)=>`<div class="ann ${a.u?'':'read'}" data-i="${i}"><i></i><div><p>${a.t}</p><span>${a.m}</span></div></div>`).join('');
  const n=ANN.filter(a=>a.u).length;const b=$('#badge');b.textContent=n;b.hidden=!n;
}
function closePanel(){$('#panel').classList.remove('open');$('#bellBtn').setAttribute('aria-expanded','false')}
$('#bellBtn').addEventListener('click',()=>{const p=$('#panel');const o=!p.classList.contains('open');p.classList.toggle('open',o);$('#bellBtn').setAttribute('aria-expanded',o)});
$('#openAnn').addEventListener('click',e=>{e.stopPropagation();$('#panel').classList.add('open');window.scrollTo(0,0)});
$('#readAll').addEventListener('click',()=>{ANN.forEach(a=>a.u=false);renderAnn()});
addEventListener('keydown',e=>{if(e.key==='Escape')closePanel()});
renderAnn();

/* player (shared state across Live and Study) */
const P={r:REPLAYS[0],t:REPLAYS[0].dur*REPLAYS[0].seen,playing:false,speed:1,marks:[]};
const SPEEDS=[1,1.25,1.5,2];
function playerHTML(){return `<div class="player">
 <div class="stage" data-a="toggle"><p class="stage-title"></p><span class="bigplay" aria-hidden="true">${icon('play')}</span></div>
 <div class="ctrl">
  <button class="pbtn" data-a="toggle" aria-label="Play or pause">${icon('play')}</button>
  <span class="tm cur">0:00</span>
  <input type="range" class="scrub" min="0" max="100" step="1" value="0" aria-label="Seek">
  <span class="tm dur">0:00</span>
  <button class="spd" data-a="speed" aria-label="Playback speed">1×</button>
 </div></div>`}
$$('[data-mount]').forEach(m=>m.innerHTML=playerHTML());
function renderPlayers(){
  $$('.player').forEach(el=>{
    el.classList.toggle('playing',P.playing);
    $('.stage-title',el).textContent=P.r.title;
    const s=$('.scrub',el);s.max=P.r.dur;if(document.activeElement!==s||!P.dragging)s.value=P.t;
    s.style.setProperty('--pct',(P.t/P.r.dur*100)+'%');
    $('.cur',el).textContent=fmt(P.t);$('.dur',el).textContent=fmt(P.r.dur);
    $('.pbtn use',el).setAttribute('href',P.playing?'#i-pause':'#i-play');
    $('.spd',el).textContent=P.speed+'×';
  });
  $('#addNote').textContent='Add note at '+fmt(P.t);
}
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-a]');if(!a)return;
  if(a.dataset.a==='toggle'){P.playing=!P.playing;renderPlayers()}
  if(a.dataset.a==='speed'){P.speed=SPEEDS[(SPEEDS.indexOf(P.speed)+1)%SPEEDS.length];renderPlayers()}
});
document.addEventListener('input',e=>{if(e.target.classList&&e.target.classList.contains('scrub')){P.t=+e.target.value;renderPlayers()}});
setInterval(()=>{if(P.playing){P.t=Math.min(P.r.dur,P.t+.25*P.speed);if(P.t>=P.r.dur)P.playing=false;renderPlayers()}},250);
function seek(t){P.t=t;renderPlayers()}
function renderMarks(){
  $$('#marks .chip').forEach(c=>c.remove());
  P.marks.forEach(m=>{const b=document.createElement('button');b.className='chip';b.innerHTML=`${icon('bookmark')}<b>${fmt(m)}</b>`;b.querySelector('svg').style.cssText='width:14px;height:14px';b.onclick=()=>seek(m);$('#marks').appendChild(b)});
}
$('#addMark').addEventListener('click',()=>{const t=Math.floor(P.t);if(!P.marks.includes(t)){P.marks.push(t);P.marks.sort((a,b)=>a-b)}renderMarks();toast('Bookmarked at '+fmt(t))});
function repRows(){return REPLAYS.map(r=>`<button class="rep ${r.id===P.r.id?'on':''}" data-rep="${r.id}"><span class="th" style="--p:${Math.round(r.seen*100)}">${icon('play')}<u></u></span><span><b>${r.title}</b><span>${r.date}, ${fmt(r.dur)}</span></span><em>${r.seen>=1?'Watched':r.seen>0?Math.round(r.seen*100)+'% watched':'New'}</em></button>`).join('')}
function renderLib(){$('#lib').innerHTML=repRows();$('#courseReps').innerHTML=repRows()}
document.addEventListener('click',e=>{
  const r=e.target.closest('[data-rep]');if(!r)return;
  P.r=REPLAYS.find(x=>x.id===r.dataset.rep);P.t=P.r.seen<1?P.r.dur*P.r.seen:0;P.playing=false;renderLib();renderPlayers();
  if(cur!=='live')go('live');else{toast(P.r.seen<1&&P.r.seen>0?'Resuming where you left off.':'Starting from the beginning.');window.scrollTo(0,0)}
});
renderLib();renderPlayers();

/* study */
const NOTES=[{t:612,text:'Children read shared state through context, not props.'},{t:1804,text:'Static properties like Tabs.Panel make the API feel like one unit.'}];
function renderNotes(newest){
  $('#notes').innerHTML=NOTES.map((n,i)=>`<div class="note ${i===newest?'new':''}"><button class="chip" data-seek="${n.t}"><b>${fmt(n.t)}</b></button><p>${n.text.replace(/</g,'&lt;')}</p></div>`).join('');
}
document.addEventListener('click',e=>{const s=e.target.closest('[data-seek]');if(s){seek(+s.dataset.seek);toast('Jumped to '+fmt(+s.dataset.seek))}});
$('#noteText').addEventListener('input',e=>{$('#addNote').disabled=!e.target.value.trim()});
$('#addNote').addEventListener('click',()=>{
  const v=$('#noteText').value.trim();if(!v)return;
  NOTES.push({t:Math.floor(P.t),text:v});NOTES.sort((a,b)=>a.t-b.t);
  renderNotes(NOTES.findIndex(n=>n.text===v));$('#noteText').value='';$('#addNote').disabled=true;
});
renderNotes();
const F={total:1500,left:1500,run:false,id:null};
function renderF(){$('#fTime').textContent=fmt(F.left);$('#fRing').style.strokeDashoffset=(260.7*(1-F.left/F.total));$('#fToggle').textContent=F.run?'Pause':(F.left<F.total?'Resume focus':'Start focus')}
$('#fToggle').addEventListener('click',()=>{
  if(F.run){clearInterval(F.id);F.run=false}
  else{F.run=true;F.id=setInterval(()=>{F.left--;if(F.left<=0){clearInterval(F.id);F.run=false;F.left=F.total;toast('Focus session done. Take a 5 minute break.')}renderF()},1000)}
  renderF();
});
$('#fReset').addEventListener('click',()=>{clearInterval(F.id);F.run=false;F.left=F.total;renderF()});
renderF();

/* course tabs + quiz */
$$('.tabs button').forEach(b=>b.addEventListener('click',()=>{
  $$('.tabs button').forEach(x=>x.setAttribute('aria-selected',x===b));
  $$('.pane').forEach(p=>p.hidden=p.dataset.pane!==b.dataset.tab);
}));
const QZ=[
 {q:'Which pattern lets a parent share implicit state with its children without prop drilling?',o:['Compound components','Global CSS variables','Uncontrolled inputs','Server components'],a:0,why:'Compound components share state through context, so children stay flexible.'},
 {q:'What does useReducer return?',o:['[state, setState]','[state, dispatch]','A memoized callback','A ref object'],a:1,why:'It returns the current state and a dispatch function.'},
 {q:'Why memoize a context provider value?',o:['To skip re-rendering consumers when nothing changed','To make the value immutable','To send it to the server','To avoid using hooks'],a:0,why:'A new object on every render makes every consumer re-render.'}];
const Z={i:0,score:0,done:false,picked:null,res:[]};
function renderQuiz(){
  const el=$('#quiz');
  const dots=`<div class="dots">${QZ.map((_,k)=>`<i class="${Z.res[k]===true?'ok':Z.res[k]===false?'on':k===Z.i&&!Z.done?'on':''}"></i>`).join('')}</div>`;
  if(Z.i>=QZ.length){
    el.innerHTML=`${dots}<h3>You got ${Z.score} of ${QZ.length}</h3><p class="why">Your score is saved to your gradebook. You can retry as many times as you like before Thursday.</p><button class="btn" id="retry">Retry quiz</button>`;
    $('#retry').onclick=()=>{Z.i=0;Z.score=0;Z.picked=null;Z.res=[];renderQuiz()};return;
  }
  const q=QZ[Z.i],ans=Z.picked!==null;
  el.innerHTML=`${dots}<p class="q">${q.q}</p><div class="opts">${q.o.map((o,k)=>{
    let c='',ic='';
    if(ans){if(k===q.a){c='right';ic=icon('check')}else if(k===Z.picked){c='wrong';ic=icon('x')}}
    return `<button class="opt ${c}" data-k="${k}" ${ans?'disabled':''}>${ic||icon('check')}<span>${o}</span></button>`}).join('')}</div>
    ${ans?`<p class="why"><b>${Z.picked===q.a?'Correct.':'Not quite.'}</b> ${q.why}</p><button class="btn" id="nextQ">${Z.i===QZ.length-1?'See score':'Next question'}</button>`:''}`;
  $$('.opt',el).forEach(b=>b.onclick=()=>{const k=+b.dataset.k;Z.picked=k;const ok=k===q.a;if(ok)Z.score++;Z.res[Z.i]=ok;renderQuiz()});
  const n=$('#nextQ');if(n)n.onclick=()=>{Z.i++;Z.picked=null;renderQuiz()};
}
renderQuiz();

/* certificates */
const CERTS=[{c:COURSES[2]},{c:COURSES[0]},{c:COURSES[1]}];
let ci=0,certName='';
function renderCertList(){
  $('#certList').innerHTML=CERTS.map((x,i)=>{const d=x.c.p===100;return `<button data-ci="${i}" aria-pressed="${i===ci}"><b>${x.c.name}</b><span class="${d?'ok':''}">${d?icon('check')+'Ready to download':icon('lock')+x.c.p+'% complete'}</span></button>`}).join('');
}
function updateCert(){
  const x=CERTS[ci],done=x.c.p===100,ok=certName.trim().length>=2;
  $('#certCourse').textContent=x.c.name;
  const nm=$('#certNm');nm.textContent=ok?certName.trim():'Your name';nm.classList.toggle('empty',!ok);
  $('#certWrap').classList.toggle('locked',!done);
  $('#lockMsg').textContent=`Finish the last ${100-x.c.p}% to unlock`;
  $('#certName').disabled=!done;
  $('#dlBtn').disabled=!(done&&ok);
  $('#dlHint').textContent=!done?'Complete every lesson and pass the exam.':ok?'Your certificate is ready.':'Type your name to continue.';
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-ci]');if(b){ci=+b.dataset.ci;renderCertList();updateCert()}});
$('#certName').addEventListener('input',e=>{certName=e.target.value;updateCert()});
$('#dlBtn').addEventListener('click',()=>{
  const b=$('#dlBtn');if(b.disabled)return;b.disabled=true;b.textContent='Preparing PDF…';
  setTimeout(()=>{const s=$('#seal');s.classList.remove('stamp');void s.offsetWidth;s.classList.add('stamp');b.textContent='Downloaded';toast('Certificate ready. In the real app this saves a PDF.');
    setTimeout(()=>{b.textContent='Download PDF';updateCert()},2200)},1000);
});
renderCertList();updateCert();

/* admin */
const WEEKS=[72,78,81,76,84,88,83,86];
$('#chart').innerHTML=WEEKS.map((v,i)=>`<div class="${i===WEEKS.length-1?'cur':''}" title="Week ${i+1}: ${v}% attended"><i style="--h:${v}%"></i></div>`).join('');
$('#axis').innerHTML=WEEKS.map((v,i)=>`<span>W${i+1}</span>`).join('');
const ATT=[['Chidera Nwosu','Missed 3 live classes'],['Femi Balogun','No quiz attempts yet'],['Amina Yusuf','Inactive for 12 days']];
$('#att').innerHTML=ATT.map(([n,s])=>`<li><div><b>${n}</b><span>${s}</span></div><button class="btn ghost sm">Send reminder</button></li>`).join('');
$$('#att button').forEach(b=>b.addEventListener('click',()=>{b.textContent='Sent';b.disabled=true;toast('Reminder sent.')}));
const SESS=[
 {t:'Week 5: Hooks vs render props',d:'Mon 14 Sep',ok:true},
 {t:'Week 4: Context without the re-renders',d:'Mon 7 Sep',ok:true},
 {t:'TypeScript: Utility types',d:'Thu 17 Sep',ok:false},
 {t:'Week 3: State machines in UI',d:'Mon 31 Aug',ok:false}];
function renderSess(){
  $('#sessions').innerHTML=SESS.map((s,i)=>`<div class="sess"><div><b>${s.t}</b><span class="s">${s.d}</span></div><span class="st ${s.ok?'':'miss'}"><i></i>${s.up?'Uploading':s.ok?'Attached':'Missing'}</span><div>${s.up?'<div class="prog"><u></u></div>':s.ok?'':`<button class="btn sm" data-att="${i}">Attach recording</button>`}</div></div>`).join('');
  const m=SESS.filter(s=>!s.ok).length;$('#pendingCount').textContent=m;
  $$('.prog u').forEach(u=>{void u.offsetWidth;u.style.width='100%'});
}
function attach(i){
  const s=SESS[i];if(!s||s.ok||s.up)return;s.up=true;renderSess();
  setTimeout(()=>{s.up=false;s.ok=true;renderSess();toast('Recording attached. Students can replay it now.')},1700);
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-att]');if(b)attach(+b.dataset.att)});
$('#drop').addEventListener('click',()=>{const i=SESS.findIndex(s=>!s.ok&&!s.up);if(i<0){toast('Every session already has a recording.');return}attach(i)});
renderSess();

buildNav();go('home');
})();
</script>
</body>
</html>

```
