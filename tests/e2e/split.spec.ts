import { expect, test } from '@playwright/test';

/**
 * Jornada ouro. Seletores: docs/specs/feature-map.md
 * Sem waitForTimeout. Sem retry. Flake = teste errado.
 */
test('reparte R$ 100,00 em 3 parcelas e mostra o resto na última', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Repartir valores' })).toBeVisible();

  await page.getByTestId('amount-input').fill('100,00');
  await page.getByTestId('parts-input').fill('3');
  await page.getByTestId('split-button').click();

  const rows = page.getByTestId('installment-row');
  await expect(rows).toHaveCount(3);
  await expect(rows.nth(0)).toContainText('33,33');
  await expect(rows.nth(1)).toContainText('33,33');
  await expect(rows.nth(2)).toContainText('33,34');
  await expect(page.getByTestId('total-cents')).toHaveText('10000');
});

test('mostra erro com valor vazio', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('amount-input').fill('   ');
  await page.getByTestId('split-button').click();
  await expect(page.getByTestId('split-error')).toBeVisible();
  await expect(page.getByTestId('empty-state')).toBeVisible();
});
