import Sequelize from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
});

// Synchronize models with the database
sequelize.sync({ alter: true })
    .then(() => {
        console.log('Database synchronized with models.');
    })
    .catch((err) => {
        console.error('Error synchronizing database:', err);
    });

export default sequelize;
