"""Run with a server at port 8000 and Python Playwright / Chromium installed."""
import os
from playwright.sync_api import sync_playwright, expect

with sync_playwright() as p:
    browser = p.chromium.launch(executable_path='/usr/bin/chromium', headless=True,
                               args=['--no-sandbox', '--autoplay-policy=document-user-activation-required'])
    for mobile in (False, True):
        context = browser.new_context(**(p.devices['iPhone 13'] if mobile else {}))
        context.add_init_script('''
          window.audioPlayers = [];
          window.playedSources = [];
          const NativeAudio = window.Audio;
          window.Audio = function(...args) {
            const audio = new NativeAudio(...args);
            window.audioPlayers.push(audio);
            audio.addEventListener('playing', () => {
              if (!audio.muted) { window.lastSound = audio.src; window.playedSources.push(audio.src); }
            });
            const originalPlay = audio.play.bind(audio);
            audio.play = function() {
              const result = originalPlay();
              if (!audio.src.endsWith('silence.wav')) return result;
              // Reproduce iOS resolving play after the original audible prefix.
              return result.then(() => new Promise(resolve => audio.addEventListener('ended', resolve, {once: true})));
            };
            return audio;
          };
        ''')
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.clock.install()
        page.goto(os.environ.get('POMODORO_TEST_URL', 'http://127.0.0.1:8000/'))
        page.locator('details.settings').first.locator('summary').click()
        page.clock.run_for(800)
        assert page.evaluate('window.playedSources.every(src => src.endsWith("silence.wav"))')
        page.wait_for_function('() => audioPlayers[0].paused')
        expect(page.locator('#alarm-controls')).to_be_hidden()
        for sound in ('bell', 'wood', 'bird', 'water', 'bowl'):
            page.locator('#sound-choice').select_option(sound)
            page.locator('[data-view="start"] [data-action="test-sound"]').click()
            page.wait_for_function('(name) => window.lastSound?.endsWith(name + ".wav") && !audioPlayers[0].paused && !audioPlayers[0].muted && audioPlayers[0].readyState >= 2', arg=sound)
            assert page.evaluate('audioPlayers[0].error') is None
            assert not page.evaluate('audioPlayers[0].loop')
            page.wait_for_function('() => audioPlayers[0].currentTime > .16')
        page.reload()
        expect(page.locator('#sound-choice')).to_have_value('bowl')
        page.locator('#intention').fill('音の検証')
        page.locator('[data-work="10"]').click()
        page.locator('#start-form button[type="submit"]').click()
        page.clock.run_for(800)
        page.wait_for_function('() => audioPlayers[0].paused && !audioPlayers[0].muted')
        page.clock.fast_forward(600_100)
        expect(page.locator('[data-view="review"]')).to_be_visible()
        page.wait_for_function('() => window.lastSound?.endsWith("bowl.wav") && !audioPlayers[0].paused')
        expect(page.locator('#alarm-controls')).to_be_visible()
        assert page.evaluate('audioPlayers[0].loop')
        # Let the media pass its end in real time: it must loop, not fall silent.
        page.wait_for_timeout(4000)
        assert page.evaluate('!audioPlayers[0].paused && !audioPlayers[0].ended')
        page.locator('[data-action="stop-sound"]').click()
        assert page.evaluate('audioPlayers[0].paused && !audioPlayers[0].loop')
        expect(page.locator('#alarm-controls')).to_be_hidden()
        page.locator('[data-action="to-break"]').click()
        page.evaluate('window.lastSound = null')
        page.clock.fast_forward(300_100)
        expect(page.locator('[data-view="start"]')).to_be_visible()
        page.wait_for_function('() => window.lastSound?.endsWith("bowl.wav") && !audioPlayers[0].paused')
        assert page.evaluate('audioPlayers[0].loop')
        page.locator('[data-action="stop-sound"]').click()
        assert page.evaluate('audioPlayers[0].paused')
        # Explicitly simulate an autoplay rejection, then retry via a gesture.
        page.locator('details.settings').first.evaluate('(e) => e.open = true')
        page.evaluate('''() => { window.realPlay = audioPlayers[0].play;
          audioPlayers[0].play = () => Promise.reject(new DOMException('blocked', 'NotAllowedError')); }''')
        page.locator('[data-view="start"] [data-action="test-sound"]').click()
        expect(page.locator('#sound-notice')).to_be_visible()
        page.evaluate('() => { audioPlayers[0].play = window.realPlay; }')
        page.locator('#sound-notice button').click()
        expect(page.locator('#sound-notice')).to_be_hidden()
        page.wait_for_function('() => !audioPlayers[0].paused && !audioPlayers[0].muted')
        assert not errors, errors
        print('PASS', 'mobile' if mobile else 'desktop', 'silent startup with delayed play, 5 previews, persistence, looping focus/break alarms, stop, rejection/retry')
        context.close()
    browser.close()
