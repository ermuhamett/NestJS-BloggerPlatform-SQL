import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Session } from '../features/security/domain/security.orm.entity';
import { EmailConfirmation } from '../features/users/domain/email-confirmation.orm.entity';
import { User } from '../features/users/domain/user.orm.entity';

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get<string>('DATABASE_HOST'),
  port: configService.get<number>('DATABASE_PORT'),
  username: configService.get<string>('DATABASE_USERNAME'),
  password: configService.get<string>('DATABASE_PASSWORD'),
  database: configService.get<string>('DATABASE_NAME'),
  //migrations: ['src/migrations/*.ts'],
  entities: [__dirname + '/../**/*.orm.entity{.ts,.js}'], // Загрузка всех сущностей с расширением .orm.entity.ts внутри src
  migrations: [__dirname + '/../migration/**/*{.ts,.js}'],
  //subscribers: ['src/subscriber/**/*.ts'],
  synchronize: false,
  //logging: true,
});

export default AppDataSource;

// config(); // Загрузить переменные окружения из .env файла
//
// export default new DataSource({
//   type: 'postgres',
//   host: process.env.DATABASE_HOST,
//   port: parseInt(process.env.DATABASE_PORT, 10),
//   username: process.env.DATABASE_USERNAME,
//   password: process.env.DATABASE_PASSWORD,
//   database: process.env.DATABASE_NAME,
//   migrations: ['src/migrations/*.ts'],
//   entities: ['src/**/*.orm.entity.ts'], // Загрузка всех сущностей с расширением .orm.entity.ts внутри src
//   synchronize: false,
//   logging: true,
// });
