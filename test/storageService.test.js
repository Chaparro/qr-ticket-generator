import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { StorageService } from '../src/core/storageService.js';
import { QRGenerator } from '../src/core/qrGenerator.js';

test('StorageService', async (t) => {
  // Create a temporary directory for testing
  let tempDir;
  
  t.beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'qr-test-'));
  });
  
  t.afterEach(async () => {
    // Clean up
    if (tempDir) {
      await fs.rm(tempDir, { recursive: true, force: true });
    }
  });
  
  await t.test('init creates storage directory', async (t) => {
    const storage = new StorageService(tempDir);
    await storage.init();
    
    const stats = await fs.stat(tempDir);
    assert.ok(stats.isDirectory(), 'Storage directory should be created');
  });
  
  await t.test('saveTicket saves ticket data and QR code', async (t) => {
    const storage = new StorageService(tempDir);
    await storage.init();
    
    const generator = new QRGenerator();
    const ticket = generator.createTicket({ event: 'Test Event' });
    const qrBuffer = await generator.generateQRCodeBuffer(ticket);
    
    const qrPath = await storage.saveTicket(ticket, qrBuffer);
    
    // Check if files exist
    const ticketDir = path.join(tempDir, ticket.id);
    const ticketQrPath = path.join(ticketDir, 'qrcode.png');
    const metadataPath = path.join(ticketDir, 'metadata.json');
    
    assert.equal(qrPath, ticketQrPath, 'Should return the correct QR path');
    
    const qrExists = await fs.stat(ticketQrPath).then(() => true).catch(() => false);
    const metadataExists = await fs.stat(metadataPath).then(() => true).catch(() => false);
    
    assert.ok(qrExists, 'QR code file should exist');
    assert.ok(metadataExists, 'Metadata file should exist');
    
    // Check metadata content
    const metadataContent = await fs.readFile(metadataPath, 'utf8');
    const parsedMetadata = JSON.parse(metadataContent);
    
    assert.equal(parsedMetadata.id, ticket.id, 'Saved ID should match');
    assert.deepStrictEqual(parsedMetadata.data, ticket.data, 'Saved data should match');
  });
  
  await t.test('getAllTickets retrieves saved tickets', async (t) => {
    const storage = new StorageService(tempDir);
    await storage.init();
    
    const generator = new QRGenerator();
    const ticket1 = generator.createTicket({ event: 'Event 1' });
    const ticket2 = generator.createTicket({ event: 'Event 2' });
    
    await storage.saveTicket(ticket1, await generator.generateQRCodeBuffer(ticket1));
    await storage.saveTicket(ticket2, await generator.generateQRCodeBuffer(ticket2));
    
    const tickets = await storage.getAllTickets();
    
    assert.equal(tickets.length, 2, 'Should retrieve two tickets');
    
    // Find tickets by ID
    const foundTicket1 = tickets.find(t => t.ticket.id === ticket1.id);
    const foundTicket2 = tickets.find(t => t.ticket.id === ticket2.id);
    
    assert.ok(foundTicket1, 'First ticket should be found');
    assert.ok(foundTicket2, 'Second ticket should be found');
    assert.deepStrictEqual(foundTicket1.ticket.data, ticket1.data, 'Ticket 1 data should match');
    assert.deepStrictEqual(foundTicket2.ticket.data, ticket2.data, 'Ticket 2 data should match');
  });
  
  await t.test('clearAllTickets removes all tickets', async (t) => {
    const storage = new StorageService(tempDir);
    await storage.init();
    
    const generator = new QRGenerator();
    const ticket = generator.createTicket();
    
    await storage.saveTicket(ticket, await generator.generateQRCodeBuffer(ticket));
    
    // Verify ticket exists
    let tickets = await storage.getAllTickets();
    assert.equal(tickets.length, 1, 'Should have one ticket');
    
    // Clear tickets
    await storage.clearAllTickets();
    
    // Verify tickets are gone
    tickets = await storage.getAllTickets();
    assert.equal(tickets.length, 0, 'Should have no tickets after clearing');
  });
});