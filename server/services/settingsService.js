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

export const login = async (email, password) => {
    return query(
    `
        SELECT * FROM "Settings" WHERE "Email" = '${email}' AND "Password" = '${password}' LIMIT 1
    `
    )
}

export const changePassword = async (data) => {
    
    return query(`
        UPDATE public."Settings"
        SET "Password"= '${data.password}'
        WHERE "Email" = '${data.email}' AND "Password" = '${data.currentPassword}';
    `)
}