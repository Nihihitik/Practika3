const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;
const DATA_FILE = path.join(__dirname, '../data/products.json');

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

app.get('/api/products', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = readProductsData();
    res.json(data.products);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при получении товаров' });
  }
});

app.get('/api/products/category/:category', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const category = req.params.category;
    const data = readProductsData();
    const products = data.products;

    const filteredProducts = products.filter(product =>
      product.categories.includes(category)
    );

    res.json(filteredProducts);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при фильтрации товаров' });
  }
});

app.get('/api/categories', (req, res) => {
  try {
    res.setHeader('Content-Type', 'application/json');
    const data = readProductsData();
    res.json(data.categories);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
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
  console.log(`Клиентский сервер запущен на порту ${PORT}`);

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
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), 'utf8');
  }
});