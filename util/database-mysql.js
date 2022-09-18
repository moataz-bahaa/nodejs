// const mysql = require('mysql2');

// const pool = mysql.createPool({
//   host: 'localhost',
//   user: 'root',
//   database: 'sql_store',
//   password: 'root328221',
// });

// module.exports = pool.promise();

// (async () => {
//   try {
//     const db = pool.promise();
//     const [rows, fields] = await db.execute(`
//     SELECT order_id, name, quantity, p.unit_price
//     FROM order_items AS oi
//     JOIN products AS p
// 	  ON oi.product_id = p.product_id;`);
//     console.log(rows);
//   } catch (err) {
//     console.error(err.message);
//   }
// })();
