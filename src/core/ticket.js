// Represents a ticket with metadata
export class Ticket {
    constructor(id, timestamp = new Date(), data = {}) {
      this.id = id;
      this.timestamp = timestamp;
      this.data = data;
    }
    
    toJSON() {
      return {
        id: this.id,
        timestamp: this.timestamp,
        data: this.data
      };
    }
  }