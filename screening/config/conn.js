const Pool = require('pg').Pool

// const conn = new Pool({
//     host: process.env.HOST_PG,
//     port: process.env.PORT_PG,
//     database: process.env.DBNAME_PG,
//     user: process.env.USER_PG,
//     password: process.env.PASSWORD_PG,
//   })

  const conn = new Pool({
    host: '10.22.15.135',
    port: '5432',
    database: 'mufacq_sc1',
    user: 'uat_revamp',
    password: 'Uat_2021',
  })

  const conn2 = new Pool({
    host: '10.22.15.135',
    port: '5432',
    database: 'mufacq_prm',
    user: 'uat_revamp',
    password: 'Uat_2021',
  })

  const conn_sc2 = new Pool({
    host: '10.22.15.135',
    port: '5432',
    database: 'mufacq_sc2',
    user: 'uat_revamp',
    password: 'Uat_2021',
  })

  const conn_sc3 = new Pool({
    host: '10.22.15.135',
    port: '5432',
    database: 'mufacq_sc3',
    user: 'uat_revamp',
    password: 'Uat_2021',
  })


  module.exports = {
    conn,
    conn2,
    conn_sc2,
    conn_sc3
  }

