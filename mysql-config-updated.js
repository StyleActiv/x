const mysql = require('mysql2/promise');

const dbConfig = {
    host: 'localhost',
    user: 'estilo_activo_user',
    password: 'carlos123!',
    database: 'estilo_activo_db',
    port: 3306,
    charset: 'utf8mb4',
    timezone: '+00:00'
};

class MySQLDatabase {
  constructor() {
    this.pool = mysql.createPool(dbConfig);
  }

  async getAllUsers() {
    const [rows] = await this.pool.query('SELECT * FROM users');
    return rows;
  }

  async getUserByEmail(email) {
    const [rows] = await this.pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  // Agrega aquí otros métodos que uses (addUser, updateUser, etc.)

  async close() {
    await this.pool.end();
  }
}

module.exports = { dbConfig, MySQLDatabase };