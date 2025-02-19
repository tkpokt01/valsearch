async function searchValidators() {
    const minBalance = document.getElementById('minBalance').value;
    const response = await fetch(`/api/validators?min=${minBalance}`);
    const data = await response.json();
    
    // Update results count
    document.getElementById('count').textContent = 
        `Found ${data.count} addresses (showing ${data.results.length})`;
    
    // Populate table
    const tbody = document.querySelector('#validatorTable tbody');
    tbody.innerHTML = '';
    
    data.results.forEach(validator => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${validator.address}</td>
            <td>${validator.balance.toLocaleString()}</td>
            <td>${validator.status}</td>
        `;
        tbody.appendChild(row);
    });
}