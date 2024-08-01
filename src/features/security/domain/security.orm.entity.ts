import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.orm.entity';

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  deviceId: string;

  @Column({ type: 'varchar', length: 255 })
  ip: string;

  @Column({ type: 'varchar', length: 255 })
  deviceName: string;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  expirationDate: number;

  @ManyToOne(() => User, (user) => user.sessions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
  static create(
    userId: string,
    deviceId: string,
    deviceName: string,
    ip: string,
    createdAt: number,
    expirationDate: number,
  ): Session {
    const session = new Session();
    session.user = { userId } as User;
    session.deviceId = deviceId;
    session.deviceName = deviceName;
    session.ip = ip;
    session.createdAt = createdAt;
    session.expirationDate = expirationDate;
    return session;
  }
}
