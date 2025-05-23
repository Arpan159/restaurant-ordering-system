const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/restaurant', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const OrderSchema = new mongoose.Schema({
  tableNumber: Number,
  items: [String],
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now },
});

const Order = mongoose.model('Order', OrderSchema);

app.get('/orders', async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.post('/order', async (req, res) => {
  const { tableNumber, items } = req.body;
  const newOrder = new Order({ tableNumber, items });
  await newOrder.save();
  io.emit('new_order', newOrder);
  res.status(201).json(newOrder);
});

app.put('/order/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
  io.emit('update_order', updated);
  res.json(updated);
});

io.on('connection', (socket) => {
  console.log('New socket connection');
});

server.listen(3001, () => console.log('Server running on port 3001'));
