// DOM Elements
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const ticketsGrid = document.getElementById('ticketsGrid');
const ticketModal = document.getElementById('ticketModal');
const modalContent = document.getElementById('modalContent');
const closeButton = document.querySelector('.close-button');

// Load all tickets on startup
window.addEventListener('DOMContentLoaded', loadAllTickets);

// Button event listeners
generateBtn.addEventListener('click', generateNewTicket);
clearBtn.addEventListener('click', clearAllTickets);
closeButton.addEventListener('click', closeModal);

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === ticketModal) {
    closeModal();
  }
});

/**
 * Load all existing tickets
 */
async function loadAllTickets() {
  try {
    const response = await window.api.getAllTickets();
    
    if (response.success) {
      renderTickets(response.tickets);
    } else {
      showError('Failed to load tickets: ' + response.error);
    }
  } catch (error) {
    showError('Error loading tickets: ' + error.message);
  }
}

/**
 * Generate a new ticket
 */
async function generateNewTicket() {
  try {
    // In a real app, we might show a form to collect data
    // For simplicity, we'll just generate with current timestamp as data
    const ticketData = { 
      eventName: 'Demo Event',
      generatedAt: new Date().toISOString()
    };
    
    const response = await window.api.generateTicket(ticketData);
    
    if (response.success) {
      // Refresh ticket display
      await loadAllTickets();
    } else {
      showError('Failed to generate ticket: ' + response.error);
    }
  } catch (error) {
    showError('Error generating ticket: ' + error.message);
  }
}

/**
 * Clear all tickets
 */
async function clearAllTickets() {
  if (!confirm('Are you sure you want to delete all tickets?')) {
    return;
  }
  
  try {
    const response = await window.api.clearAllTickets();
    
    if (response.success) {
      // Refresh ticket display
      await loadAllTickets();
    } else {
      showError('Failed to clear tickets: ' + response.error);
    }
  } catch (error) {
    showError('Error clearing tickets: ' + error.message);
  }
}

/**
 * Render tickets to the grid
 */
function renderTickets(tickets) {
  // Clear existing content
  ticketsGrid.innerHTML = '';
  
  if (tickets.length === 0) {
    ticketsGrid.innerHTML = '<div class="empty-state">No tickets yet. Generate your first ticket!</div>';
    return;
  }
  
  // Sort tickets by timestamp (newest first)
  tickets.sort((a, b) => new Date(b.ticket.timestamp) - new Date(a.ticket.timestamp));
  
  // Add each ticket to the grid
  tickets.forEach(({ ticket, qrDataURL }) => {
    const ticketCard = document.createElement('div');
    ticketCard.className = 'ticket-card';
    ticketCard.innerHTML = `
      <img src="${qrDataURL}" alt="QR Code">
      <div class="ticket-info">
        <div class="ticket-id">${truncateId(ticket.id)}</div>
        <div class="ticket-date">${formatDate(ticket.timestamp)}</div>
      </div>
    `;
    
    // Add click event to show details
    ticketCard.addEventListener('click', () => {
      showTicketDetails(ticket, qrDataURL);
    });
    
    ticketsGrid.appendChild(ticketCard);
  });
}

/**
 * Show ticket details in modal
 */
function showTicketDetails(ticket, qrDataURL) {
  // Create modal content
  let metadataHtml = '';
  if (ticket.data && Object.keys(ticket.data).length > 0) {
    metadataHtml = `
      <div class="ticket-detail-metadata">
        <h3>Additional Data</h3>
        ${Object.entries(ticket.data).map(([key, value]) => `
          <div class="metadata-item">
            <span class="metadata-key">${key}:</span>
            <span class="metadata-value">${value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
  
  modalContent.innerHTML = `
    <div class="ticket-detail">
      <img src="${qrDataURL}" alt="QR Code">
      <div class="ticket-detail-info">
        <div class="ticket-detail-id">ID: ${ticket.id}</div>
        <div class="ticket-detail-date">Created: ${formatDate(ticket.timestamp, true)}</div>
        ${metadataHtml}
      </div>
    </div>
  `;
  
  // Show modal
  ticketModal.classList.add('show');
}

/**
 * Close the modal
 */
function closeModal() {
  ticketModal.classList.remove('show');
}

/**
 * Show an error message
 */
function showError(message) {
    alert(message);
    console.error(message);
  }
  
  /**
   * Format date for display
   */
  function formatDate(dateString, includeTime = false) {
    const date = new Date(dateString);
    if (includeTime) {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  }
  
  /**
   * Truncate ID for display
   */
  function truncateId(id) {
    if (id.length <= 8) return id;
    return id.substring(0, 8) + '...';
  }