import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface DeleteTransactionDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: DeleteTransactionDTO): Promise<void> {
    const repository = getCustomRepository(TransactionsRepository);

    const transaction = await repository.findOne(id);
    if (!transaction) {
      throw new AppError('Invalid transaction id', 400);
    }

    const { total } = await repository.getBalance();
    if (transaction.type === 'income' && total < transaction.value) {
      throw new AppError(
        "You don't have enough balance to remove this transaction",
        400,
      );
    }

    await repository.delete(id);
  }
}

export default DeleteTransactionService;
