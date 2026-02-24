import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface GenerationFilters {
  difficulty: 'simple' | 'medium' | 'detailed';
  ageRange: '2-4' | '5-8' | '9-12';
}

@Component({
  selector: 'app-generation-filters',
  templateUrl: './generation-filters.component.html',
  styleUrls: ['./generation-filters.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class GenerationFiltersComponent {
  @Output() filtersChanged = new EventEmitter<GenerationFilters>();

  difficulty = signal<'simple' | 'medium' | 'detailed'>('medium');
  ageRange = signal<'2-4' | '5-8' | '9-12'>('5-8');

  difficultyOptions: Array<{ value: 'simple' | 'medium' | 'detailed'; label: string; emoji: string; description: string }> = [
    { value: 'simple', label: 'Simple', emoji: '😊', description: 'Thick lines, big shapes' },
    { value: 'medium', label: 'Medium', emoji: '🙂', description: 'Balanced detail' },
    { value: 'detailed', label: 'Detailed', emoji: '🤩', description: 'Intricate patterns' }
  ];

  ageOptions: Array<{ value: '2-4' | '5-8' | '9-12'; label: string; emoji: string }> = [
    { value: '2-4', label: '2–4 yrs', emoji: '🍼' },
    { value: '5-8', label: '5–8 yrs', emoji: '🎒' },
    { value: '9-12', label: '9–12 yrs', emoji: '📚' }
  ];

  setDifficulty(value: 'simple' | 'medium' | 'detailed') {
    this.difficulty.set(value);
    this.emit();
  }

  setAgeRange(value: '2-4' | '5-8' | '9-12') {
    this.ageRange.set(value);
    this.emit();
  }

  private emit() {
    this.filtersChanged.emit({
      difficulty: this.difficulty(),
      ageRange: this.ageRange()
    });
  }

  getFilters(): GenerationFilters {
    return { difficulty: this.difficulty(), ageRange: this.ageRange() };
  }
}
