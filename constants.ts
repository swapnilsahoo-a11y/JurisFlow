
import { Case, CourtLevel, CaseStage } from './types';

export const MOCK_CASES: Case[] = [
  {
    id: '1',
    caseName: 'State of Maharashtra vs. Kulkarni',
    clientName: 'Rahul Kulkarni',
    caseNumber: 'SC-2024-88',
    effectiveCharges: 75000,
    stage: CaseStage.ARGUMENTS,
    courtLevel: CourtLevel.SUPREME,
    courtDate: '2024-05-12',
    nextDate: '2024-06-15',
    subjectMatter: 'Criminal Appeal against conviction in High Court.'
  },
  {
    id: '2',
    caseName: 'Global Tech vs. Union of India',
    clientName: 'Global Tech Inc',
    caseNumber: 'HC-TAX-101',
    effectiveCharges: 120000,
    stage: CaseStage.EVIDENCE,
    courtLevel: CourtLevel.HIGH,
    courtDate: '2024-05-20',
    nextDate: '2024-07-01',
    subjectMatter: 'Writ petition challenging GST assessment.'
  },
  {
    id: '3',
    caseName: 'Property Dispute: Plot 405',
    clientName: 'Sita Ram',
    caseNumber: 'LC-CIV-442',
    effectiveCharges: 15000,
    stage: CaseStage.FILING,
    courtLevel: CourtLevel.LOWER,
    courtDate: '2024-05-28',
    nextDate: '2024-06-10',
    subjectMatter: 'Partition suit for ancestral property.'
  }
];
