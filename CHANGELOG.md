# Changelog
All notable changes to the HalleyX Workflow Management System will be documented in this file.

## [1.0.9] - 2026-03-18
### Fixed
- Fixed routing error where `/home` was not matching any defined routes (added redirect to `/`).
- Fixed UI constraint in `StepBuilder.jsx` to allow deletion of the **END** (Completed) step.

## [1.0.8] - 2026-03-17
### Added
- Integrated **Email Notification System** using Spring Boot Mail.
- Created `EmailService` for asynchronous mail delivery.
- Added automated triggers for Submission, Approval, Rejection, and Completion events.

## [1.0.7] - 2026-03-17
### Changed
- Improved **Role Normalization** logic to bridge the gap between DB roles (EMPLOYEE) and Workflow roles (Developer).
- Enhanced `WorkflowManagementService` with self-healing capabilities for missing steps or mappings.

## [1.0.6] - 2026-03-16
### Added
- Implemented **Admin Step Builder** with dynamic node creation and logical rule configuration.
- Added **Workflow Library** for managing process blueprints.

## [1.0.5] - 2026-03-16
### Fixed
- Resolved `IN_PROGRESS` workflow stalling issues.
- Fixed RabbitMQ connection stability and event publishing.

## [1.0.4] - 2026-03-15
### Added
- Created **User Mapping** interface for assigning organizational roles to specific users.
- Implemented category-based filtering for workflows.

## [1.0.3] - 2026-03-15
### Changed
- Refactored frontend to use a centralized **Glassmorphic Design System**.
- Standardized `premium-table` and `glass-card` components across all dashboards.

## [1.0.2] - 2026-03-14
### Added
- Implemented **Student**, **Employee**, and **Admin** specialized dashboards.
- Added **Audit Logs** for tracking system-wide activity.

## [1.0.1] - 2026-03-13
### Added
- Initial **Workflow Engine** implementation with JPA persistence.
- Core Security framework with JWT Authentication.

## [1.0.0] - 2026-03-13
### Added
- Project initialization with Spring Boot (Backend) and React + Vite (Frontend).
