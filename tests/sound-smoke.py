"""Run with a server at port 8000 and Python Playwright / Chromium installed."""
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                               args=['--no-sandbox', '--autoplay-policy=document-user-activation-required'])
    for mobile in (False, True):
        context = browser.new_context(**(p.devices['iPhone 13'] if mobile else {}))
        context.add_init_script('''
          window.audioPlayers = [];
          const NativeAudio = window.Audio;
          window.Audio = function(...args) {
            const audio = new NativeAudio(...args);
            window.audioPlayers.push(audio);
            audio.addEventListener('playing', () => {
              if (!audio.muted) window.lastSound = audio.src;
            });
            return audio;
          };
        ''')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.clock.install()
        page.goto('http://127.0.0.1:8000/')
        page.locator('details.settings').first.locator('summary').click()
        for sound in ('bell', 'wood', 'bird', 'water', 'bowl'):
            page.locator('#sound-choice').select_option(sound)
            page.locator('[data-view="start"] [data-action="test-sound"]').click()
            page.wait_for_function('(name) => window.lastSound?.endsWith(name + ".wav") && !audioPlayers[0].paused && !audioPlayers[0].muted && audioPlayers[0].readyState >= 2', arg=sound)
            assert page.evaluate('audioPlayers[0].error') is None
            page.wait_for_function('() => audioPlayers[0].currentTime > .16')
        page.reload()
        expect(page.locator('#sound-choice')).to_have_value('bowl')
        page.locator('#intention').fill('音の検証')
        page.locator('[data-work="10"]').click()
        page.locator('#start-form button[type="submit"]').click()
        page.wait_for_function('() => audioPlayers[0].paused && !audioPlayers[0].muted')
        page.clock.fast_forward(600_100)
        expect(page.locator('[data-view="review"]')).to_be_visible()
        page.wait_for_function('() => window.lastSound?.endsWith("bowl.wav") && !audioPlayers[0].paused')
        page.locator('[data-action="to-break"]').click()
        page.evaluate('window.lastSound = null')
        page.clock.fast_forward(300_100)
        expect(page.locator('[data-view="start"]')).to_be_visible()
        page.wait_for_function('() => window.lastSound?.endsWith("bowl.wav") && !audioPlayers[0].paused')
        # Explicitly simulate an autoplay rejection, then retry via a gesture.
        page.locator('details.settings').first.evaluate('(e) => e.open = true')
        page.evaluate('''() => { window.realPlay = HTMLMediaElement.prototype.play;
          HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); }''')
        page.locator('[data-view="start"] [data-action="test-sound"]').click()
        expect(page.locator('#sound-notice')).to_be_visible()
        page.evaluate('() => { HTMLMediaElement.prototype.play = window.realPlay; }')
        page.locator('#sound-notice button').click()
        expect(page.locator('#sound-notice')).to_be_hidden()
        page.wait_for_function('() => !audioPlayers[0].paused && !audioPlayers[0].muted')
        assert not errors, errors
        print('PASS', 'mobile' if mobile else 'desktop', '5 previews, persistence, focus/break alarms, rejection/retry')
        context.close()
    browser.close()
