# HalleyX - Workflow Management System

## 🎥 Demo Video

[Click to watch demo](https://drive.google.com/file/d/1pU-O89w0DT1OPPIguBDvGCDTSeyTPhiD/view?usp=drivesdk)

**HalleyX** is a high-performance, role-based workflow automation engine designed to orchestrate complex organizational processes. It features a stunning glassmorphic interface and a robust Spring Boot backend to handle dynamic task routing, approvals, and real-time notifications.

## 🚀 Overview
HalleyX allows administrators to design multi-stage process blueprints (Workflows) and map them to organizational stakeholders. Users can then execute these workflows to submit requests (e.g., Leave, Expense, or Task approvals) that flow through the system based on predefined logical rules.

## ✨ Key Features
- **Dynamic Step Builder**: Create multi-stage workflows with TASK, APPROVAL, and END nodes.
- **Role-Based Dashboards**: Tailored interfaces for Students, Employees, Managers, Finance, and Administrators.
- **Intelligent Routing**: Automated task assignment based on user-to-role mappings and category-specific logic.
- **Email Notifications**: Real-time asynchronous alerts for workflow milestones.
- **Glassmorphic UI**: A premium, modern interface built with React, Vite, and Lucide React icons.
- **Audit Logs**: Comprehensive tracking of all system activity and data changes.
- **Self-Healing Engine**: Backend logic that automatically handles edge cases and role-matching normalization.

## 🛠️ Tech Stack
- **Backend**: Java 17, Spring Boot, Spring Data JPA, H2/PostgreSQL, Spring Mail, RabbitMQ.
- **Frontend**: React 18, Vite, Vanilla CSS (Glassmorphism), Lucide React.
- **Testing**: JUnit 5, Mockito, Selenium WebDriver.

## 📦 Project Structure
```text
halleyx/
├── backend/            # Spring Boot Application
│   ├── src/main/java/  # Logic & Entities
│   └── src/test/java/  # Test Suite
├── frontend/           # Vite + React Frontend
│   ├── src/pages/      # Role-based dashboards & Auth
│   └── src/components/ # Shared UI components
└── documentation/      # Task tracking & Implementation plans
```

## ⚙️ Setup & Installation
1.  **Backend**:
    - Configure `application.properties` with your DB and SMTP settings.
    - Run `./mvnw spring-boot:run` from the `backend/` directory.
2.  **Frontend**:
    - Run `npm install` followed by `npm run dev` from the `frontend/` directory.
    - Access the portal at `http://localhost:5173`.

## 📜 License
HalleyX is proprietary software developed for advanced automation and organizational orchestration.

---
*Orchestrate your world with HalleyX.*
