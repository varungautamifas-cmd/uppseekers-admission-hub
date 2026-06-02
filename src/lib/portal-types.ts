export type TabKey =
  | "profile"
  | "documents"
  | "tasks"
  | "schedule"
  | "universities"
  | "messages";

export const DEFAULT_ACTIVITY_CATEGORIES = [
  "Individual",
  "Core Member",
  "Leadership/Captain",
  "Founder/Director",
] as const;
export type ActivityCategory = (typeof DEFAULT_ACTIVITY_CATEGORIES)[number];

export type Activity = {
  id: string;
  name: string;
  category: ActivityCategory;
  grades: string[];
  hoursPerWeek: number;
  weeksPerYear: number;
  description: string;
};

export type TeamEmails = {
  counselorEmail: string;
  mathMentorEmail: string;
  verbalMentorEmail: string;
  researchMentorEmail: string;
  categoryManagerEmail: string;
};

export type Profile = {
  fullName: string;
  school: string;
  grade: "Grade 9" | "Grade 10" | "Grade 11" | "Grade 12" | "Gap Year";
  grade9: string;
  grade10: string;
  expectedGrade: string;
  satAct: string;
  english: string;
  geographies: string[];
  majors: string;
  indianExams: string;
  budget: string;
  activities: Activity[];
  personalMeetingLink?: string;
  team?: TeamEmails;
};

export const DOC_STATUSES = ["Pending", "Under Review", "Verified", "Rejected"] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];
export const DOC_TYPES = [
  "Academic Transcript",
  "Essay",
  "Supplementary Essay",
  "Resume",
  "Identity",
  "Test Score Report",
  "Recommendation Letter",
  "Financial Document",
  "Visa",
  "Other",
] as const;
export type DocType = (typeof DOC_TYPES)[number];

export type StudentDocument = {
  id: string;
  name: string;
  ext: "pdf" | "docx" | "jpg" | "png";
  type: DocType;
  status: DocStatus;
  modified: string;
};

export type TaskStatus = "todo" | "inprogress" | "completed";
export const TASK_CATEGORIES = [
  "Documentation",
  "Test Prep",
  "Research",
  "Essay",
  "Application",
  "School",
  "Extra Curricular",
  "Other",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export type TaskNote = { id: string; text: string; at: string; fileName?: string };

export type StudentTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string; // ISO
  createdAt: string; // ISO
  createdBy?: string;
  status: TaskStatus;
  syncedFromScheduleId?: string;
  requiresUpload?: boolean;
  uploadedFile?: string;
  attachments?: string[];
  notes?: TaskNote[];
  progress?: number;
};

export type EventType = "Counselling" | "Test Prep" | "Profile Building" | "Research";

export type ScheduleEvent = {
  id: string;
  type: EventType;
  title: string;
  start: string; // ISO
  end: string; // ISO
  meetingLink?: string;
  agenda: string[];
  assignment?: {
    title: string;
    description: string;
    fileName?: string;
  };
  status: "Upcoming" | "Completed";
  notes?: TaskNote[];
  attachments?: string[];
  reminderMinutes?: number;
  rating?: number; // 1-5 post-event
  batchId?: string;
};

export type Batch = {
  id: string;
  name: string;
  type: EventType;
  weekdays: number[]; // 0=Sun..6=Sat
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  startDate: string; // ISO date
  endDate: string; // ISO date
  discussionPoints: string[]; // per-session points (cycled)
  meetingLink?: string;
};

export type Difficulty = "Reach" | "Target" | "Safety";

export const ESSAY_STATUSES = ["Not Started Yet", "Working", "1st Draft Ready", "Done"] as const;
export type EssayStatus = (typeof ESSAY_STATUSES)[number];
export const RESEARCH_PAPER_STATUSES = [
  "Not Writing",
  "Working",
  "1st Draft Ready",
  "Prepared and Reviewed",
  "Published",
] as const;
export type ResearchPaperStatus = (typeof RESEARCH_PAPER_STATUSES)[number];
export const LOR_STATUSES = ["Not Uploaded", "Uploaded"] as const;
export type LorStatus = (typeof LOR_STATUSES)[number];
export const TRANSCRIPT_GRADES = ["8th", "9th", "10th", "11th", "12th"] as const;

export type University = {
  id: string;
  name: string;
  location: string;
  major: string;
  difficulty: Difficulty;
  earlyDeadline: string;
  regularDeadline: string;
  coreVision: string;
  ecBiases: string;
  differentiators: string;
  progress?: number; // 0-100 (auto-derived)
  progressNotes?: string;
  essayStatus?: EssayStatus;
  suppEssayStatus?: EssayStatus;
  internshipsCount?: 0 | 1 | 2 | 3;
  researchPaperStatus?: ResearchPaperStatus;
  transcripts?: string[];
  lor1?: LorStatus;
  lor2?: LorStatus;
  lor3?: LorStatus;
};

export type ChatMessage = {
  id: string;
  contactId: string;
  from: "student" | "contact";
  text: string;
  at: string; // ISO
};

export type ContactRole = "Counselor" | "Mentor" | "Admin" | "Tutor";
export type Contact = {
  id: string;
  name: string;
  role: ContactRole;
  online: boolean;
  unread?: number;
};

export type Student = {
  name: string;
  avatar?: string;
  grade: string;
};

export type Counselor = {
  name: string;
  online: boolean;
};