import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { QRGenerator } from '../src/core/qrGenerator.js';
import { StorageService } from '../src/core/storageService.js';

test('Integration test - Full ticket lifecycle', async (t) => {
  // Create a temporary directory for the test
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qr-test-integration-'));
  
  try {
    // Initialize our services
    const qrGenerator = new QRGenerator();
    const storageService = new StorageService(tempDir);
    await storageService.init();
    
    // 1. Generate a ticket
    const ticket = qrGenerator.createTicket({ event: 'Integration Test Event' });
    assert.ok(ticket.id, 'Ticket should have an ID');
    
    // 2. Generate QR code
    const qrBuffer = await qrGenerator.generateQRCodeBuffer(ticket);
    assert.ok(Buffer.isBuffer(qrBuffer), 'Should return a valid buffer');
    
    // 3. Save the ticket
    const qrPath = await storageService.saveTicket(ticket, qrBuffer);
    assert.ok(qrPath, 'Should return a path to the saved QR code');
    
    // 4. Check if the ticket was saved correctly
    const savedTickets = await storageService.getAllTickets();
    assert.equal(savedTickets.length, 1, 'Should have one saved ticket');
    assert.equal(savedTickets[0].ticket.id, ticket.id, 'Saved ticket should have the correct ID');
    
    // 5. Generate a second ticket
    const secondTicket = qrGenerator.createTicket({ event: 'Second Event' });
    const secondQrBuffer = await qrGenerator.generateQRCodeBuffer(secondTicket);
    await storageService.saveTicket(secondTicket, secondQrBuffer);
    
    // 6. Check if both tickets are saved
    const allTickets = await storageService.getAllTickets();
    assert.equal(allTickets.length, 2, 'Should have two saved tickets');
    
    // 7. Clear all tickets
    await storageService.clearAllTickets();
    
    // 8. Verify tickets are cleared
    const emptyTickets = await storageService.getAllTickets();
    assert.equal(emptyTickets.length, 0, 'Should have no tickets after clearing');
    
  } finally {
    // Clean up
    await fs.rm(tempDir, { recursive: true, force: true });
  }
});