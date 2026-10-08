import { expect, test } from "@playwright/test";

const categories = [
  { name: "Sedans", color: "rgb(226, 134, 37)", copy: "Choose a sedan for its affordability and excellent fuel economy. Ideal for cruising in the city or on your next road trip." },
  { name: "SUVs", color: "rgb(0, 105, 113)", copy: "Take an SUV for its spacious interior, power, and versatility. Perfect for your next family vacation and off-road adventures." },
  { name: "Luxury", color: "rgb(0, 65, 64)", copy: "Cruise in the best car brands without the bloated prices. Enjoy the enhanced comfort of a luxury rental and arrive in style." },
];

test("renders the three supplied categories with their icons, colors and copy", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("3-column preview card | Royer Adames");
  await expect(page.getByRole("main")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Car rental categories");
  for (const category of categories) {
    const section = page.getByRole("region", { name: category.name });
    await expect(section).toHaveCSS("background-color", category.color);
    await expect(section.getByRole("heading", { level: 2 })).toHaveCSS("text-transform", "uppercase");
    await expect(section.getByText(category.copy)).toBeVisible();
    const icon = section.locator("img");
    expect(await icon.evaluate(element => element instanceof HTMLImageElement && element.complete && element.naturalWidth > 0)).toBe(true);
    await expect(section.locator("summary")).toHaveCSS("color", category.color);
  }
});

test("Learn More shows the design's outline state on hover and focus, and opens an honest demo note by keyboard", async ({ page }) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "SUVs" });
  const button = section.locator("summary");
  await expect(button).toHaveAccessibleName("Learn More about SUVs");
  await expect(button).toHaveCSS("background-color", "rgb(242, 242, 242)");
  await button.hover();
  await expect(button).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
  await expect(button).toHaveCSS("color", "rgb(242, 242, 242)");
  await expect(button).toHaveCSS("border-top-color", "rgb(242, 242, 242)");
  await page.mouse.move(0, 0);
  await expect(button).toHaveCSS("background-color", "rgb(242, 242, 242)");

  const note = section.getByText("Demo only: this practice card has no SUV listings or booking behind it.");
  await expect(note).toBeHidden();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  await expect(button).toHaveCSS("color", "rgb(242, 242, 242)");
  await page.keyboard.press("Enter");
  await expect(note).toBeVisible();
  await page.keyboard.press("Space");
  await expect(note).toBeHidden();
});

test("follows the mobile, tablet and desktop frames", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/");
  const columns = page.locator(".column");
  expect((await columns.nth(0).boundingBox())?.width).toBeCloseTo(327, 0);
  const mobileSecond = await columns.nth(1).boundingBox();
  const mobileFirst = await columns.nth(0).boundingBox();
  expect(mobileSecond!.y).toBeCloseTo(mobileFirst!.y + mobileFirst!.height, 0);

  await page.setViewportSize({ width: 768, height: 1350 });
  expect((await columns.nth(0).boundingBox())?.width).toBeCloseTo(608, 0);
  await expect(columns.nth(0)).toHaveCSS("padding-left", "80px");

  await page.setViewportSize({ width: 1440, height: 800 });
  const boxes = await Promise.all([0, 1, 2].map(index => columns.nth(index).boundingBox()));
  expect(boxes[0]!.width).toBeCloseTo(307, 0);
  expect(boxes[1]!.x).toBeCloseTo(boxes[0]!.x + boxes[0]!.width, 0);
  expect(boxes[2]!.y).toBeCloseTo(boxes[0]!.y, 0);
  expect(boxes[0]!.height).toBeGreaterThanOrEqual(500);
  const buttons = await Promise.all([0, 1, 2].map(index => columns.nth(index).locator("summary").boundingBox()));
  expect(buttons[0]!.y).toBeCloseTo(buttons[2]!.y, 0);
  // Figma pill is 147 wide with a 15px label; the 16px family floor widens the label by a few pixels.
  expect(buttons[0]!.width).toBeGreaterThanOrEqual(147);
  expect(buttons[0]!.width).toBeLessThan(160);
  expect(buttons[0]!.height).toBeCloseTo(48, 0);
});

test("fits from 320 to 1440 with no overflow, 16px text and 44px targets", async ({ page }) => {
  for (const width of [320, 375, 400, 640, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const smallText = await page.locator("h2, p, summary, footer, footer a").evaluateAll(elements =>
      elements.filter(element => element.getClientRects().length > 0 && parseFloat(getComputedStyle(element).fontSize) < 16).map(element => element.textContent));
    expect(smallText).toEqual([]);
    for (const control of await page.locator("a, summary").all()) {
      expect((await control.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
  }
  await page.setViewportSize({ width: 640, height: 900 });
  await page.addStyleTag({ content: "html { font-size: 200%; }" });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("declares one site name in the footer, og:site_name and WebSite JSON-LD", async ({ page }) => {
  await page.goto("/");
  const visible = await page.locator("footer .site-name").textContent();
  expect(visible).toBe("3-column preview card");
  await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute("content", visible!);
  const jsonLd = JSON.parse((await page.locator('script[type="application/ld+json"]').textContent())!);
  expect(jsonLd).toEqual({ "@context": "https://schema.org", "@type": "WebSite", name: visible, url: "https://three-column-preview-card-fm.royeradames.com/" });
});

test("disclosures work with JavaScript disabled and nothing is sent", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const writes: string[] = [];
  page.on("request", request => { if (request.method() !== "GET") writes.push(request.url()); });
  try {
    await page.goto("http://127.0.0.1:4538/");
    await page.getByRole("region", { name: "Luxury" }).locator("summary").click();
    await expect(page.getByText("Demo only: this practice card has no luxury car listings or booking behind it.")).toBeVisible();
    expect(writes).toEqual([]);
  } finally {
    await context.close();
  }
});
