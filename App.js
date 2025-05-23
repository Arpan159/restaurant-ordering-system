import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

const App = () => {
  const [orders, setOrders] = useState([]);
  const [tableNumber, setTableNumber] = useState('');
  const [item, setItem] = useState('');
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchOrders();
    socket.on('new_order', (order) => setOrders((prev) => [...prev, order]));
    socket.on('update_order', (updatedOrder) => {
      setOrders((prev) =>
        prev.map((order) => (order._id === updatedOrder._id ? updatedOrder : order))
      );
    });
  }, []);

  const fetchOrders = async () => {
    const res = await fetch('http://localhost:3001/orders');
    const data = await res.json();
    setOrders(data);
  };

  const placeOrder = async () => {
    const res = await fetch('http://localhost:3001/order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableNumber, items }),
    });
    const data = await res.json();
    setItems([]);
    setItem('');
  };

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:3001/order/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Customer Order Screen</h2>
      <input
        value={tableNumber}
        onChange={(e) => setTableNumber(e.target.value)}
        placeholder="Table Number"
      />
      <input
        value={item}
        onChange={(e) => setItem(e.target.value)}
        placeholder="Item"
      />
      <button onClick={() => { setItems([...items, item]); setItem(''); }}>Add Item</button>
      <button onClick={placeOrder}>Place Order</button>
      <ul>
        {items.map((i, index) => <li key={index}>{i}</li>)}
      </ul>

      <hr />
      <h2>Kitchen Display</h2>
      {orders.map((order) => (
        <div key={order._id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
          <h4>Table {order.tableNumber}</h4>
          <ul>
            {order.items.map((i, idx) => <li key={idx}>{i}</li>)}
          </ul>
          <p>Status: {order.status}</p>
          <button onClick={() => updateStatus(order._id, 'preparing')}>Preparing</button>
          <button onClick={() => updateStatus(order._id, 'ready')}>Ready</button>
        </div>
      ))}
    </div>
  );
};

export default App;
