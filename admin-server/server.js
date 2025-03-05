const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, '../data/products.json');

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

function readProductsData() {
  const data = fs.readFileSync(DATA_FILE, 'utf8');
  return JSON.parse(data);
}

function writeProductsData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/products', (req, res) => {
  try {
    const data = readProductsData();
    res.json(data.products);
  } catch (error) {
    console.error('Ошибка при чтении товаров:', error);
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
});

app.post('/products', (req, res) => {
  try {
    const data = readProductsData();
    const newProducts = Array.isArray(req.body) ? req.body : [req.body];

    const maxId = data.products.reduce((max, product) => Math.max(max, product.id), 0);

    newProducts.forEach((product, index) => {
      data.products.push({
        ...product,
        id: maxId + index + 1
      });
    });

    writeProductsData(data);
    res.status(201).json(newProducts);
  } catch (error) {
    console.error('Ошибка при добавлении товаров:', error);
    res.status(500).json({ error: 'Ошибка при добавлении товаров' });
  }
});

// Редактирование товара по ID
app.put('/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const data = readProductsData();

    const index = data.products.findIndex(product => product.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    data.products[index] = {
      ...req.body,
      id: productId
    };

    writeProductsData(data);
    res.json(data.products[index]);
  } catch (error) {
    console.error('Ошибка при обновлении товара:', error);
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

app.delete('/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const data = readProductsData();

    const index = data.products.findIndex(product => product.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Удаляем товар из массива
    data.products.splice(index, 1);

    writeProductsData(data);
    res.json({ message: 'Товар успешно удален' });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Админ панель запущена на порту ${PORT}`);
});