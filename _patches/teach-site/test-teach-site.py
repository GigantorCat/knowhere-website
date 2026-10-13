# Playwright rig for the for-teachers rework (KW:TEACH-SITE): desktop 1280 + phone 390, taps 3, reveals on the live model, screenshots.
# pip install playwright && python -m playwright install chromium; PORT=3123 node server.js; mkdir -p _patches/teach-site/shots; python3 _patches/teach-site/test-teach-site.py
import asyncio, sys, json
from playwright.async_api import async_playwright

BASE = 'http://localhost:3123'   # PORT=3123 node server.js
OUT = './_patches/teach-site/shots/'

async def run(w, h, tag, mobile=False):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1, is_mobile=mobile, has_touch=mobile)
        page = await ctx.new_page()
        errs = []
        page.on('console', lambda m: errs.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
        await page.goto(BASE + '/for-teachers', wait_until='load')
        await page.wait_for_timeout(4000)
        # first screen
        await page.screenshot(path=OUT + f'{tag}-01-hero.png')
        # nav cta href
        href = await page.get_attribute('nav .cta.small', 'href')
        print(tag, 'nav cta →', href)
        seat = await page.text_content('#tchSeatLine')
        print(tag, 'seat line:', seat.strip())
        # scroll to call it block
        await page.locator('#tch-callit').scroll_into_view_if_needed()
        await page.wait_for_timeout(2500)
        on = await page.evaluate("document.querySelector('#tchProofFrame').classList.contains('on')")
        fh = await page.evaluate("document.querySelector('#tchProofFrame').style.height")
        print(tag, 'proof frame on:', on, 'height:', fh)
        await page.locator('#tchPresent').screenshot(path=OUT + f'{tag}-02-callit.png')
        # the round
        await page.click('.ci-opt[data-opt="3"]')
        await page.wait_for_timeout(300)
        print(tag, 'foot after call:', (await page.text_content('#tchCiFoot')).strip(), '| reveal hidden?', await page.is_hidden('#tchCiReveal'))
        await page.click('#tchCiReveal')
        await page.wait_for_timeout(4200)
        ov = await page.evaluate("(function(){var d=document.querySelector('#tchProofWidget').contentDocument;var o=d&&d.getElementById('overlayTag');return o?o.textContent:'(no overlay)';})()")
        sl = await page.evaluate("(function(){var d=document.querySelector('#tchProofWidget').contentDocument;var r=d&&d.getElementById('neutronSlider');return r?r.value:'?';})()")
        print(tag, 'widget overlay:', ov.strip()[:80], '| slider:', sl)
        print(tag, 'reveal on:', await page.evaluate("document.querySelector('#tchCiReveal2').classList.contains('on')"), '| you:', (await page.text_content('#tchCiYou')).strip())
        await page.locator('#tchPresent').screenshot(path=OUT + f'{tag}-03-revealed.png')
        # reset
        await page.click('#tchReset'); await page.wait_for_timeout(500)
        print(tag, 'after reset foot:', (await page.text_content('#tchCiFoot')).strip(), '| opts enabled:', await page.evaluate("[...document.querySelectorAll('.ci-opt')].every(o=>!o.disabled)"))
        # deck + rest
        await page.locator('#tch-deck').scroll_into_view_if_needed(); await page.wait_for_timeout(1200)
        await page.locator('#tch-deck').screenshot(path=OUT + f'{tag}-04-deck.png')
        await page.locator('.modecards').scroll_into_view_if_needed(); await page.wait_for_timeout(1200)
        await page.locator('.modecards').screenshot(path=OUT + f'{tag}-05-faq.png')
        await page.locator('.cta-band').scroll_into_view_if_needed(); await page.wait_for_timeout(1200)
        await page.locator('.cta-band').screenshot(path=OUT + f'{tag}-06-band.png')
        # the stack section (scroll through it)
        await page.evaluate("window.scrollTo(0, document.querySelector('#stackBox').offsetTop + window.innerHeight*2.2)")
        await page.wait_for_timeout(1500)
        await page.screenshot(path=OUT + f'{tag}-07-stack.png')
        # horizontal overflow check
        ovx = await page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
        print(tag, 'horizontal overflow:', ovx)
        print(tag, 'console errors:', [e for e in errs if 'fonts.g' not in e and 'umami' not in e and 'ERR_' not in e][:6], '(filtered network noise)')
        await b.close()

asyncio.run(run(1280, 800, 'desk'))
asyncio.run(run(390, 844, 'phone', mobile=True))
