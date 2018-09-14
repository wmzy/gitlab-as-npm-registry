const app = require('./app');

app.listen(3000);

if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('http://localhost:3000')
}
