const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>{{name}} Referral</title>
  <link rel="stylesheet" href="../styles/company-page.css" />
</head>
<body>
  <header>
    <h1>Nav bar</h1>
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
        <li>Visit <a href="{{website}}" target="_blank">{{name}}.com</a></li>
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

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
}

function generatePages() {
  const results = [];
  
  fs.createReadStream(path.join(__dirname, '../data/companies.csv'))
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {
      if (!fs.existsSync(path.join(__dirname, '../company-pages'))) {
        fs.mkdirSync(path.join(__dirname, '../company-pages'));
      }

      results.forEach(company => {
        let html = template
          .replace(/{{name}}/g, company.name)
          .replace(/{{logo}}/g, company.logo)
          .replace(/{{description}}/g, company.description)
          .replace(/{{rating}}/g, company.rating)
          .replace(/{{stars}}/g, generateStars(company.rating))
          .replace(/{{users}}/g, company.users)
          .replace(/{{code}}/g, company.code)
          .replace(/{{website}}/g, company.website);

        fs.writeFileSync(
          path.join(__dirname, `../company-pages/${company.id}.html`),
          html
        );
      });

      console.log(`Generated ${results.length} company pages`);
    });
}

generatePages();