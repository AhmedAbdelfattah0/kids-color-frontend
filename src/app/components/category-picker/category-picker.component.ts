import { Component, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../../services/category.service';
import { Category } from '../../models/image.model';

@Component({
  selector: 'app-category-picker',
  templateUrl: './category-picker.component.html',
  styleUrls: ['./category-picker.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CategoryPickerComponent implements OnInit {
  @Output() categorySelected = new EventEmitter<string | null>();

  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  selectedCategory = signal<string | null>(null);

  async ngOnInit() {
    const data = await this.categoryService.getCategories();
    this.categories.set(data);
  }

  selectCategory(id: string | null) {
    this.selectedCategory.set(id);
    this.categorySelected.emit(id);
  }
}
