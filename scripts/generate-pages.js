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
       document.querySelectorAll('.related-slider').forEach(slider => {
    const track = slider.querySelector('.slider-track');
    const prev = slider.querySelector('.prev');
    const next = slider.querySelector('.next');
    
    prev.addEventListener('click', () => {
      track.scrollBy({ left: -200, behavior: 'smooth' });
    });
    
    next.addEventListener('click', () => {
      track.scrollBy({ left: 200, behavior: 'smooth' });
    });
  });
  </script>
 
  
</body>

</html>`;

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



const relatedReferralsTemplate = `
<section class="related-referrals">
  <h3>More in {{category}}</h3>
  <div class="related-slider">
    <button class="slider-button prev">‹</button>
    <div class="slider-track">
      {{relatedCards}}
    </div>
    <button class="slider-button next">›</button>
  </div>
</section>

<style>
  .related-referrals {
    margin-top: 40px;
    padding: 20px 0;
    border-top: 1px solid #eee;
  }
  .related-referrals h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #2b2d42;
  }
  /* Reuse your existing slider styles */
</style>



`;

// Related company card template
const relatedCardTemplate = `
<div class="related-company-card" onclick="window.location.href='{{id}}.html'">
  <div class="related-logo">
    <img src="../{{logo}}" alt="{{name}}">
  </div>
  <div class="related-info">
    <h4>{{name}}</h4>
    <p class="related-offer">{{offer}}</p>
  </div>
</div>
`;

// Find related companies by category
function getRelatedCompanies(currentCompany, allCompanies) {
  return allCompanies
    .filter(company => 
      company.id !== currentCompany.id && 
      company.category === currentCompany.category
    )
    .slice(0, 6); // Get max 6 related companies
}

// Generate HTML for related companies
function generateRelatedCards(relatedCompanies) {
  return relatedCompanies.map(company => 
    relatedCardTemplate
      .replace(/{{id}}/g, company.id)
      .replace(/{{name}}/g, company.name)
      .replace(/{{logo}}/g, company.logo)
      .replace(/{{offer}}/g, company.offer)
  ).join('');
}

// Modified company page generation
async function generateCompanyPages(companies) {
  if (!fs.existsSync(path.join(__dirname, '../company-pages'))) {
    fs.mkdirSync(path.join(__dirname, '../company-pages'));
  }

  await Promise.all(companies.map(async (company) => {
    const relatedCompanies = getRelatedCompanies(company, companies);
    const relatedCardsHTML = generateRelatedCards(relatedCompanies);
    
    const relatedSection = relatedReferralsTemplate
      .replace(/{{category}}/g, company.category)
      .replace(/{{relatedCards}}/g, relatedCardsHTML);

    const html = companyTemplate
      .replace(/{{name}}/g, company.name)
      .replace(/{{logo}}/g, company.logo)
      .replace(/{{description}}/g, company.description)
      .replace(/{{rating}}/g, company.rating)
      .replace(/{{stars}}/g, generateStars(company.rating))
      .replace(/{{users}}/g, company.users)
      .replace(/{{code}}/g, company.code)
      .replace(/{{website}}/g, company.website)
      // .replace(/<\/main>/g, `${relatedSection}</main>`)

      .replace(/<\/main>/g, `
                ${relatedSection}
        
            </main>`);; // Inject before closing main

    const filePath = path.join(__dirname, `../company-pages/${company.id}.html`);
    await fs.promises.writeFile(filePath, html);
  }));
}

async function generateAll() {
  try {
    console.log('Starting generation...');
    const [companies, popularList] = await Promise.all([
      readCSV(path.join(__dirname, '../data/companies.csv')),
      // readCSV(path.join(__dirname, '../data/popular.csv'))
    ]);

    await Promise.all([
      generateCompanyPages(companies)
    ]);

    console.log(`Successfully generated:
- ${companies.length} company pages
`);
  } catch (error) {
    console.error('Generation failed:', error);
  }
}
generateAll()


module.exports = { generateAll };







