// Importar módulos necesarios
const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const storage = require('./storage');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

storage.ensureFiles();

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Usuarios
app.post('/api/users', (req, res) => {
  const { name, email, phone, address } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email requerido' });

  const users = storage.getUsers();
  let user = users.find(u => u.email === email);
  if (!user) {
    user = { 
      id: uuidv4(), 
      name: name || '', 
      email, 
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString()
    };
    users.push(user);
    storage.saveUsers(users);
  } else {
    // actualizar datos básicos si vienen
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    storage.saveUsers(users);
  }

  res.json({ success: true, user });
});

app.get('/api/users', (req, res) => {
  const users = storage.getUsers();
  res.json({ users });
});

app.get('/api/users/:id', (req, res) => {
  const users = storage.getUsers();
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'usuario no encontrado' });
  res.json({ user });
});

// Pedidos
app.post('/api/orders', (req, res) => {
  const {
    userId,
    items = [],
    subtotal = 0,
    discount = 0,
    shippingCost = 0,
    total = 0,
    shippingAddress = '',
    notes = '',
    paymentStatus = 'pending'
  } = req.body || {};

  if (!userId) return res.status(400).json({ error: 'userId requerido' });
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'items requeridos' });
  }

  const orders = storage.getOrders();
  const id = 'ORDER-' + uuidv4();
  const createdAt = new Date().toISOString();

  const order = {
    id,
    userId,
    items,
    subtotal,
    discount,
    shippingCost,
    total,
    shippingAddress,
    notes,
    paymentStatus,
    createdAt
  };

  orders.push(order);
  storage.saveOrders(orders);

  res.json({ success: true, order });
});

app.get('/api/orders', (req, res) => {
  const orders = storage.getOrders();
  const { userId } = req.query;
  let filtered = userId ? orders.filter(o => o.userId === userId) : orders;
  
  // Ordenar por fecha y hora (más recientes primero)
  filtered = filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ orders: filtered });
});

app.get('/api/orders/:id', (req, res) => {
  const orders = storage.getOrders();
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'pedido no encontrado' });
  res.json({ order });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Estilo Activo corriendo en http://localhost:${PORT}`);
});
