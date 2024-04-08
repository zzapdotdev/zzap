import { expect, test } from "@playwright/test";

test("All pages have a title", async ({ page, request }) => {
  const siteMapResponse = await request.get(
    "http://localhost:3000/sitemap.xml",
  );
  const siteMap = await siteMapResponse.text();
  const locs = siteMap.match(/<loc>(.*?)<\/loc>/g);

  const urls = locs?.map((loc) => loc.replace(/<loc>|<\/loc>/g, "")) ?? [];

  for (const url of urls) {
    await page.goto(url);
    await expect(page).toHaveTitle(/zzap/);
  }
});

// root
test("/ ", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByText("A site generator for React")).toBeVisible();
});

// file with name
test("/support ", async ({ page }) => {
  await page.goto("http://localhost:3000/support");
  await expect(page.getByText("Support zzap")).toBeVisible();
});
// folder with index.md
test("/community ", async ({ page }) => {
  await page.goto("http://localhost:3000/community");
  await expect(page.getByText("zzap Community")).toBeVisible();
});

// dynamic without params
test("/releases", async ({ page }) => {
  await page.goto("http://localhost:3000/releases");
  await expect(page.getByText("Latest Releases")).toBeVisible();
});

// dynamic with params
test("/releases/v-0-1", async ({ page }) => {
  await page.goto("http://localhost:3000/releases/v-0-1");
  await expect(page.getByText("zzap v0.1")).toBeVisible();
});

// exploded
test("/docs/intro/what-is-zzap", async ({ page }) => {
  await page.goto("http://localhost:3000/docs/intro/what-is-zzap");
  await expect(page.getByText("What is zzap")).toBeVisible();
});

// 404 page
test("404 ", async ({ page }) => {
  await page.goto("http://localhost:3000/this-page-does-not-exist");
  await expect(page.getByText("Page Not Found")).toBeVisible();
});
