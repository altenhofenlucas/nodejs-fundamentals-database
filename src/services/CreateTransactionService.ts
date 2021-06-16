import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface CreateTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryTitle: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    categoryTitle,
  }: CreateTransactionDTO): Promise<Transaction> {
    const repository = getCustomRepository(TransactionsRepository);

    if (!['income', 'outcome'].includes(type)) {
      throw new AppError("Transaction type must be 'income' or 'outcome'", 400);
    }
    const { total } = await repository.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError("You don't have enough balance", 400);
    }

    if (!categoryTitle) {
      throw new AppError(
        'Category title is required to create new transaction',
        400,
      );
    }
    const createCategory = new CreateCategoryService();
    const category = await createCategory.execute({ title: categoryTitle });

    const transaction = repository.create({
      title,
      type,
      value,
      category_id: category.id,
    });

    await repository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
