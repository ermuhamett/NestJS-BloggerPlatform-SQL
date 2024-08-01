import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialMigration1722504853634 implements MigrationInterface {
  name = 'InitialMigration1722504853634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "email_confirmation" ("emailId" uuid NOT NULL DEFAULT uuid_generate_v4(), "isConfirmed" boolean NOT NULL DEFAULT false, "confirmationCode" character varying NOT NULL, "confirmationCodeExpirationDate" TIMESTAMP NOT NULL, "passwordRecoveryCode" character varying, "passwordRecoveryCodeExpirationDate" TIMESTAMP, "isPasswordRecoveryConfirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4f8dc963c6006501672677c263b" PRIMARY KEY ("emailId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("deviceId" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip" character varying(255) NOT NULL, "deviceName" character varying(255) NOT NULL, "createdAt" bigint NOT NULL, "expirationDate" bigint NOT NULL, "userUserId" uuid, CONSTRAINT "PK_c57e995074bf9afc1a2953d2329" PRIMARY KEY ("deviceId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying COLLATE "C" NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "emailConfirmationId" uuid, CONSTRAINT "REL_5f273954b3ecad701a626e3894" UNIQUE ("emailConfirmationId"), CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_576572ccc423bf023f4d6c164d9" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_5f273954b3ecad701a626e38945" FOREIGN KEY ("emailConfirmationId") REFERENCES "email_confirmation"("emailId") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_5f273954b3ecad701a626e38945"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_576572ccc423bf023f4d6c164d9"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "email_confirmation"`);
  }
}
