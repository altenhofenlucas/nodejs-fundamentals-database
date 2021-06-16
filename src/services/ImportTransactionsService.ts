import csvParse from 'csv-parse';
import fs from 'fs';
import { getRepository, In } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

interface CSVTransactionDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

interface SaveTransactionsDTO {
  transactions: CSVTransactionDTO[];
  categories: Category[];
}

async function saveCategories(categories: string[]): Promise<Category[]> {
  const categoriesRepository = getRepository(Category);

  const existentCategories = await categoriesRepository.find({
    where: {
      title: In(categories),
    },
  });

  const categoriesTitles = existentCategories.map(category => category.title);

  const addCategoriesTitles = categories
    .filter(category => !categoriesTitles.includes(category))
    .filter((value, index, self) => self.indexOf(value) === index);

  const newCategories = categoriesRepository.create(
    addCategoriesTitles.map(title => ({ title })),
  );

  await categoriesRepository.save(newCategories);

  return [...newCategories, ...existentCategories];
}

async function saveTransactions({
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

    const transactions: CSVTransactionDTO[] = [];
    const categoriesToSave: string[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line;

      if (!title || !type || !value || !category) return;

      transactions.push({ title, type, value, category });
      categoriesToSave.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const categories = await saveCategories(categoriesToSave);
    const createdTransactions = await saveTransactions({
      transactions,
      categories,
    });

    await fs.promises.unlink(filePath);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
