export interface RawApprovalItem {
  id: number;
  name: string;
  date: string | Date;
  type: string;
}

export interface ApprovalGroup {
  title: string;
  items: RawApprovalItem[];
}