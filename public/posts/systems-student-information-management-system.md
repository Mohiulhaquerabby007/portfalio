
Managing academic records, student enrollments, attendance, and grading across faculties requires a structured, dependable application. The **Student Information Management System (SIMS)** was designed to address these requirements cleanly.

## System Architecture

SIMS follows a layered Model-View-Controller (MVC) pattern:
- **Presentation Layer**: Intuitive user interface for students, faculty, and administrative staff.
- **Service Layer**: Business logic handling enrollment prerequisites, GPA computations, and attendance thresholds.
- **Data Access Layer**: Prepared SQL queries and transactional integrity mechanisms preventing data anomalies.

## Key Features
- **Student Profile Management**: Centralized records with personal info, enrolled degree, and semester tracking.
- **Course Registration**: Verification of course credit caps and prerequisite satisfaction.
- **Grade & Transcript Generation**: Automated calculation of CGPA based on standardized university grading scales.
- **Role-Based Access**: Distinct permission boundaries for department admins and students.

Building SIMS provided deep practical experience in relational database normalization, exception handling, and robust object-oriented software engineering.
