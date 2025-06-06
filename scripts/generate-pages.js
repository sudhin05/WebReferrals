const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const chokidar = require('chokidar');

const companyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{name}} Referral</title>
  <link rel="stylesheet" href="../styles/company-page.css" />
</head>
<body>
 <header>
    <div class="container">
        <h1 class="logo">WebReferrals</h1>
        <nav>
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Features</a></li>
                <li><a href="#">Categories</a></li>
                <li><a href="#">Referees</a></li>
            </ul>
        </nav>
    </div>
</header>

  <main class="brand-container">
    <div class="brand-info">
      <div class="brand-text">
        <h1>{{name}}</h1>
        <p>{{description}}</p>
      </div>
      <div class="brand-logo">
        <img src="../{{logo}}" alt="{{name}} Logo" />
      </div>
    </div>

    <div class="info-box">
      <div class="info-left">
        <div class="rating-value">{{rating}}</div>
        <div class="stars">
          {{stars}}
        </div>
        <div class="short-desc">Trusted by {{users}}+ users</div>
      </div>
      <div class="divider"></div>
      <div class="info-right">
        <div class="verified">
          <span class="checkmark">✔</span>
          <span class="verified-text">Verified Publisher</span>
        </div>
      </div>
    </div>

    <div class="referral-code-section">
      <h3>Referral Code:</h3>
      <div class="code-box">
        <span id="code">{{code}}</span>
        <button onclick="copyCode()">Copy</button>
      </div>
    </div>
    <div class="how-to-use">
      <h3>How to Use</h3>
      <ol>
       <li>Visit <a href="https://{{website}}" target="_blank">{{website}}</a></li>
        <li>Sign up using your email or phone number</li>
        <li>Enter referral code <strong>{{code}}</strong> during checkout</li>
      </ol>
    </div>
  </main>

  <script>
    function copyCode() {
      const code = document.getElementById('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        alert('Referral code copied: ' + code);
      });
    }
  </script>
</body>
</html>`;

const popularCardTemplate = (company) => `
<div class="company-card" data-company="${company.id}">
  <div class="grid-image">
    <img src="../${company.logo}" alt="${company.name}" loading="lazy">
  </div>
  <div class="grid-text">
    <h4>${company.name}</h4>
    <p>${company.offer}</p>
  </div>
</div>
`;


function generateStars(rating) {
  const numericRating = parseFloat(rating);
  const fullStars = Math.floor(numericRating);
  const halfStar = numericRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + '&#x260E'.repeat(halfStar) + '☆'.repeat(emptyStars);
}

// Read CSV file helper
async function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Generate all company pages
async function generateCompanyPages(companies) {
  if (!fs.existsSync(path.join(__dirname, '../company-pages'))) {
    fs.mkdirSync(path.join(__dirname, '../company-pages'));
  }

  await Promise.all(companies.map(async (company) => {
    const html = companyTemplate
      .replace(/{{name}}/g, company.name)
      .replace(/{{logo}}/g, company.logo)
      .replace(/{{description}}/g, company.description)
      .replace(/{{rating}}/g, company.rating)
      .replace(/{{stars}}/g, generateStars(company.rating))
      .replace(/{{users}}/g, company.users)
      .replace(/{{code}}/g, company.code)
      .replace(/{{website}}/g, company.website)
      .replace(/{{offer}}/g, company.offer);

    const filePath = path.join(__dirname, `../company-pages/${company.id}.html`);
    await fs.promises.writeFile(filePath, html);
  }));
}

// Update index.html with popular companies
async function updateIndexWithPopular(companies, popularList) {
  const indexPath = path.join(__dirname, '../index.html');
  let indexContent = await fs.promises.readFile(indexPath, 'utf8');
  
  // Filter and sort popular companies
  const popularCompanies = popularList
    .map(p => companies.find(c => c.id === p.id))
    .filter(Boolean)
    .sort((a, b) => {
      const aOrder = popularList.find(p => p.id === a.id)?.order || 0;
      const bOrder = popularList.find(p => p.id === b.id)?.order || 0;
      return aOrder - bOrder;
    });

  // Generate popular cards HTML
  const popularHTML = popularCompanies.map(popularCardTemplate).join('');
  
  // Update all slider-track sections
  indexContent = indexContent.replace(
    /<div class="slider-track">([\s\S]*?)<\/div>/g,
    `<div class="slider-track">${popularHTML}</div>`
  );
  
  await fs.promises.writeFile(indexPath, indexContent);
}

// Main generation function
async function generateAll() {
  try {
    console.log('Starting generation...');
    const [companies, popularList] = await Promise.all([
      readCSV(path.join(__dirname, '../data/companies.csv')),
      readCSV(path.join(__dirname, '../data/popular.csv'))
    ]);

    await Promise.all([
      generateCompanyPages(companies),
      updateIndexWithPopular(companies, popularList)
    ]);

    console.log(`Successfully generated:
- ${companies.length} company pages
- Updated popular section with ${popularList.length} companies`);
  } catch (error) {
    console.error('Generation failed:', error);
  }
}

// File watcher for development
function setupWatcher() {
  const watcher = chokidar.watch([
    path.join(__dirname, '../data/companies.csv'),
    path.join(__dirname, '../data/popular.csv'),
    path.join(__dirname, '../index.html')
  ], {
    ignoreInitial: true,
    persistent: true
  });

  watcher.on('change', (filePath) => {
    console.log(`\nFile changed: ${path.basename(filePath)}`);
    generateAll();
  });

  watcher.on('error', error => {
    console.error('Watcher error:', error);
  });

  console.log('Watching files for changes...');
}

// Run immediately and watch in development
generateAll().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    setupWatcher();
  }
});

// Export for potential CLI usage
module.exports = { generateAll };







