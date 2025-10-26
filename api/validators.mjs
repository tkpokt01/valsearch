import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async (req, res) => {
    try {
        // Get query parameters
        const type = req.query.type || 'active';
        const minBalance = parseFloat(req.query.min) || 0;
        const searchAddress = (req.query.address || '').toLowerCase();
        const fileName = `${type}.txt`;

        // Validate file name
        if (!['active.txt', 'exited.txt'].includes(fileName)) {
            return res.status(400).json({ error: 'Invalid validator type' });
        }

        // Read and parse data
        const filePath = join(__dirname, fileName);
        const rawData = readFileSync(filePath, 'utf-8');
        
        if (!rawData) {
            throw new Error('Data file is empty');
        }

        // Process validators
        const validators = rawData
        .split('\n')
        .filter(line => line.trim())
        .map(line => {
            const [address, balanceStr] = line.split(',');
            const [whole, decimal] = balanceStr.split('.');
            
            return {
                address: address.trim().toLowerCase(), // Store lowercase for easier matching
                balance: parseFloat(`${whole}.${decimal}`),
                status: 'Over'
            };
        });

    // Filter logic
    const filtered = validators.filter(v => {
        const matchesBalance = v.balance >= minBalance;
        const matchesAddress = searchAddress ? v.address.includes(searchAddress) : true;
        return matchesBalance && matchesAddress;
    }).sort((a, b) => b.balance - a.balance);

        // Set headers and return response
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        return res.status(200).json({
            count: filtered.length,
            results: filtered
        });
        
    } catch (error) {
        console.error('API Error:', error);
        res.setHeader('Content-Type', 'application/json');
        return res.status(500).json({
            error: error.message,
            details: error.stack?.split('\n')[0]
        });
    }
};