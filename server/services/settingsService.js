import { query } from "../config/db.js";

export const updateSettings = email => {
    return query(`
        UPDATE public."Settings"
        SET "Email"= '${email}'
        WHERE "Id" = 1;
    `)
}

export const getSettings = async () => {
    return query(`
        SELECT * FROM "Settings"
    `)
}