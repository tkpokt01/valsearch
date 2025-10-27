let currentMode = 'active'; // 'active' or 'exited'

// Mode toggle functionality
document.getElementById('activeMode').addEventListener('click', () => {
    currentMode = 'active';
    document.getElementById('activeMode').classList.add('active');
    document.getElementById('exitedMode').classList.remove('active');
    clearResults();
});

document.getElementById('exitedMode').addEventListener('click', () => {
    currentMode = 'exiting';
    document.getElementById('exitedMode').classList.add('active');
    document.getElementById('activeMode').classList.remove('active');
    clearResults();
});

async function searchValidators() {
    const minBalance = document.getElementById('minBalance').value;
    const searchAddress = document.getElementById('searchAddress').value.toLowerCase();
    const type = document.querySelector('.mode-btn.active').id.replace('Mode', '');
    
    try {
        const response = await fetch(`/api/validators?min=${minBalance}&type=${type}&address=${encodeURIComponent(searchAddress)}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        // Clear previous results
        const tbody = document.querySelector('#validatorTable tbody');
        tbody.innerHTML = '';
        
        // Update results count
        document.getElementById('count').textContent = 
            `Found ${data.count} ${currentMode} validators (showing ${data.results.length})`;
        
        // Populate table
        data.results.forEach(validator => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${validator.address}</td>
                <td>${validator.balance.toLocaleString()}</td>
                <td>${validator.status}</td>
            `;
            tbody.appendChild(row);
        });
        
    } catch (error) {
        document.getElementById('error').textContent = 
            `Search failed: ${error.message}`;
    }
}

function clearResults() {
    document.querySelector('#validatorTable tbody').innerHTML = '';
    document.getElementById('count').textContent = '';
    document.getElementById('error').textContent = '';
}