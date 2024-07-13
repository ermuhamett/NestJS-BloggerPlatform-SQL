import { Injectable, NotFoundException } from '@nestjs/common';
import { User, UserDocument } from '../domain/user.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import {
  UserMapper,
  UserOutputDto,
} from '../api/models/output/user.output.model';
import { QueryOutputType } from '../../../base/adapters/query/query.class';

// export abstract class BaseQueryRepository<M> {
//     protected constructor(private model: Model<M>) {
//     }
//
//     async find(filter: FilterQuery<M>,
//                projection?: ProjectionType<M> | null | undefined,
//                options?: QueryOptions<M> | null | undefined,
//                pagination: {skip: number, limit: number }) {
//         return this.model.find<M>(filter, projection, options)
//     }
// }

@Injectable()
export class UserQueryRepository {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async getUserById(userId: string): Promise<UserOutputDto> {
    const user = await this.userModel.findById(userId, { __v: false });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return UserMapper.toView(user);
  }

  async getUsersWithPaging(query: QueryOutputType) {
    const searchByLogin = {
      login: { $regex: query.searchLoginTerm ?? '', $options: 'i' },
    };
    const searchByEmail = {
      email: { $regex: query.searchEmailTerm ?? '', $options: 'i' },
    };
    const filter = { $or: [searchByLogin, searchByEmail] };
    const totalCount = await this.userModel.countDocuments(filter);
    const pageCount = Math.ceil(totalCount / query.pageSize);
    try {
      const users: UserDocument[] = await this.userModel
        .find(filter)
        .sort({ [query.sortBy]: query.sortDirection })
        .skip((query.pageNumber - 1) * query.pageSize)
        .limit(query.pageSize);
      return {
        pagesCount: pageCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount: totalCount,
        items: users.map(UserMapper.toView),
      };
    } catch (e) {
      //Фича можно отловить ошибку то есть где именно падает и тд
      console.log({ get_users_repo: e });
      return false;
    }
  }
}
