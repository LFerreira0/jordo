import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ChecklistItem {
  text: string;
  doneToday: boolean;
  lastCheckedDate: string | null; // YYYY-MM-DD
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
  private midnightTimer: any;

  ngOnInit() {
    this.load();
    this.checkDayChange();
    this.scheduleMidnightCheck();
  }

  ngOnDestroy() {
    clearTimeout(this.midnightTimer);
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

    if (item.lastCheckedDate === yesterday) {
      item.streak += 1;
    } else {
      item.streak = 1;
    }

    item.doneToday = true;
    item.lastCheckedDate = today;

    this.save();
  }

  /* ================================
     DAY CHANGE HANDLING
  ================================ */

  checkDayChange() {
    const today = this.today();
    const lastOpen = localStorage.getItem(LAST_OPEN_KEY);

    if (lastOpen !== today) {
      this.items.forEach(item => {
        item.doneToday = false;
      });

      localStorage.setItem(LAST_OPEN_KEY, today);
      this.save();
    }
  }

  scheduleMidnightCheck() {
    const now = new Date();
    const nextMidnight = new Date();
    nextMidnight.setHours(24, 0, 0, 0);

    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    this.midnightTimer = setTimeout(() => {
      this.checkDayChange();
      this.scheduleMidnightCheck();
    }, msUntilMidnight);
  }

  /* ================================
     STORAGE
  ================================ */

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
  }

  load() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      this.items = JSON.parse(data);
    }
  }

  /* ================================
     DATE HELPERS
  ================================ */

  today(): string {
    return new Date().toISOString().split('T')[0];
  }

  yesterday(): string {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
}
