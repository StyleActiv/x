// mysql-config.js

const mysql = require('mysql2/promise');
const { dbConfig } = require('./mysql-config-updated'); // Usa la config generada

class MySQLDatabase {
    constructor() {
        this.init();
    }

    async init() {
        this.connection = await mysql.createConnection(dbConfig);
        console.log('🔗 Conectado a MySQL desde mysql-config.js');
    }

    // Obtener todos los usuarios
    async getAllUsers() {
        const [rows] = await this.connection.execute('SELECT * FROM users');
        return rows;
    }

    // Obtener usuario por email
    async getUserByEmail(email) {
        const [rows] = await this.connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        return rows[0];
    }

    // Agregar nuevo usuario
    async addUser(userData) {
        const {
            user_id,
            name,
            email,
            phone,
            photo = null,
            provider = 'manual',
            document_type = null,
            document_number = null,
            birth_date = null,
            address = null,
            city = null,
            country = 'Colombia',
        } = userData;

        try {
            await this.connection.execute(`
                INSERT INTO users (
                    user_id, name, email, phone, photo, provider,
                    document_type, document_number, birth_date,
                    address, city, country
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    user_id, name, email, phone, photo, provider,
                    document_type, document_number, birth_date,
                    address, city, country
                ]
            );
            return { success: true, user: userData };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Actualizar usuario
    async updateUser(userId, updateData) {
        const fields = [];
        const values = [];

        for (const [key, value] of Object.entries(updateData)) {
            fields.push(`${key} = ?`);
            values.push(value);
        }

        values.push(userId);

        const sql = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;

        try {
            await this.connection.execute(sql, values);
            return { success: true, user: updateData };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Agregar orden
    async addOrder(userId, orderData) {
        const {
            order_id,
            total,
            status,
            payment_method,
            payment_number,
            shipping_address,
            notes
        } = orderData;

        try {
            await this.connection.execute(`
                INSERT INTO orders (
                    order_id, user_id, total, status,
                    payment_method, payment_number, shipping_address, notes
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    order_id, userId, total, status,
                    payment_method, payment_number, shipping_address, notes
                ]
            );

            return { success: true, order: orderData };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Obtener órdenes por usuario
    async getUserOrders(userId) {
        const [rows] = await this.connection.execute(
            'SELECT * FROM orders WHERE user_id = ?',
            [userId]
        );
        return rows;
    }

    // Obtener estadísticas (ejemplo básico)
    async getStats() {
        const [users] = await this.connection.execute('SELECT COUNT(*) AS total_users FROM users');
        const [orders] = await this.connection.execute('SELECT COUNT(*) AS total_orders FROM orders');

        return {
            total_users: users[0].total_users,
            total_orders: orders[0].total_orders
        };
    }

    async close() {
        await this.connection.end();
    }
}

module.exports = { MySQLDatabase };