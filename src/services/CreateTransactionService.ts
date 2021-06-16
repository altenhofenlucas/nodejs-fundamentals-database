// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
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
    const repository = getRepository(Transaction);

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
