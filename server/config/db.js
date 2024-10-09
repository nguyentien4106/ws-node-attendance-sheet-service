
import pkg from "pg";
import "dotenv/config"
import format from "pg-format";
const { Pool } = pkg

console.log({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
})


const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
});



export const query = (text, params) => pool.query(text, params);

export const queryFormat = (text, values) => pool.query(format(`${text} VALUES %L`, values),[], (err, result)=>{
    console.log(err);
    console.log(result);
  });