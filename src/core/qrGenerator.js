import QRCode from 'qrcode';
import { randomUUID } from 'crypto';
import { Ticket } from './ticket.js';

export class QRGenerator {
  constructor() {}

  /**
   * Generates a new ticket with a unique ID
   * @param {Object} data Additional ticket data
   * @returns {Ticket} The generated ticket
   */
  createTicket(data = {}) {
    const ticketId = randomUUID();
    return new Ticket(ticketId, new Date(), data);
  }

  /**
   * Generates QR code as a data URL from a ticket
   * @param {Ticket} ticket The ticket to encode
   * @returns {Promise<string>} QR code as data URL
   */
  async generateQRCodeDataURL(ticket) {
    const ticketData = JSON.stringify(ticket.toJSON());
    try {
      return await QRCode.toDataURL(ticketData);
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  /**
   * Generates QR code as a buffer from a ticket
   * @param {Ticket} ticket The ticket to encode
   * @returns {Promise<Buffer>} QR code as buffer
   */
  async generateQRCodeBuffer(ticket) {
    const ticketData = JSON.stringify(ticket.toJSON());
    try {
      return await QRCode.toBuffer(ticketData);
    } catch (error) {
      throw new Error(`Failed to generate QR code buffer: ${error.message}`);
    }
  }
}