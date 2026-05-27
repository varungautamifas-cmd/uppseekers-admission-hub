export type TabKey =
  | "profile"
  | "documents"
  | "tasks"
  | "schedule"
  | "universities"
  | "messages";

export type Activity = {
  id: string;
  category: "Leadership" | "Community Service" | "Super-Curricular" | "Sports" | "Arts";
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
};

export type DocStatus = "Pending" | "Under Review" | "Verified" | "Rejected";
export type DocType = "Academic Transcript" | "Essay" | "Resume" | "Identity";

export type StudentDocument = {
  id: string;
  name: string;
  ext: "pdf" | "docx" | "jpg" | "png";
  type: DocType;
  status: DocStatus;
  modified: string;
};

export type TaskStatus = "todo" | "inprogress" | "completed";
export type TaskCategory = "Documentation" | "Test Prep" | "Research";

export type StudentTask = {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  dueDate: string; // ISO
  status: TaskStatus;
  syncedFromScheduleId?: string;
  requiresUpload?: boolean;
  uploadedFile?: string;
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
};

export type ChatMessage = {
  id: string;
  from: "student" | "counselor";
  text: string;
  at: string; // ISO
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