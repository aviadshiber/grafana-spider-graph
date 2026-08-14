import { test, expect } from '@grafana/plugin-e2e';
import AxeBuilder from '@axe-core/playwright';

test('renders provisioned SpiderGraph without accessibility violations', async ({ page }) => {
  await page.goto('/d/spidergraph-examples/spidergraph-examples');
  await expect(page.getByRole('img', { name: /spider graph with 5 axes and 2 series/i })).toBeVisible();
  await expect(page.getByRole('table', { name: 'Spider graph values' })).toBeVisible();
  const results = await new AxeBuilder({ page }).include('[aria-label^="Panel"]').analyze();
  expect(results.violations).toEqual([]);
});
