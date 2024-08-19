import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import path from 'path';

config(); // Загрузить переменные окружения из .env файла

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  entities: [path.join(__dirname, './**/*.orm.entity{.ts,.js}')], // Загрузка всех сущностей с расширением .orm.entity.ts внутри src
  migrations: [path.join(__dirname, './migrations/**/*{.ts,.js}')],
  synchronize: false,
  //logging: true,
});
