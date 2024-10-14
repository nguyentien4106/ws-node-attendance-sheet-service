import { query } from "../config/db.js";

export const getSheets = () => query(`SELECT * FROM public."Sheets" ORDER BY "Id" ASC `)