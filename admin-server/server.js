const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, '../data/products.json');

app.use(bodyParser.json());

function readProductsData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return { products: [], categories: [] };
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    try {
      return JSON.parse(data);
    } catch (parseError) {
      return { products: [], categories: [] };
    }
  } catch (error) {
    return { products: [], categories: [] };
  }
}

function writeProductsData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка при записи данных');
  }
}

app.get('/api/categories', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = readProductsData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

app.get('/api/products', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = readProductsData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении товаров' });
  }
});

app.post('/api/products', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = readProductsData();
    const newProducts = Array.isArray(req.body) ? req.body : [req.body];

    const maxId = data.products.reduce((max, product) => Math.max(max, product.id || 0), 0);

    newProducts.forEach((product, index) => {
      data.products.push({
        ...product,
        id: maxId + index + 1
      });
    });

    writeProductsData(data);
    res.status(201).json(newProducts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при добавлении товаров' });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
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
    res.status(500).json({ error: 'Ошибка при обновлении товара' });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const productId = parseInt(req.params.id);
    const data = readProductsData();

    const index = data.products.findIndex(product => product.id === productId);
    if (index === -1) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    data.products.splice(index, 1);

    writeProductsData(data);
    res.json({ message: 'Товар успешно удален' });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при удалении товара' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((req, res) => {
  if (req.url.startsWith('/api/')) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ error: 'API-маршрут не найден' });
  } else {
    res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`Админ-сервер запущен на порту ${PORT}`);

  if (!fs.existsSync(DATA_FILE)) {
    const defaultData = {
      products: [
        {
          id: 1,
          name: "Пример товара",
          price: 1000,
          description: "Описание примера товара",
          categories: ["Электроника"]
        }
      ],
      categories: [
        {
          id: 1,
          name: "Электроника"
        }
      ]
    };
    writeProductsData(defaultData);
  }
});