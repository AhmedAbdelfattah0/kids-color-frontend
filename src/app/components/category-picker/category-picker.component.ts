import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/image.model';

@Component({
  selector: 'app-category-picker',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-picker.component.html'
})
export class CategoryPickerComponent {
  private categoryService = inject(CategoryService);

  @Output() categorySelected = new EventEmitter<{ categoryId: string; keyword: string }>();

  categories = this.categoryService.categories;

  onCategoryClick(category: Category): void {
    const keyword = this.categoryService.getRandomKeyword(category.id);
    this.categorySelected.emit({
      categoryId: category.id,
      keyword
    });
  }
}
