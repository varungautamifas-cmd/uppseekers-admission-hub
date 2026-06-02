export type TabKey =
  | "profile"
  | "documents"
  | "tasks"
  | "schedule"
  | "universities"
  | "messages";

export const DEFAULT_ACTIVITY_CATEGORIES = [
  "Leadership",
  "Community Service",
  "Super-Curricular",
  "Sports",
  "Arts",
  "Competition/Honor",
] as const;

export type Activity = {
  id: string;
  category: string; // free-form; allows "Other" custom value
  title: string;
  timeline: string;
  description: string;
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
};

export const DOC_STATUSES = ["Pending", "Under Review", "Verified", "Rejected"] as const;
export type DocStatus = (typeof DOC_STATUSES)[number];
export const DOC_TYPES = [
  "Academic Transcript",
  "Essay",
  "Resume",
  "Identity",
  "Test Score Report",
  "Recommendation Letter",
  "Financial Document",
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
  "Other",
] as const;
export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export type TaskNote = { id: string; text: string; at: string };

export type StudentTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string; // ISO
  createdAt: string; // ISO
  status: TaskStatus;
  syncedFromScheduleId?: string;
  requiresUpload?: boolean;
  uploadedFile?: string;
  attachments?: string[];
  notes?: TaskNote[];
  progress?: number;
};

export type EventType = "Counselling" | "Test Prep" | "Profile Building";

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
  progress?: number; // 0-100
  progressNotes?: string;
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