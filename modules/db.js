const knex =require('knex');

module.exports = {
  db: knex({
    client:'pg',
    connection:{
      connectionString:process.env.DB_POSTGRES_PROD_URL,
    }
  })
}

// Local
// module.exports = {
//   db: knex({
//     client:'pg',
//     connection:{
//       host:'127.0.0.1',
//       user:'postgres',
//       password:process.env.POSTGRESS_PASSWORD,
//       database:'postgres'
//     }
//   })
// }