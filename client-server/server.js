const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения всех товаров
app.get('/products', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
    const products = JSON.parse(productsData).products;
    res.json(products);
  } catch (error) {
    console.error('Ошибка при чтении файла товаров:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении товаров' });
  }
});

// Маршрут для получения товаров по категории
app.get('/products/category/:category', (req, res) => {
  try {
    const category = req.params.category;
    const productsData = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
    const products = JSON.parse(productsData).products;

    const filteredProducts = products.filter(product =>
      product.categories.includes(category)
    );

    res.json(filteredProducts);
  } catch (error) {
    console.error('Ошибка при фильтрации товаров по категории:', error);
    res.status(500).json({ error: 'Ошибка сервера при фильтрации товаров' });
  }
});

// Маршрут для получения всех категорий
app.get('/categories', (req, res) => {
  try {
    const productsData = fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8');
    const categories = JSON.parse(productsData).categories;
    res.json(categories);
  } catch (error) {
    console.error('Ошибка при чтении категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера при получении категорий' });
  }
});

// Маршрут для главной страницы
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Клиентский сервер запущен на порту ${PORT}`);
});