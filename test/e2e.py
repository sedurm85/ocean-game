"""헤드리스 브라우저 E2E: 닉네임 → 기지 → 잠수 → 올라가기 → 정산 → 장비 구매. Firebase 도메인은 차단해 오프라인 경로를 검증한다.
실행: python3 test/e2e.py  (로컬 서버 8765 자동 기동)"""
import subprocess, time, sys, os, json
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'test', 'shots')
os.makedirs(OUT, exist_ok=True)
srv = subprocess.Popen([sys.executable, '-m', 'http.server', '8765'], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
time.sleep(0.8)
errors = []
try:
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, locale='ko-KR')
        page = ctx.new_page()
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.route('**/*firebase*/**', lambda r: r.abort())
        page.route('**/*googleapis.com/**', lambda r: r.abort())
        page.route('**/*firebaseio.com/**', lambda r: r.abort())
        page.goto('http://localhost:8765/index.html')
        page.wait_for_selector('#nickname-screen:not(.hidden)', timeout=5000)
        page.screenshot(path=f'{OUT}/01-nickname.png')
        page.fill('#nickname-input', '테스트봇')
        page.click('#nickname-btn')
        page.wait_for_selector('#surface-screen:not(.hidden)', timeout=5000)
        page.screenshot(path=f'{OUT}/02-surface.png')
        # 잠수 → 8초 후 올라가기
        page.click('#dive-btn', force=True)
        page.wait_for_selector('#dive-screen:not(.hidden)')
        time.sleep(7)
        # 이벤트가 떠 있으면 첫 선택지
        for _ in range(3):
            if page.is_visible('#event-modal:not(.hidden)'):
                page.screenshot(path=f'{OUT}/03-event.png')
                page.click('#event-choices button >> nth=0')
                time.sleep(1.3)
        page.screenshot(path=f'{OUT}/04-dive.png')
        depth = page.inner_text('#depth')
        page.click('#ascend-btn')
        page.wait_for_selector('#result-modal:not(.hidden)', timeout=30000)
        page.screenshot(path=f'{OUT}/05-result.png')
        title = page.inner_text('#result-title')
        page.click('#result-close')
        page.wait_for_selector('#surface-screen:not(.hidden)')
        gold = page.inner_text('#gold')
        page.click('#shop-btn')
        page.wait_for_selector('#shop-modal:not(.hidden)')
        page.screenshot(path=f'{OUT}/06-shop.png')
        buy_enabled = page.evaluate("[...document.querySelectorAll('#shop-list .buy')].filter(b=>!b.disabled).length")
        if buy_enabled:
            page.click('#shop-list .buy:not([disabled]) >> nth=0')
        gold_after = page.inner_text('#gold')
        page.click('#shop-modal [data-close]')
        page.click('#codex-btn'); page.wait_for_selector('#codex-modal:not(.hidden)'); page.screenshot(path=f'{OUT}/07-codex.png'); page.click('#codex-modal [data-close]')
        page.click('#rank-btn'); page.wait_for_selector('#rank-modal:not(.hidden)'); time.sleep(0.5); page.screenshot(path=f'{OUT}/08-rank.png'); page.click('#rank-modal [data-close]')
        page.click('#prestige-btn'); page.wait_for_selector('#prestige-modal:not(.hidden)'); page.screenshot(path=f'{OUT}/09-prestige.png'); page.click('#prestige-modal [data-close]')
        # 저장 → 새로고침 후 복원
        page.reload(); page.wait_for_selector('#surface-screen:not(.hidden)', timeout=5000)
        gold_reload = page.inner_text('#gold')
        saved = page.evaluate("localStorage.getItem('oceanSaveV3')")
        print(json.dumps({'depth_at_ascend': depth, 'result': title, 'gold': gold, 'buy_enabled': buy_enabled, 'gold_after_buy': gold_after, 'gold_after_reload': gold_reload, 'save_len': len(saved or ''), 'console_errors': errors}, ensure_ascii=False))
        b.close()
finally:
    srv.terminate()
