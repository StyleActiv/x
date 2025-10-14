const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const ordersFile = path.join(dataDir, 'orders.json');

function ensureFiles() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
  if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([]), 'utf8');
  if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]), 'utf8');
}

function readJson(file) {
  try {
    const data = fs.readFileSync(file, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  ensureFiles,
  getUsers() { return readJson(usersFile); },
  saveUsers(users) { writeJson(usersFile, users); },
  getOrders() { return readJson(ordersFile); },
  saveOrders(orders) { writeJson(ordersFile, orders); }
};