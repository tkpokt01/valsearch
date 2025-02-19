import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Analytics } from "@vercel/analytics/react"

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
<Analytics />
export default async (req, res) => {
    try {
        // Use correct path resolution
        const data = readFileSync(join(__dirname, 'active.txt'), 'utf-8');
        
        // Add empty line check
        if (!data) throw new Error('Empty data file');
        
        const validators = data.split('\n')
            .filter(line => line.trim() !== '')
            .map(line => {
                const [address, balanceStr] = line.split(',');
                const [whole, decimal] = balanceStr.split('.');
                return {
                    address,
                    balance: parseFloat(`${whole}.${decimal}`),
                    status: 'Over'
                };
            });

        const minBalance = parseFloat(req.query.min) || 0;
        const filtered = validators.filter(v => v.balance >= minBalance)
                                 .sort((a, b) => b.balance - a.balance);

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json({
            count: filtered.length,
            results: filtered
        });
        
    } catch (error) {
        console.error('Error:', error.message);
        return res.status(500).json({
            error: error.message.startsWith('ENOENT') 
                 ? 'Data file not found' 
                 : 'Processing error'
        });
    }
};