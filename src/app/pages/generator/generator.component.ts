import { Component, OnInit, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryPickerComponent } from '../../components/category-picker/category-picker.component';
import { ImageResultComponent } from '../../components/image-result/image-result.component';
import { GenerationFiltersComponent, GenerationFilters } from '../../components/generation-filters/generation-filters.component';
import { GeneratorService } from '../../services/generator.service';
import { CategoryService } from '../../services/category.service';
import { SearchHistoryService } from '../../services/search-history.service';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryPickerComponent, ImageResultComponent, GenerationFiltersComponent],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  generatorService = inject(GeneratorService);
  private categoryService = inject(CategoryService);
  searchHistoryService = inject(SearchHistoryService);

  @ViewChild(GenerationFiltersComponent) filtersComponent!: GenerationFiltersComponent;

  keyword = signal('');
  selectedCategory = signal<string | undefined>(undefined);
  linkCopied = signal(false);

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['keyword']) {
        this.keyword.set(params['keyword']);
        this.onGenerate();
      }
    });
  }

  onCategorySelected(categoryId: string | null) {
    this.selectedCategory.set(categoryId ?? undefined);
  }

  async onSurpriseMe() {
    const randomKeyword = await this.categoryService.getRandomKeywordFromAPI();
    this.keyword.set(randomKeyword);
    this.selectedCategory.set(undefined);
  }

  async onGenerate() {
    const kw = this.keyword().trim();
    if (!kw) return;

    const filters = this.filtersComponent?.getFilters() ?? { difficulty: 'medium' as const, ageRange: '5-8' as const };

    await this.generatorService.generate(kw, {
      category: this.selectedCategory(),
      difficulty: filters.difficulty,
      ageRange: filters.ageRange
    });

    if (this.generatorService.currentImage()) {
      this.searchHistoryService.addSearch(kw);
    }
  }

  async onGenerateAnother() {
    const kw = this.keyword().trim();
    if (!kw) return;

    const filters = this.filtersComponent?.getFilters() ?? { difficulty: 'medium' as const, ageRange: '5-8' as const };

    await this.generatorService.generate(kw, {
      category: this.selectedCategory(),
      forceNew: true,
      difficulty: filters.difficulty,
      ageRange: filters.ageRange
    });
  }

  onTryAnother() {
    this.generatorService.clearCurrent();
    this.generatorService.clearError();
    this.keyword.set('');
    this.selectedCategory.set(undefined);
  }

  onFiltersChanged(_filters: GenerationFilters) {
    // Filters are read from ViewChild at generation time
  }

  share(imageId: string) {
    const url = `${window.location.origin}/gallery/${imageId}`;
    if (navigator.share) {
      navigator.share({ title: 'Check out this coloring page on KidsColor!', url });
    } else {
      navigator.clipboard.writeText(url);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 3000);
    }
  }
}
