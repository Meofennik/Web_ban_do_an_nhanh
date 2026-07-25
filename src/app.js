const express = require('express');
const path = require('path');

const app = express();

app.use(express.static(path.join(__dirname, '..', 'public')));

// Cấu hình view engine EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route trang chủ
app.get('/', (req, res) => {
  res.render('pages/index');
});

module.exports = app;