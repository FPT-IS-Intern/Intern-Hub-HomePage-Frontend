import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sizeParser',
  standalone: true
})
export class SizeParserPipe implements PipeTransform {
  transform(value: string | number | undefined | null): string {
    if (!value && value !== 0) return '100%';
    
    if (typeof value === 'number') {
      return `${value}px`;
    }
    
    return value;
  }
}