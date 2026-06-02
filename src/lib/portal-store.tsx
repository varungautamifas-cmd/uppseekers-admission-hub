import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type {
  Batch,
  ChatMessage,
  Contact,
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
  updateDocument: (id: string, patch: Partial<StudentDocument>) => void;
  removeDocument: (id: string) => void;
  tasks: StudentTask[];
  addTask: (t: StudentTask) => void;
  updateTask: (id: string, patch: Partial<StudentTask>) => void;
  deleteTask: (id: string) => void;
  setTaskStatus: (id: string, status: StudentTask["status"]) => void;
  uploadTaskFile: (id: string, fileName: string) => void;
  events: ScheduleEvent[];
  addEvent: (e: ScheduleEvent) => void;
  updateEvent: (id: string, patch: Partial<ScheduleEvent>) => void;
  uploadEventAssignment: (id: string, fileName: string) => void;
  batches: Batch[];
  createBatch: (b: Batch) => void;
  updateBatch: (id: string, patch: Partial<Batch>) => void;
  universities: University[];
  addUniversity: (u: University) => void;
  updateUniversity: (id: string, patch: Partial<University>) => void;
  contacts: Contact[];
  messages: ChatMessage[];
  sendMessage: (contactId: string, text: string) => void;
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
    personalMeetingLink: "https://meet.google.com/aarav-personal",
    team: {
      counselorEmail: "priya.menon@uppseekers.com",
      mathMentorEmail: "",
      verbalMentorEmail: "",
      researchMentorEmail: "",
      categoryManagerEmail: "",
    },
    activities: [
      {
        id: "a1",
        name: "President, Coding Club",
        category: "Leadership/Captain",
        grades: ["10", "11"],
        hoursPerWeek: 4,
        weeksPerYear: 40,
        description: "Led a 60-member club; organized 3 inter-school hackathons.",
      },
      {
        id: "a2",
        name: "Volunteer Tutor, Teach For Change",
        category: "Core Member",
        grades: ["9", "10", "11"],
        hoursPerWeek: 3,
        weeksPerYear: 36,
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
      createdAt: "2026-05-20",
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
      createdAt: "2026-05-22",
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
      createdAt: "2026-05-15",
      status: "todo",
    },
    {
      id: "t4",
      title: "Upload Predicted Grade Sheet",
      description: "Get signed copy from school office.",
      category: "Documentation",
      dueDate: "2026-05-15",
      createdAt: "2026-04-30",
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

  const [universities, setUniversities] = useState<University[]>([
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
      progress: 35,
      progressNotes: "Essay draft 2 in review. Need 2 more recommendation letters.",
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
      progress: 55,
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
      progress: 70,
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
      progress: 20,
    },
  ]);

  const [batches, setBatches] = useState<Batch[]>([]);

  const [contacts, setContacts] = useState<Contact[]>([
    { id: "c1", name: "Priya Menon", role: "Counselor", online: true, unread: 2 },
    { id: "c2", name: "Rohan Iyer", role: "Mentor", online: true, unread: 0 },
    { id: "c3", name: "Neha Kapoor", role: "Tutor", online: false, unread: 1 },
    { id: "c4", name: "Admissions Desk", role: "Admin", online: false, unread: 0 },
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "m1", contactId: "c1", from: "contact", text: "Hey Aarav — uploaded notes from yesterday's session.", at: "2026-05-26T10:14:00" },
    { id: "m2", contactId: "c1", from: "student", text: "Thanks! Will review tonight.", at: "2026-05-26T10:16:00" },
    { id: "m3", contactId: "c1", from: "contact", text: "Also — let's finalize your ED school by Friday.", at: "2026-05-27T09:02:00" },
    { id: "m4", contactId: "c1", from: "contact", text: "Quick reminder: SAT Math sync Friday 3pm.", at: "2026-05-27T09:03:00" },
    { id: "m5", contactId: "c2", from: "contact", text: "Got time this weekend for a mock interview?", at: "2026-05-25T14:00:00" },
    { id: "m6", contactId: "c3", from: "contact", text: "Here's the algebra packet for next session.", at: "2026-05-24T09:00:00" },
  ]);

  const teamContacts: Contact[] = useMemo(() => {
    const t = profile.team;
    if (!t) return [];
    const entries: { key: string; email: string; role: Contact["role"]; label: string }[] = [
      { key: "team-counselor", email: t.counselorEmail, role: "Counselor", label: "Counselor" },
      { key: "team-math", email: t.mathMentorEmail, role: "Mentor", label: "Math Mentor" },
      { key: "team-verbal", email: t.verbalMentorEmail, role: "Mentor", label: "Verbal Mentor" },
      { key: "team-research", email: t.researchMentorEmail, role: "Mentor", label: "Research Mentor" },
      { key: "team-cm", email: t.categoryManagerEmail, role: "Admin", label: "Category Manager" },
    ];
    return entries
      .filter((e) => e.email && e.email.trim())
      .map((e) => ({
        id: e.key,
        name: `${e.label} (${e.email})`,
        role: e.role,
        online: false,
        unread: 0,
      }));
  }, [profile.team]);

  const value: PortalState = useMemo(
    () => ({
      student: { name: "Aarav Sharma", grade: "Grade 11" },
      counselor: { name: "Priya Menon", online: true },
      profile,
      setProfile,
      documents,
      addDocument: (d) => setDocuments((xs) => [d, ...xs]),
      updateDocument: (id, patch) =>
        setDocuments((xs) => xs.map((d) => (d.id === id ? { ...d, ...patch } : d))),
      removeDocument: (id) => setDocuments((xs) => xs.filter((d) => d.id !== id)),
      tasks,
      addTask: (t) => setTasks((xs) => [t, ...xs]),
      updateTask: (id, patch) =>
        setTasks((xs) => xs.map((t) => (t.id === id ? { ...t, ...patch } : t))),
      deleteTask: (id) => setTasks((xs) => xs.filter((t) => t.id !== id)),
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
      addEvent: (e) => setEvents((es) => [...es, e]),
      updateEvent: (id, patch) =>
        setEvents((es) => es.map((e) => (e.id === id ? { ...e, ...patch } : e))),
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
      addUniversity: (u) => setUniversities((xs) => [...xs, u]),
      updateUniversity: (id, patch) =>
        setUniversities((xs) => xs.map((u) => (u.id === id ? { ...u, ...patch } : u))),
      batches,
      createBatch: (b) => {
        setBatches((xs) => [...xs, b]);
        // Generate ScheduleEvents from batch recurrence
        const generated: ScheduleEvent[] = [];
        const start = new Date(b.startDate);
        const end = new Date(b.endDate);
        const [sh, sm] = b.startTime.split(":").map(Number);
        const [eh, em] = b.endTime.split(":").map(Number);
        let i = 0;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (b.weekdays.includes(d.getDay())) {
            const s = new Date(d);
            s.setHours(sh, sm, 0, 0);
            const e2 = new Date(d);
            e2.setHours(eh, em, 0, 0);
            const point = b.discussionPoints[i % Math.max(b.discussionPoints.length, 1)] || "";
            generated.push({
              id: `${b.id}-${i}`,
              batchId: b.id,
              type: b.type,
              title: `${b.name}${point ? " — " + point : ""}`,
              start: s.toISOString(),
              end: e2.toISOString(),
              meetingLink: b.meetingLink,
              status: s.getTime() > Date.now() ? "Upcoming" : "Completed",
              agenda: point ? [point] : [],
            });
            i++;
          }
        }
        setEvents((es) => [...es, ...generated]);
      },
      updateBatch: (id, patch) =>
        setBatches((xs) => xs.map((b) => (b.id === id ? { ...b, ...patch } : b))),
      contacts,
      messages,
      sendMessage: (contactId, text) =>
        setMessages((ms) => [
          ...ms,
          { id: `m${Date.now()}`, contactId, from: "student", text, at: new Date().toISOString() },
        ]),
      unreadMessages: contacts.reduce((acc, c) => acc + (c.unread || 0), 0),
    }),
    [profile, documents, tasks, events, batches, universities, contacts, messages],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortal() {
  const v = useContext(Ctx);
  if (!v) throw new Error("usePortal must be used inside PortalProvider");
  return v;
}