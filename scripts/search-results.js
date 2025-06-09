document.addEventListener('DOMContentLoaded', async () => {
    // Get search query from URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q') || '';
    document.getElementById('resultsSearchInput').value = searchQuery;
    document.getElementById('searchQueryDisplay').textContent = searchQuery;

    // Load companies data from CSV
    let allCompanies = [];
    
    async function loadCompanies() {
        return new Promise((resolve) => {
            Papa.parse('../data/companies.csv', {
                download: true,
                header: true,
                complete: function(results) {
                    allCompanies = results.data.filter(company => company.id); // Remove empty rows
                    resolve();
                }
            });
        });
    }

    // Search function
    function searchCompanies(query) {
        if (!query) return allCompanies;
        
        return allCompanies.filter(company => {
            const searchText = `${company.name} ${company.description} ${company.offer}`.toLowerCase();
            return searchText.includes(query.toLowerCase());
        });
    }

    // Display results in grid
    function displayResults(companies) {
        const grid = document.getElementById('resultsGrid');
        grid.innerHTML = '';
        
        if (companies.length === 0) {
            grid.innerHTML = '<p class="no-results">No companies found matching your search.</p>';
            document.getElementById('resultsCount').textContent = '0';
            return;
        }
        
        document.getElementById('resultsCount').textContent = companies.length;
        
        companies.forEach(company => {
            const card = document.createElement('div');
            card.className = 'company-result-card';
            card.innerHTML = `
                <div class="company-logo">
                    <img src="../${company.logo}" alt="${company.name}">
                </div>
                <h3 class="company-name">${company.name}</h3>
                <p class="company-offer">${company.offer}</p>
                <p class="company-description">${company.description}</p>
                <div class="company-rating">${generateStarRating(company.rating)}</div>
                <button class="view-button" onclick="window.location.href='../company-pages/${company.id}.html'">View Referral</button>
            `;
            grid.appendChild(card);
        });
    }

    // Generate star rating
    function generateStarRating(rating) {
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const halfStar = numRating % 1 >= 0.5 ? 1 : 0;
        return '★'.repeat(fullStars) + '½'.repeat(halfStar) + '☆'.repeat(5 - fullStars - halfStar);
    }


    document.getElementById('resultsSearchForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const query = document.getElementById('resultsSearchInput').value.trim();
        window.location.href = `search-results.html?q=${encodeURIComponent(query)}`;
    });


    await loadCompanies();
    const results = searchCompanies(searchQuery);
    displayResults(results);
});