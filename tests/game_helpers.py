# Reference helper snippets (inlined into browser_automation scripts) for playing levels of the Safety Ambassador game
async def enter_level(page):
    await page.wait_for_selector('[data-testid="level-title-card"]', timeout=8000)
    await page.click('[data-testid="level-title-card"]', force=True)
    await page.wait_for_selector('[data-testid="scene-continue-button"]', timeout=5000)
    await page.click('[data-testid="scene-continue-button"]', force=True)
    await page.wait_for_selector('[data-testid="start-challenge-button"]', timeout=5000)
    await page.click('[data-testid="start-challenge-button"]', force=True)
    await page.wait_for_selector('[data-testid="challenge-panel"]', timeout=5000)
