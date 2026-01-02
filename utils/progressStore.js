const clients = new Map();

export function addClient(id, res) {
  clients.set(id, res);
}

export function removeClient(id) {
  clients.delete(id);
}

export function broadcastProgress(data) {
  for (const res of clients.values()) {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  }
}
