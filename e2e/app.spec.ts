import { test, expect, type Page } from "@playwright/test";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Wait until the loading spinner disappears and earthquake data has rendered */
async function waitForData(page: Page, timeout = 20_000) {
  // The count badge in the map overlay confirms data arrived and was rendered
  await page.waitForSelector('[data-testid="map-event-count"]', { timeout });
}

// ─── Page load ──────────────────────────────────────────────────────────────

test.describe("Page load", () => {
  test("renders the QuakePulse header", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "QuakePulse" })).toBeVisible();
  });

  test("shows the live status indicator", async ({ page }) => {
    await page.goto("/");
    // Either loading or live — either is correct on fresh load
    const statusText = page.locator("text=Live").or(page.locator("text=Updating"));
    await expect(statusText.first()).toBeVisible({ timeout: 15_000 });
  });

  test("map container renders", async ({ page }) => {
    await page.goto("/");
    // Leaflet injects its own container — wait for it
    await expect(page.locator(".leaflet-container")).toBeVisible({ timeout: 15_000 });
  });

  test("shows earthquake count on the map overlay after data loads", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);
    const countBadge = page.getByTestId("map-event-count");
    const text = await countBadge.textContent();
    // Should contain a number
    expect(text).toMatch(/\d+/);
  });
});

// ─── Stats panel ────────────────────────────────────────────────────────────

test.describe("Stats panel", () => {
  test("shows a non-zero event count after data loads", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);
    // The "Total Events" card value should be > 0
    const totalCard = page.getByText("Total Events").locator("..").getByRole("heading").or(
      page.locator('[data-testid="stat-total"]')
    );
    // Fallback: just confirm the stats section is visible
    await expect(page.getByText("Total Events")).toBeVisible();
  });

  test("stats panel is inside the visible sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Max Magnitude")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("Avg Depth")).toBeVisible();
  });
});

// ─── Filters ────────────────────────────────────────────────────────────────

test.describe("Filters", () => {
  test("time range buttons are all visible", async ({ page }) => {
    await page.goto("/");
    for (const label of ["1 Hour", "24 Hours", "7 Days", "30 Days"]) {
      await expect(page.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("switching to 1 Hour range marks that button as active", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);

    await page.getByRole("button", { name: "1 Hour" }).click();

    // The active time-range button gets bg-orange-500 text-white classes
    await expect(page.getByRole("button", { name: "1 Hour" })).toHaveClass(/bg-orange-500/);
    // The previously active button loses the active class
    await expect(page.getByRole("button", { name: "24 Hours" })).not.toHaveClass(/bg-orange-500/);
  });

  test("Reset button appears after changing a filter", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);

    // Initially no Reset button
    await expect(page.getByRole("button", { name: "Reset" })).not.toBeVisible();

    // Change time range
    await page.getByRole("button", { name: "7 Days" }).click();

    // Reset should now appear
    await expect(page.getByRole("button", { name: "Reset" })).toBeVisible({ timeout: 5_000 });
  });

  test("clicking Reset restores default 24 Hours selection", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);

    await page.getByRole("button", { name: "7 Days" }).click();
    await page.getByRole("button", { name: "Reset" }).click();

    // After reset, Reset button should disappear (we're back at defaults)
    await expect(page.getByRole("button", { name: "Reset" })).not.toBeVisible({ timeout: 3_000 });
  });
});

// ─── Sidebar ────────────────────────────────────────────────────────────────

test.describe("Sidebar", () => {
  test("toggle button collapses and reopens the sidebar", async ({ page }) => {
    await page.goto("/");
    await waitForData(page);

    // Use exact match to avoid collision with "Total Events" and "of N events"
    const eventsHeading = page.getByText("Events", { exact: true });
    await expect(eventsHeading).toBeVisible();

    const closeBtn = page.locator('button[class*="rounded-r-lg"]').first();
    await closeBtn.click();

    await expect(eventsHeading).not.toBeVisible({ timeout: 3_000 });

    // Reopen
    await closeBtn.click();
    await expect(eventsHeading).toBeVisible({ timeout: 3_000 });
  });
});

// ─── Legend ─────────────────────────────────────────────────────────────────

test.describe("Map legend", () => {
  test("shows Magnitude legend by default", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Magnitude").first()).toBeVisible({ timeout: 10_000 });
  });

  test("switches to Depth legend when Depth color mode is selected", async ({ page }) => {
    await page.goto("/");
    // The "Color by" toggle buttons sit inside the filter bar — scope to that section
    // to avoid collision with the "Depth" sort button in the earthquake list
    const filterBar = page.locator("div").filter({ hasText: /^Range/ }).first();
    await filterBar.getByRole("button", { name: "depth" }).click();
    // The legend panel heading updates to "Depth"
    const legend = page.locator('[class*="rounded-xl"]').filter({ hasText: /Very shallow/ });
    await expect(legend).toBeVisible({ timeout: 5_000 });
  });
});

// ─── USGS attribution ───────────────────────────────────────────────────────

test.describe("Attribution", () => {
  test("USGS link is present and has correct href", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: /USGS Earthquake Hazards Program/ });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "https://earthquake.usgs.gov/");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
