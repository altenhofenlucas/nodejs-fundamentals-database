import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

const TRANSACTIONS_TABLE_NAME = 'transactions';
const TRANSACTIONS_CATEGORY_FOREIGN_KEY_NAME = 'TransactionsCategory';

export default class CreateTransactions1623808663904
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: TRANSACTIONS_TABLE_NAME,
        columns: [
          {
            name: 'id',
            type: 'varchar',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'title',
            type: 'varchar',
          },
          {
            name: 'type',
            type: 'varchar',
          },
          {
            name: 'value',
            type: 'int',
          },
          {
            name: 'category_id',
            type: 'uuid',
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
      }),
    );

    await queryRunner.createForeignKey(
      TRANSACTIONS_TABLE_NAME,
      new TableForeignKey({
        name: TRANSACTIONS_CATEGORY_FOREIGN_KEY_NAME,
        columnNames: ['category_id'],
        referencedTableName: 'categories',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey(
      TRANSACTIONS_TABLE_NAME,
      TRANSACTIONS_CATEGORY_FOREIGN_KEY_NAME,
    );
    await queryRunner.dropTable(TRANSACTIONS_TABLE_NAME);
  }
}
