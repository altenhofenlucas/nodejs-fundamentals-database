import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface CreateCategoryDTO {
  title: string;
}

class CreateCategoryService {
  public async execute({ title }: CreateCategoryDTO): Promise<Category> {
    const repository = getRepository(Category);

    const category = await repository
      .createQueryBuilder()
      .where('LOWER(title) LIKE :title', { title: title.toLowerCase() })
      .getOne();
    if (category) {
      return category;
    }

    const newCategory = repository.create({
      title,
    });

    await repository.save(newCategory);

    return newCategory;
  }
}

export default CreateCategoryService;
