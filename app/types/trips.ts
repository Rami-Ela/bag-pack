export interface Category {
  id: string;
  name: string;
  color: string | null;
}

export interface Item {
  id: string;
  name: string;
  quantity: number;
  packed: boolean;
  broughtBack: boolean;
  category?: { id: string; name: string } | null;
}

export interface TemplateItem {
  id?: string;
  name: string;
  categoryId: string | null;
  quantity: number;
  perDay: boolean;
}

export interface Template {
  id: string;
  name: string;
  emoji: string;
  items: TemplateItem[];
}

export interface Trip {
  id: string;
  name: string;
  destination: string | null;
  startDate: string | null;
  endDate: string | null;
  items: Item[];
}
