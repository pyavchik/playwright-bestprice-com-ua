import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright global setup: prepare the allure-results directory so the Allure
 * report uses our categorization rules instead of the default generic ones.
 */
export default async function globalSetup(): Promise<void> {
  const resultsDir = path.resolve(__dirname, '..', 'allure-results');
  fs.mkdirSync(resultsDir, { recursive: true });

  const categoriesSrc = path.resolve(__dirname, '..', 'allure', 'categories.json');
  if (fs.existsSync(categoriesSrc)) {
    fs.copyFileSync(categoriesSrc, path.join(resultsDir, 'categories.json'));
  }

  // executor.json shows the build/source info on the Allure overview page.
  const executor = {
    name: process.env.CI ? 'GitHub Actions' : 'Local',
    type: process.env.CI ? 'github' : 'local',
    url:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}`
        : undefined,
    buildOrder: process.env.GITHUB_RUN_NUMBER ? Number(process.env.GITHUB_RUN_NUMBER) : undefined,
    buildName: process.env.GITHUB_WORKFLOW || 'Local run',
    buildUrl:
      process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
        ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
        : undefined,
    reportName: 'Playwright Allure Report',
  };
  fs.writeFileSync(path.join(resultsDir, 'executor.json'), JSON.stringify(executor, null, 2));
}
