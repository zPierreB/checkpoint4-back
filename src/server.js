// require('dotenv').config();
// const app = require('./app');

// const PORT = process.env.PORT;

// app.listen(PORT, (err) => {
//     if (err) {
//         console.error(`Error: ${err.message}`);
//     } else {
//         console.log(`Server is running on port: ${PORT}`);
//     }
// });

const app = require('./app');
require('dotenv').config();

app.listen(process.env.PORT, (err) => {
  if (err) {
    console.error(`ERROR: ${err.message}`);
  } else {
    console.log(`Listening on port ${process.env.PORT}`);
  }
});
