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
    finding: 'Across 28 rate changes since 2017, the dollar moved the expected way 20 times, but the moves were no bigger than on an ordinary day.',
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
    finding: 'Half of all dated withdrawals happen before day 28. A day 28 call list flags students who go on to withdraw at twice the base rate.',
    stack: ['SQL', 'PostgreSQL', 'Python', 'scikit-learn', 'Power BI'],
    repo: `${GH}/course-dropoff-analysis`,
    dashboard: '/projects/course-dropoff-analysis/',
  },
  {
    id: 'retail',
    title: 'Retail analytics engine',
    star: 'Retail analytics',
    when: '2024, rebuilt 2026',
    summary: 'Cleans two years of UK online retail invoices into a star schema with Spark, then looks at seasonality, product mix, customers and reorder points.',
    finding: 'Most top sellers have lumpy demand, and the textbook reorder formula set the reorder point too low for 647 of the 828 products that make 80% of revenue.',
    stack: ['PySpark', 'Spark SQL', 'Pandas', 'Power BI'],
    repo: `${GH}/retail-analytics-engine`,
    dashboard: '/projects/retail-analytics-engine/',
  },
  {
    id: 'stock-sentiment',
    title: 'Stock sentiment pipeline',
    star: 'Stock sentiment',
    when: '2024, rebuilt 2026',
    summary: 'Streams news headlines through Kafka, scores them in Spark and joins them to daily returns in HiveQL.',
    finding: 'On 47,913 ticker days, headline tone lined up with same-day returns (r = 0.044 net of the market) but told you nothing about the next day.',
    stack: ['Python', 'Kafka', 'Spark', 'HiveQL', 'statsmodels'],
    repo: `${GH}/stock-sentiment-pipeline`,
    dashboard: '/projects/stock-sentiment-pipeline/',
  },
  {
    id: 'stats',
    title: 'Statistics and modeling',
    star: 'Stats and models',
    when: '2026',
    summary: 'Hypothesis tests, regression and classification on two public UCI datasets, written up as notebooks. The README leads with the time-split result, which is the weaker one.',
    finding: 'A bank marketing model that scored 0.81 ROC-AUC on a random split dropped to 0.70 on later calls. At my assumed costs, calling everyone still won.',
    stack: ['Python', 'statsmodels', 'scikit-learn', 'LightGBM'],
    repo: `${GH}/statistics-and-modeling`,
    notebooks: `${GH}/statistics-and-modeling/tree/main/notebooks`,
  },
];
