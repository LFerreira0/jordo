import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChecklistItem {
  text: string;
  doneToday: boolean;
  lastCheckedDate: string | null;
  streak: number;
}

const STORAGE_KEY = 'jordo-home-checklist';
const LAST_OPEN_KEY = 'jordo-last-open-date';

@Component({
  selector: 'app-home-checklist',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home-checklist.html',
  styleUrls: ['./home-checklist.scss'],
})
export class HomeChecklistComponent implements OnInit {
  newItem = '';
  items: ChecklistItem[] = [];

  maxVisibleItems = 5;
  expanded = false;

  ngOnInit() {
    this.load();
    this.checkDayChange();
  }

  /* ================================
     DERIVED STATE
  ================================ */

  get visibleItems() {
    return this.expanded
      ? this.items
      : this.items.slice(0, this.maxVisibleItems);
  }

  get doneCount() {
    return this.items.filter(i => i.doneToday).length;
  }

  get totalCount() {
    return this.items.length;
  }

  get allDoneToday() {
    return this.totalCount > 0 && this.doneCount === this.totalCount;
  }

  /* ================================
     ADD / REMOVE
  ================================ */

  addItem() {
    const value = this.newItem.trim();
    if (!value) return;

    this.items.push({
      text: value,
      doneToday: false,
      lastCheckedDate: null,
      streak: 0,
    });

    this.newItem = '';
    this.save();
  }

  removeItem(index: number) {
    this.items.splice(index, 1);
    this.save();
  }

  /* ================================
     CHECK + STREAK
  ================================ */

  toggle(item: ChecklistItem) {
    if (item.doneToday) return;

    const today = this.today();
    const yesterday = this.yesterday();

    item.streak =
      item.lastCheckedDate === yesterday ? item.streak + 1 : 1;

    item.doneToday = true;
    item.lastCheckedDate = today;

    if (this.allDoneToday) {
      this.expanded = false; // auto-collapse
    }

    this.save();
  }

  /* ================================
     EXPAND
  ================================ */

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  /* ================================
     DAY CHANGE
  ================================ */

  checkDayChange() {
    const today = this.today();
    const lastOpen = localStorage.getItem(LAST_OPEN_KEY);

    if (lastOpen !== today) {
      this.items.forEach(i => (i.doneToday = false));
      localStorage.setItem(LAST_OPEN_KEY, today);
      this.save();
    }
  }

  /* ================================
     STORAGE
  ================================ */

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) this.items = JSON.parse(data);
  }

  /* ================================
     DATE HELPERS
  ================================ */

today(): string {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

yesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);

  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
}
}
