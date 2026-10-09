import { expect, test, type Locator } from "@playwright/test";

async function contrast(locator: Locator) {
  return locator.evaluate(element => {
    const parse = (color: string) => {
      const channels = color.match(/[\d.]+/g)?.map(Number);
      if (!color.startsWith("rgb") || !channels || channels.length < 3) throw new Error(`Unsupported computed color ${color}`);
      return channels;
    };
    const luminance = (channels: number[]) => {
      const linear = channels.slice(0, 3).map(channel => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    };
    let surface: Element | null = element;
    while (surface && ["rgba(0, 0, 0, 0)", "transparent"].includes(getComputedStyle(surface).backgroundColor)) surface = surface.parentElement;
    if (!surface) throw new Error("No opaque surface");
    const style = getComputedStyle(element);
    const background = getComputedStyle(surface).backgroundColor;
    const foregroundChannels = parse(style.color);
    const backgroundChannels = parse(background);
    const alpha = foregroundChannels[3] ?? 1;
    // Translucent copy is composited against its actual column before measuring contrast.
    const painted = foregroundChannels.slice(0, 3).map((channel, index) => channel * alpha + backgroundChannels[index] * (1 - alpha));
    const a = luminance(painted);
    const b = luminance(backgroundChannels);
    const size = parseFloat(style.fontSize);
    const large = size >= 24 || (size >= 18.6667 && Number(style.fontWeight) >= 700);
    return { color: style.color, background, fontSize: style.fontSize, fontWeight: style.fontWeight, painted, ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05), minimum: large ? 3 : 4.5 };
  });
}

test("column text and real Learn More states meet contrast", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    for (const column of await page.locator(".column").all()) {
      for (const selector of ["h2", ".copy", "summary"]) {
        const result = await contrast(column.locator(selector));
        expect.soft(result.ratio, `${selector} at ${width}: ${JSON.stringify(result)}`).toBeGreaterThanOrEqual(result.minimum);
      }
      const summary = column.locator("summary");
      await summary.hover();
      const hover = await contrast(summary);
      expect.soft(hover.ratio, `hover at ${width}: ${JSON.stringify(hover)}`).toBeGreaterThanOrEqual(hover.minimum);
      await summary.click();
      const note = await contrast(column.locator(".demo-note"));
      expect.soft(note.ratio, `open note at ${width}: ${JSON.stringify(note)}`).toBeGreaterThanOrEqual(note.minimum);
    }
    const link = page.getByRole("link", { name: "Frontend Mentor", exact: true });
    await link.hover();
    const footer = await contrast(link);
    expect.soft(footer.ratio, `footer hover at ${width}: ${JSON.stringify(footer)}`).toBeGreaterThanOrEqual(footer.minimum);
  }
});
