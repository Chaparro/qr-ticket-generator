import test from 'node:test';
import assert from 'node:assert/strict';
import { QRGenerator } from '../src/core/qrGenerator.js';
import { Ticket } from '../src/core/ticket.js';

test('QRGenerator', async (t) => {
  await t.test('createTicket generates a unique ticket', (t) => {
    const generator = new QRGenerator();
    const ticket = generator.createTicket();
    
    assert.ok(ticket instanceof Ticket, 'Should return a Ticket instance');
    assert.ok(ticket.id, 'Ticket should have an ID');
    assert.ok(ticket.timestamp instanceof Date, 'Ticket should have a timestamp');
  });

  await t.test('createTicket with custom data', (t) => {
    const generator = new QRGenerator();
    const customData = { seat: 'A1', event: 'Concert' };
    const ticket = generator.createTicket(customData);
    
    assert.deepStrictEqual(ticket.data, customData, 'Ticket should contain custom data');
  });

  await t.test('generateQRCodeDataURL creates valid data URL', async (t) => {
    const generator = new QRGenerator();
    const ticket = generator.createTicket();
    const dataURL = await generator.generateQRCodeDataURL(ticket);
    
    assert.match(dataURL, /^data:image\/png;base64,/, 'Should return a PNG data URL');
  });

  await t.test('generateQRCodeBuffer creates valid buffer', async (t) => {
    const generator = new QRGenerator();
    const ticket = generator.createTicket();
    const buffer = await generator.generateQRCodeBuffer(ticket);
    
    assert.ok(Buffer.isBuffer(buffer), 'Should return a Buffer');
    assert.ok(buffer.length > 0, 'Buffer should not be empty');
  });
});