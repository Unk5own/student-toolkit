/* ==============================================================
   COURSE DATABASE — single source of truth
   --------------------------------------------------------------
   Every subject carries both its timetable info (credits, weekly
   contact hours) and its assessment breakdown, so adding a subject
   means editing one place instead of two files.

   Per subject:
     code, name, credits   as printed on your programme structure
     weeklyHours           timetabled contact hours per week (drives attendance)
     targetMarks           set false to hide from the Target Marks calculator
     assessment.final      weight of the final exam (0 = 100% coursework)
     assessment.components coursework items; weights are % of the FINAL grade

   assessment.final + sum(component weights) must equal 100.
============================================================== */
/* The grading scale, defined once and rendered everywhere it appears
   (both grading-scale tables, the GPA grade dropdowns, and the Target Marks
   targets). If the official TAR UMT scale differs from this, correct it HERE
   and every screen follows.

   NOTE: this reproduces the scale that was already hardcoded in the app.
   It jumps straight from C (50) to F, with no C-/D+/D bands — worth checking
   against your programme handbook before relying on it. */
const gradingScale = [
  { grade: 'A',  min: 80, max: 100, point: 4.00 },
  { grade: 'A-', min: 75, max: 79,  point: 3.67 },
  { grade: 'B+', min: 70, max: 74,  point: 3.33 },
  { grade: 'B',  min: 65, max: 69,  point: 3.00 },
  { grade: 'B-', min: 60, max: 64,  point: 2.67 },
  { grade: 'C+', min: 55, max: 59,  point: 2.33 },
  { grade: 'C',  min: 50, max: 54,  point: 2.00 },
  { grade: 'F',  min: 0,  max: 49,  point: 0.00 }
];

const myDatabase = {
  programmes: {
    RIS: {
      title: "BACHELOR IN INFORMATION TECHNOLOGY (HONOURS) (INFORMATION SECURITY)",
      curriculum: {
        Y2S3: [
          {
            code: "MPU-34E2", name: "GYM WORKOUT", credits: 2, weeklyHours: 2,
            targetMarks: false,
            assessment: { final: 0, components: [
              { id: "c1", name: "Continuous Assessment", weight: 100 }
            ]}
          },
          {
            code: "BMCS2003", name: "ARTIFICIAL INTELLIGENCE", credits: 3, weeklyHours: 4,
            assessment: { final: 30, components: [
              { id: "c1", name: "Test", weight: 28 },
              { id: "c2", name: "Assignment", weight: 42 }
            ]}
          },
          {
            code: "BMIT3173", name: "INTEGRATIVE PROGRAMMING", credits: 3, weeklyHours: 4,
            assessment: { final: 30, components: [
              { id: "c1", name: "Quiz", weight: 7 },
              { id: "c2", name: "Assignment", weight: 63 }
            ]}
          },
          {
            code: "BMIT2023", name: "WEB AND MOBILE SYSTEMS", credits: 3, weeklyHours: 4,
            assessment: { final: 30, components: [
              { id: "c1", name: "Test", weight: 14 },
              { id: "c2", name: "Assignment", weight: 56 }
            ]}
          },
          {
            code: "BMIT2083", name: "INFORMATION ASSURANCE AND SECURITY", credits: 3, weeklyHours: 3,
            assessment: { final: 50, components: [
              { id: "c1", name: "Assignment", weight: 25 },
              { id: "c2", name: "Written Test", weight: 20 },
              { id: "c3", name: "Quiz", weight: 5 }
            ]}
          },
          {
            code: "MPU-3133", name: "FALSAFAH DAN ISU SEMASA", credits: 3, weeklyHours: 1,
            assessment: { final: 0, components: [
              { id: "c1", name: "Tugasan Bertulis", weight: 30 },
              { id: "c2", name: "Pembentangan", weight: 30 },
              { id: "c3", name: "Ujian", weight: 40 }
            ]}
          }
        ]
      }
    },

    RFI: {
      title: "BACHELOR OF FINANCE AND INVESTMENT (HONOURS)",
      curriculum: {
        Y3S1: [
          {
            code: "MPU-34Q2", name: "PICKLEBALL", credits: 2, weeklyHours: 2,
            targetMarks: false,
            assessment: { final: 0, components: [
              { id: "c1", name: "Continuous Assessment", weight: 100 }
            ]}
          },
          {
            code: "BBMF3033", name: "FINANCIAL MARKETS & REGULATIONS", credits: 3, weeklyHours: 3.5,
            assessment: { final: 50, components: [
              { id: "c1", name: "Assignment", weight: 35 },
              { id: "c2", name: "Test", weight: 15 }
            ]}
          },
          {
            code: "BBMF3023", name: "CORPORATE TREASURY MANAGEMENT", credits: 3, weeklyHours: 3.5,
            assessment: { final: 50, components: [
              { id: "c1", name: "Assignment", weight: 20 },
              { id: "c2", name: "Individual Test", weight: 30 }
            ]}
          },
          {
            code: "BBMF3173", name: "BOND ANALYSIS", credits: 3, weeklyHours: 3.5,
            assessment: { final: 50, components: [
              { id: "c1", name: "Test", weight: 20 },
              { id: "c2", name: "Assignment", weight: 30 }
            ]}
          },
          {
            code: "BBBD3023", name: "CORPORATE GOVERNANCE & ETHICS", credits: 3, weeklyHours: 4,
            assessment: { final: 50, components: [
              { id: "c1", name: "Test", weight: 25 },
              { id: "c2", name: "Group Assignment", weight: 25 }
            ]}
          },
          {
            code: "BBMF3304", name: "EQUITY ANALYSIS", credits: 4, weeklyHours: 4,
            assessment: { final: 50, components: [
              { id: "c1", name: "Individual Test", weight: 20 },
              { id: "c2", name: "Assignment", weight: 30 }
            ]}
          },
          {
            code: "MPU-3202", name: "SERVICE LEARNING", credits: 2, weeklyHours: 1,
            assessment: { final: 0, components: [
              { id: "c1", name: "Proposal Writing", weight: 30 },
              { id: "c2", name: "Project Presentation", weight: 40 },
              { id: "c3", name: "Reflective Essay", weight: 30 }
            ]}
          }
        ]
      }
    }
  }
};
