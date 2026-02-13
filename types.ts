
export enum CourtLevel {
  LOWER = 'Lower Court',
  HIGH = 'High Court',
  SUPREME = 'Supreme Court'
}

export enum CaseStage {
  FILING = 'Filing',
  EVIDENCE = 'Evidence',
  ARGUMENTS = 'Arguments',
  JUDGMENT = 'Judgment'
}

export interface Case {
  id: string;
  caseName: string;
  clientName: string;
  caseNumber: string;
  effectiveCharges: number;
  stage: CaseStage;
  courtLevel: CourtLevel;
  courtDate: string;
  nextDate: string;
  subjectMatter?: string;
}

export interface VaultFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: string;
  data: string; // Base64 for mock storage
}

// Added 'analytics' to support the Billing/Analytics menu item in the sidebar
export type TabType = 'dashboard' | 'cases' | 'vault' | 'notes' | 'analytics' | 'settings';
