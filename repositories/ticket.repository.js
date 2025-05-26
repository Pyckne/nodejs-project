const Ticket = require('../models/Ticket');
const TicketDTO = require('../dto/ticket.dto');

class TicketRepository {
  async create(data) {
    const newTicket = await Ticket.create(data);
    return new TicketDTO(newTicket);
  }

  async getById(id) {
    const ticket = await Ticket.findById(id);
    if (!ticket) return null;
    return new TicketDTO(ticket);
  }

  async getAll() {
    const tickets = await Ticket.find();
    return tickets.map(ticket => new TicketDTO(ticket));
  }
}

module.exports = new TicketRepository();