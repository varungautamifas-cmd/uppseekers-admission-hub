import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  ChatMessage,
  Counselor,
  Profile,
  ScheduleEvent,
  Student,
  StudentDocument,
  StudentTask,
  University,
} from "./portal-types";

type PortalState = {
  student: Student;
  counselor: Counselor;
  profile: Profile;
  setProfile: (p: Profile) => void;
  documents: StudentDocument[];
  addDocument: (d: StudentDocument) => void;
  removeDocument: (id: string) => void;
  tasks: StudentTask[];
  setTaskStatus: (id: string, status: StudentTask["status"]) => void;
  uploadTaskFile: (id: string, fileName: string) => void;
  events: ScheduleEvent[];
  uploadEventAssignment: (id: string, fileName: string) => void;
  universities: University[];
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  unreadMessages: number;
};

const Ctx = createContext<PortalState | null>(null);

const TOP_COUNTRIES = [
  "USA", "UK", "Canada", "Singapore", "Australia", "India", "Germany", "Netherlands",
  "France", "Ireland", "New Zealand", "Switzerland", "Japan", "South Korea", "Hong Kong",
  "UAE", "Italy", "Spain", "Sweden", "Norway", "Denmark", "Finland", "Belgium", "Austria",
  "Portugal", "Czech Republic", "Poland", "China", "Taiwan", "Malaysia", "Thailand",
  "Indonesia", "Vietnam", "Philippines", "Mexico", "Brazil", "Argentina", "Chile",
  "Colombia", "Peru", "South Africa", "Egypt", "Israel", "Turkey", "Greece", "Hungary",
  "Romania", "Bulgaria", "Estonia", "Latvia",
];

export const COUNTRY_OPTIONS = TOP_COUNTRIES;

export function PortalProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile>({
    fullName: "Aarav Sharma",
    school: "Delhi Public School, R.K. Puram",
    grade: "Grade 11",
    grade9: "92",
    grade10: "94",
    expectedGrade: "93",
    satAct: "SAT 1480",
    english: "TOEFL 110",
    geographies: ["USA", "UK", "Canada"],
    majors: "Computer Science, Cognitive Science, Applied Math",
    indianExams: "Targeting JEE Mains as a backup. CUET for Ashoka & Plaksha.",
    budget: "Need partial scholarship (Budget: $20k-$30k/yr)",
    activities: [
      {
        id: "a1",
        category: "Leadership",
        title: "President, Coding Club",
        timeline: "Grade 10, 11 | 4 hrs/week",
        description: "Led a 60-member club; organized 3 inter-school hackathons.",
      },
      {
        id: "a2",
        category: "Community Service",
        title: "Volunteer Tutor, Teach For Change",
        timeline: "Grade 9–11 | 3 hrs/week",
        description: "Taught Math & English to underprivileged middle-schoolers.",
      },
    ],
  });

  const [documents, setDocuments] = useState<StudentDocument[]>([
    { id: "d1", name: "Grade_10_Transcript.pdf", ext: "pdf", type: "Academic Transcript", status: "Verified", modified: "2026-04-12" },
    { id: "d2", name: "Common_App_Essay_Draft2.docx", ext: "docx", type: "Essay", status: "Under Review", modified: "2026-05-18" },
    { id: "d3", name: "Resume_v3.pdf", ext: "pdf", type: "Resume", status: "Pending", modified: "2026-05-20" },
    { id: "d4", name: "Passport_Scan.jpg", ext: "jpg", type: "Identity", status: "Verified", modified: "2026-03-02" },
  ]);

  const [tasks, setTasks] = useState<StudentTask[]>([
    {
      id: "t1",
      title: "Finalize Common App Essay",
      description: "Incorporate counselor feedback on hook & ending.",
      category: "Documentation",
      dueDate: "2026-06-10",
      status: "inprogress",
      requiresUpload: true,
      progress: 60,
    },
    {
      id: "t2",
      title: "SAT Math — Problem Set 4",
      description: "Synced from Schedule",
      category: "Test Prep",
      dueDate: "2026-05-30",
      status: "todo",
      syncedFromScheduleId: "e1",
      requiresUpload: true,
    },
    {
      id: "t3",
      title: "Research 5 Reach Universities",
      description: "Shortlist programs aligned with CS + Cog Sci.",
      category: "Research",
      dueDate: "2026-06-20",
      status: "todo",
    },
    {
      id: "t4",
      title: "Upload Predicted Grade Sheet",
      description: "Get signed copy from school office.",
      category: "Documentation",
      dueDate: "2026-05-15",
      status: "completed",
      requiresUpload: true,
      uploadedFile: "Predicted_Grades.pdf",
    },
  ]);

  const [events, setEvents] = useState<ScheduleEvent[]>([
    {
      id: "e1",
      type: "Test Prep",
      title: "SAT Math — Algebra Deep Dive",
      start: "2026-05-29T15:00:00",
      end: "2026-05-29T16:30:00",
      meetingLink: "https://meet.google.com/abc-defg-hij",
      status: "Upcoming",
      agenda: [
        "Review Problem Set 3 errors",
        "Linear & quadratic systems",
        "Practice section under time pressure",
      ],
      assignment: {
        title: "Problem Set 4",
        description: "Complete 25 problems before class.",
      },
    },
    {
      id: "e2",
      type: "Counselling",
      title: "Application Strategy 1:1",
      start: "2026-06-02T11:00:00",
      end: "2026-06-02T12:00:00",
      meetingLink: "https://zoom.us/j/123456",
      status: "Upcoming",
      agenda: ["Finalize ED/EA list", "Essay calendar", "Recommender outreach"],
    },
    {
      id: "e3",
      type: "Profile Building",
      title: "Capstone Project Review",
      start: "2026-05-20T17:00:00",
      end: "2026-05-20T18:00:00",
      status: "Completed",
      agenda: ["Walkthrough of GitHub repo", "Next steps for publication"],
    },
  ]);

  const [universities] = useState<University[]>([
    {
      id: "u1",
      name: "Carnegie Mellon University",
      location: "Pittsburgh, USA",
      major: "Computer Science",
      difficulty: "Reach",
      earlyDeadline: "Nov 1, 2026",
      regularDeadline: "Jan 3, 2027",
      coreVision: "Rigor, depth, and computational excellence.",
      ecBiases: "Original technical projects, research, olympiad performance.",
      differentiators: "Your hackathon leadership + open-source ML repo aligns well.",
    },
    {
      id: "u2",
      name: "University of Toronto",
      location: "Toronto, Canada",
      major: "Computer Science",
      difficulty: "Target",
      earlyDeadline: "—",
      regularDeadline: "Jan 15, 2027",
      coreVision: "Academic excellence with global perspective.",
      ecBiases: "Strong academics + meaningful service.",
      differentiators: "Your Teach For Change service is a clear fit.",
    },
    {
      id: "u3",
      name: "Purdue University",
      location: "West Lafayette, USA",
      major: "Computer Science",
      difficulty: "Safety",
      earlyDeadline: "Nov 1, 2026",
      regularDeadline: "Jan 15, 2027",
      coreVision: "Progress and Service.",
      ecBiases: "Builders, tinkerers, engineering doers.",
      differentiators: "Your capstone project demonstrates exactly this ethos.",
    },
    {
      id: "u4",
      name: "University of British Columbia",
      location: "Vancouver, Canada",
      major: "Cognitive Systems",
      difficulty: "Target",
      earlyDeadline: "—",
      regularDeadline: "Dec 1, 2026",
      coreVision: "Interdisciplinary thinkers across CS + psychology.",
      ecBiases: "Cross-domain projects, research curiosity.",
      differentiators: "Your Cog Sci interest + tutoring shows breadth.",
    },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", from: "counselor", text: "Hey Aarav — uploaded notes from yesterday's session. Take a look!", at: "2026-05-26T10:14:00" },
    { id: "m2", from: "student", text: "Thanks! Will review tonight.", at: "2026-05-26T10:16:00" },
    { id: "m3", from: "counselor", text: "Also — let's finalize your ED school by Friday.", at: "2026-05-27T09:02:00" },
    { id: "m4", from: "counselor", text: "Quick reminder: SAT Math sync Friday 3pm.", at: "2026-05-27T09:03:00" },
  ]);

  const value: PortalState = useMemo(
    () => ({
      student: { name: "Aarav Sharma", grade: "Grade 11" },
      counselor: { name: "Priya Menon", online: true },
      profile,
      setProfile,
      documents,
      addDocument: (d) => setDocuments((xs) => [d, ...xs]),
      removeDocument: (id) => setDocuments((xs) => xs.filter((d) => d.id !== id)),
      tasks,
      setTaskStatus: (id, status) =>
        setTasks((xs) => xs.map((t) => (t.id === id ? { ...t, status } : t))),
      uploadTaskFile: (id, fileName) => {
        setTasks((xs) =>
          xs.map((t) =>
            t.id === id ? { ...t, status: "completed", uploadedFile: fileName, progress: 100 } : t,
          ),
        );
        // Sync back to schedule event
        const task = tasks.find((t) => t.id === id);
        if (task?.syncedFromScheduleId) {
          setEvents((es) =>
            es.map((e) =>
              e.id === task.syncedFromScheduleId && e.assignment
                ? { ...e, assignment: { ...e.assignment, fileName } }
                : e,
            ),
          );
        }
      },
      events,
      uploadEventAssignment: (id, fileName) => {
        setEvents((es) =>
          es.map((e) =>
            e.id === id && e.assignment ? { ...e, assignment: { ...e.assignment, fileName } } : e,
          ),
        );
        setTasks((xs) =>
          xs.map((t) =>
            t.syncedFromScheduleId === id
              ? { ...t, status: "completed", uploadedFile: fileName, progress: 100 }
              : t,
          ),
        );
      },
      universities,
      messages,
      sendMessage: (text) =>
        setMessages((ms) => [
          ...ms,
          { id: `m${Date.now()}`, from: "student", text, at: new Date().toISOString() },
        ]),
      unreadMessages: 2,
    }),
    [profile, documents, tasks, events, universities, messages],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortal() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePortal must be used inside PortalProvider");
  return v;
}