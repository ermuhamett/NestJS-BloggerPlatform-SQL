import { Injectable } from '@nestjs/common';
import {
  UserMapper,
  UserOutputDto,
} from '../api/models/output/user.output.model';
import { QueryOutputType } from '../../../base/adapters/query/query.class';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../domain/user.entity';
import { EmailConfirmation } from '../domain/email-confirmation.entity';

@Injectable()
export class UserQueryRepositorySql {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(EmailConfirmation)
    private readonly emailConfirmationRepo: Repository<EmailConfirmation>,
  ) {}
  async getUserById(userId: string): Promise<UserOutputDto | null> {
    const user = await this.userRepo.findOne({
      where: { userId },
      relations: ['emailConfirmation'], // Имя свойства, представляющего отношение
    });
    if (!user) {
      return null;
    }
    return UserMapper.toView(user);
  }
  async getUsersWithPaging(query: QueryOutputType) {
    const searchLoginTerm = query.searchLoginTerm ?? '';
    const searchEmailTerm = query.searchEmailTerm ?? '';
    const sortBy = query.sortBy;
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    const [users, totalCount] = await this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.emailConfirmation', 'e') //Подключение связанной сущности EmailConfirmation с использованием алиаса 'e'.
      .where(
        '(u.login ILIKE :searchLoginTerm OR u.email ILIKE :searchEmailTerm)',
        {
          searchLoginTerm: `%${searchLoginTerm}%`,
          searchEmailTerm: `%${searchEmailTerm}%`,
        },
      )
      .orderBy(`u.${sortBy}`, sortDirection)
      .skip(offset) //Пропуск страниц
      .take(limit)
      .getManyAndCount();

    const pageCount = Math.ceil(totalCount / query.pageSize);
    const userViews = users.map(UserMapper.toView);

    return {
      pagesCount: pageCount,
      page: query.pageNumber,
      pageSize: query.pageSize,
      totalCount: totalCount,
      items: userViews,
    };
  }
  /*constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserById(userId: string): Promise<UserOutputDto> {
    const result = await this.dataSource.query(
      `
      SELECT u.*, e.*
      FROM "Users" u
      LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
      WHERE u."userId" = $1
    `,
      [userId],
    );
    if (result.length === 0) {
      return null; // Возвращаем null, если пользователь не найден
    }
    const user = UserMapper.toDomain(result[0]);
    return UserMapper.toView(user);
  }
  async getUsersWithPaging(query: QueryOutputType) {
    console.log('Query in repo: ', query);
    const searchLoginTerm = query.searchLoginTerm ?? '';
    const searchEmailTerm = query.searchEmailTerm ?? '';
    const sortBy = query.sortBy;
    const sortDirection = query.sortDirection === 'asc' ? 'ASC' : 'DESC';
    const offset = (query.pageNumber - 1) * query.pageSize;
    const limit = query.pageSize;
    const filterQuery = `
      (u.login ILIKE '%' || $1 || '%'
      OR u.email ILIKE '%' || $2 || '%')
    `;
    const totalCountResult = await this.dataSource.query(
      `
      SELECT COUNT(*) as count
      FROM "Users" u
      WHERE ${filterQuery}
    `,
      [searchLoginTerm, searchEmailTerm],
    );
    const totalCount = parseInt(totalCountResult[0].count, 10);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const usersResult = await this.dataSource.query(
        `
        SELECT u.*, e.*
        FROM "Users" u
        LEFT JOIN "EmailConfirmations" e ON u."emailConfirmationId" = e."emailId"
        WHERE ${filterQuery}
        ORDER BY u."${sortBy}" ${sortDirection}
        OFFSET $3
        LIMIT $4
      `,
        [searchLoginTerm, searchEmailTerm, offset, limit],
      );
      const users = usersResult.map(UserMapper.toDomain).map(UserMapper.toView);
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: users,
      };
    } catch (e) {
      console.log({ get_users_repo: e });
      return false;
    }
  }*/
}
