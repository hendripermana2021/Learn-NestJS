import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedPhone1728269326158 implements MigrationInterface {
    name = 'RemovedPhone1728269326158'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" text`);
    }

}
