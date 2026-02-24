import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CategoryPickerComponent } from '../../components/category-picker/category-picker.component';
import { ImageResultComponent } from '../../components/image-result/image-result.component';
import { GeneratorService } from '../../services/generator.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-generator',
  standalone: true,
  imports: [CommonModule, FormsModule, CategoryPickerComponent, ImageResultComponent],
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.scss']
})
export class GeneratorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  generatorService = inject(GeneratorService);
  private categoryService = inject(CategoryService);

  keyword = signal('');
  selectedCategory = signal<string | undefined>(undefined);
  linkCopied = signal(false);

  async ngOnInit() {
    // Check for keyword in query params
    this.route.queryParams.subscribe(params => {
      if (params['keyword']) {
        this.keyword.set(params['keyword']);
        this.onGenerate();
      }
    });
  }

  onCategorySelected(event: { categoryId: string; keyword: string }) {
    this.keyword.set(event.keyword);
    this.selectedCategory.set(event.categoryId);
  }

  async onSurpriseMe() {
    const randomKeyword = await this.categoryService.getRandomKeywordFromAPI();
    this.keyword.set(randomKeyword);
    this.selectedCategory.set(undefined);
  }

  async onGenerate() {
    const kw = this.keyword().trim();
    if (!kw) return;

    await this.generatorService.generate(kw, this.selectedCategory(), false);
  }

  async onGenerateAnother() {
    const kw = this.keyword().trim();
    if (!kw) return;

    // Force new generation with same keyword
    await this.generatorService.generate(kw, this.selectedCategory(), true);
  }

  onTryAnother() {
    this.generatorService.clearCurrent();
    this.generatorService.clearError();
    this.keyword.set('');
    this.selectedCategory.set(undefined);
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
