// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';

interface DeleteTransactionDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: DeleteTransactionDTO): Promise<void> {
    const repository = getRepository(Transaction);

    await repository.delete(id);
  }
}

export default DeleteTransactionService;
