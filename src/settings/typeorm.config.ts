import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config(); // Загрузить переменные окружения из .env файла

export default new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  migrations: ['src/migrations/*.ts'],
  entities: ['src/**/*.orm.entity.ts'], // Загрузка всех сущностей с расширением .orm.entity.ts внутри src
  synchronize: false,
  logging: true,
});
