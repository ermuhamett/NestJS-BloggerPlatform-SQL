import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTables1724156524423 implements MigrationInterface {
    name = 'UpdateTables1724156524423'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "email_confirmation" ("emailId" uuid NOT NULL DEFAULT uuid_generate_v4(), "isConfirmed" boolean NOT NULL DEFAULT false, "confirmationCode" character varying NOT NULL, "confirmationCodeExpirationDate" TIMESTAMP NOT NULL, "passwordRecoveryCode" character varying, "passwordRecoveryCodeExpirationDate" TIMESTAMP, "isPasswordRecoveryConfirmed" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_4f8dc963c6006501672677c263b" PRIMARY KEY ("emailId"))`);
        await queryRunner.query(`CREATE TABLE "blog" ("blogId" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying COLLATE "C" NOT NULL, "description" character varying NOT NULL, "websiteUrl" character varying NOT NULL, "createdAt" character varying NOT NULL, "isMembership" boolean NOT NULL, CONSTRAINT "PK_4b0ec365f40044203b463f977b5" PRIMARY KEY ("blogId"))`);
        await queryRunner.query(`CREATE TABLE "post" ("postId" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(35) NOT NULL, "shortDescription" character varying(110) NOT NULL, "content" character varying(1100) NOT NULL, "createdAt" TIMESTAMP NOT NULL, "blogId" uuid, CONSTRAINT "PK_9b3ab408235ba7d60345a84f994" PRIMARY KEY ("postId"))`);
        await queryRunner.query(`CREATE TABLE "post_likes" ("postId" uuid NOT NULL, "likedUserId" uuid NOT NULL, "likedUserLogin" character varying(255) NOT NULL, "addedAt" TIMESTAMP NOT NULL, "status" character varying(255) NOT NULL, "postPostId" uuid, "userUserId" uuid, CONSTRAINT "PK_30761ac86c3569c74454899cb48" PRIMARY KEY ("postId", "likedUserId"))`);
        await queryRunner.query(`CREATE TABLE "user" ("userId" uuid NOT NULL DEFAULT uuid_generate_v4(), "login" character varying COLLATE "C" NOT NULL, "email" character varying NOT NULL, "passwordHash" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "emailConfirmationId" uuid, CONSTRAINT "REL_5f273954b3ecad701a626e3894" UNIQUE ("emailConfirmationId"), CONSTRAINT "PK_d72ea127f30e21753c9e229891e" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "session" ("deviceId" uuid NOT NULL DEFAULT uuid_generate_v4(), "ip" character varying(255) NOT NULL, "deviceName" character varying(255) NOT NULL, "createdAt" bigint NOT NULL, "expirationDate" bigint NOT NULL, "userId" uuid, CONSTRAINT "PK_c57e995074bf9afc1a2953d2329" PRIMARY KEY ("deviceId"))`);
        await queryRunner.query(`ALTER TABLE "post" ADD CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9" FOREIGN KEY ("blogId") REFERENCES "blog"("blogId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_39073ee86c5933a01ee101bc493" FOREIGN KEY ("postPostId") REFERENCES "post"("postId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "post_likes" ADD CONSTRAINT "FK_bdd54427f6281bd1a2275766cdd" FOREIGN KEY ("userUserId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_5f273954b3ecad701a626e38945" FOREIGN KEY ("emailConfirmationId") REFERENCES "email_confirmation"("emailId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("userId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_5f273954b3ecad701a626e38945"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_bdd54427f6281bd1a2275766cdd"`);
        await queryRunner.query(`ALTER TABLE "post_likes" DROP CONSTRAINT "FK_39073ee86c5933a01ee101bc493"`);
        await queryRunner.query(`ALTER TABLE "post" DROP CONSTRAINT "FK_d0418ddc42c5707dbc37b05bef9"`);
        await queryRunner.query(`DROP TABLE "session"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "post_likes"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`DROP TABLE "blog"`);
        await queryRunner.query(`DROP TABLE "email_confirmation"`);
    }

}
