import { expect, test } from "@playwright/test";

// Template mode end to end against a real database:
// generate → edit → save → reload → load from sidebar → delete.
test("plan a month, edit, save, reload and delete", async ({ page }) => {
  const brand = `E2E Brand ${Date.now()}`;
  const editedTopic = `Edited topic ${Date.now()}`;

  await page.goto("/");

  // Validation: empty fields are rejected in the browser.
  await page.getByRole("button", { name: /generate plan/i }).click();
  await expect(page.getByRole("alert").first()).toHaveText("Required");

  await page.getByLabel("Brand").fill(brand);
  await page.getByLabel("Niche").fill("Tea cafés");
  await page.getByLabel("Target audience").fill("Office workers in Bengaluru");
  await page.getByRole("radio", { name: /leads/i }).click();
  await page.getByRole("button", { name: /generate plan/i }).click();

  // 3 per week → 13 posts, template badge.
  const plan = page.locator("#plan");
  await expect(plan.getByRole("heading", { name: brand })).toBeVisible();
  await expect(plan.getByRole("button", { name: /^edit topic for post/i })).toHaveCount(13);
  await expect(page.getByTestId("source-badge")).toHaveText("Template");

  // Edit the first topic inline.
  await plan.getByRole("button", { name: "Edit topic for post 1", exact: true }).click();
  const editor = plan.getByRole("textbox", { name: "topic for post 1", exact: true });
  await editor.fill(editedTopic);
  await editor.press("Enter");
  await expect(plan.getByRole("button", { name: "Edit topic for post 1", exact: true })).toContainText(editedTopic);

  // Save → appears under its client in the sidebar.
  await plan.getByRole("button", { name: "Save plan" }).click();
  await expect(plan.getByRole("button", { name: "Saved" })).toBeVisible();
  const sidebar = page.locator("aside");
  await expect(sidebar.getByText(brand)).toBeVisible();

  // Reload the page and open the plan from the sidebar.
  await page.reload();
  const client = sidebar.locator("li", { hasText: brand });
  await client.getByRole("button", { name: /^\w{3} \d{4} · Leads/ }).click();
  await expect(plan.getByRole("heading", { name: brand })).toBeVisible();
  await expect(plan.getByRole("button", { name: "Edit topic for post 1", exact: true })).toContainText(editedTopic);
  await expect(page.getByTestId("source-badge")).toHaveText("Edited");

  // Delete after confirmation.
  await client.getByRole("button", { name: /^Delete/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Delete plan" }).click();
  await expect(sidebar.getByText(brand)).toHaveCount(0);
});
