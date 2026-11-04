// Data projects shown in the "Data work" section and as stars in the Pleiades.
// Every number here comes from the project's own README. Update both together.
const GH = 'https://github.com/Mayank-thite';

export const PROJECTS_INTRO =
  "I rebuilt my older data projects on public data in 2026 and added a few new ones. Each repo runs end to end from a fresh clone.";

export const PROJECTS = [
  {
    id: 'canada-econ',
    title: 'Canada economy pipeline',
    star: 'Daily pipeline',
    when: '2026',
    summary: 'Pulls Bank of Canada and Statistics Canada data every day, loads it into PostgreSQL and models it with dbt. GitHub Actions runs it and refreshes the dashboard.',
    finding: '7 daily and 2 monthly series, with 65 dbt data tests on every run.',
    stack: ['Python', 'PostgreSQL', 'dbt', 'GitHub Actions'],
    repo: `${GH}/canada-econ-pipeline`,
    dashboard: 'https://mayank-thite.github.io/canada-econ-pipeline/',
  },
  {
    id: 'course-dropoff',
    title: 'Course drop-off analysis',
    star: 'Course drop-off',
    when: '2026',
    summary: 'Where and why students leave online courses, using the Open University learning dataset. SQL first, then Python for the model and tests.',
    finding: 'Withdrawals peak in week 2 of a course.',
    stack: ['SQL', 'PostgreSQL', 'Python', 'Power BI'],
    repo: `${GH}/course-dropoff-analysis`,
  },
  {
    id: 'retail',
    title: 'Retail analytics engine',
    star: 'Retail analytics',
    when: '2024, rebuilt 2026',
    summary: 'Turns about a million raw transaction lines into a star schema with Spark, then looks at seasonality, product mix and customers.',
    finding: '22% of products bring in 80% of revenue.',
    stack: ['PySpark', 'Spark SQL', 'Pandas', 'Power BI'],
    repo: `${GH}/retail-analytics-engine`,
  },
  {
    id: 'stock-sentiment',
    title: 'Stock sentiment pipeline',
    star: 'Stock sentiment',
    when: '2024, rebuilt 2026',
    summary: 'Streams news headlines through Kafka, scores them in Spark and joins them to daily returns in HiveQL.',
    finding: 'A small same-day link between headline tone and returns, and no next-day effect.',
    stack: ['Python', 'Kafka', 'Spark', 'HiveQL'],
    repo: `${GH}/stock-sentiment-pipeline`,
  },
  {
    id: 'stats',
    title: 'Statistics and modeling',
    star: 'Stats and models',
    when: '2026',
    summary: 'Hypothesis tests, regression and classification on two public UCI datasets, written up as notebooks.',
    finding: 'The bank model looks good on a random split and drops a lot when tested on later months.',
    stack: ['Python', 'statsmodels', 'scikit-learn', 'LightGBM'],
    repo: `${GH}/statistics-and-modeling`,
  },
];
