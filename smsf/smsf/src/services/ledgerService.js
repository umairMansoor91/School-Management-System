import api from './api';

// Ledger API services
const ledgerService = {
  // Get all ledger entries
  getAllLedgers: () => {
    return api.get('/api/ledger/');
  },
  
  // Get ledger by ID
  getLedger: (id) => {
    return api.get(`/api/ledger/${id}/`);
  },
  
  // Create new ledger entry
  createLedger: (ledgerData) => {
    return api.post('/api/ledger/', ledgerData);
  },
  
  // Update ledger entry
  updateLedger: (id, ledgerData) => {
    return api.put(`/api/ledger/${id}/`, ledgerData);
  },
  
  // Delete ledger entry
  deleteLedger: (id) => {
    return api.delete(`/api/ledger/${id}/`);
  }
};

export default ledgerService;