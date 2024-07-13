import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Session {
  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  deviceName: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  createdAt: number;

  @Prop({ required: true })
  expirationDate: number;

  constructor(dto: Partial<Session>) {
    this.ip = dto.ip;
    this.deviceId = dto.deviceId;
    this.deviceName = dto.deviceName;
    this.userId = dto.userId; // Добавьте это
    this.createdAt = dto.createdAt;
    this.expirationDate = dto.expirationDate;
  }
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.loadClass(Session);
export type SessionDocument = HydratedDocument<Session>;
