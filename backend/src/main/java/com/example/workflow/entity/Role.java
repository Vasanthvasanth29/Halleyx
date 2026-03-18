package com.example.workflow.entity;

public enum Role {
    ADMIN,
    USER,
    // Student Workflow Roles
    STUDENT,
    ADVISOR,
    HOD,
    PRINCIPAL,
    // Expense & Employee Workflow Roles
    EMPLOYEE,
    MANAGER,
    FINANCE,
    CEO,
    // Other Roles
    PRODUCTION,
    SENIOR_DEVELOPER,
    DEVELOPER, // Added back to prevent DB deserialization crash on legacy users
    HR,
    REPORTING_MANAGER
}
