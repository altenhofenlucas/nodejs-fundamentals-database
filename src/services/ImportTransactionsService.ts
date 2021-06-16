import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface TransactionsToSaveDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface SaveTransactionsDTO {
  transactions: TransactionsToSaveDTO[];
  categories: Category[];
}

async function _saveCategories(categories: string[]): Promise<Category[]> {
  const categoriesRepository = getRepository(Category);

  const existentCategories = await categoriesRepository.find({
    where: {
      title: In(categories),
    },
  });

  const existentCategoriesTitles = existentCategories.map(
    category => category.title,
  );

  const newCategoriesTitles = categories
    .filter(category => !existentCategoriesTitles.includes(category))
    .filter((value, index, self) => self.indexOf(value) === index);

  const newCategories = categoriesRepository.create(
    newCategoriesTitles.map(title => ({ title })),
  );

  await categoriesRepository.save(newCategories);

  return [...newCategories, ...existentCategories];
}

async function _saveTransactions({
  transactions,
  categories,
}: SaveTransactionsDTO): Promise<Transaction[]> {
  const transactionsRepository = getRepository(Transaction);

  const createdTransactions = transactionsRepository.create(
    transactions.map(transaction => ({
      title: transaction.title,
      type: transaction.type,
      value: transaction.value,
      category: categories.find(
        category => category.title === transaction.category,
      ),
    })),
  );

  await transactionsRepository.save(createdTransactions);

  return createdTransactions;
}

class ImportTransactionsService {
  async execute(filePath: string): Promise<Transaction[]> {
    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactionsToSave: TransactionsToSaveDTO[] = [];
    const categoriesToSave: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value || !category) return;

      transactionsToSave.push({ title, type, value, category });
      categoriesToSave.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categories = await _saveCategories(categoriesToSave);

    const transactions = await _saveTransactions({
      transactions: transactionsToSave,
      categories,
    });

    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
