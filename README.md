# Public Library Management System

A RESTful API for a public library system, built with **Node.js**, **Express**, and **MongoDB**. The project began as a simple Author–Book CRUD API and is being expanded into a full public library platform that supports book borrowing (rental) alongside standard catalog management.

## Overview

This library is open to the public, but interacting with its resources — most importantly, borrowing books — requires membership. The system is being designed around two core entities, **Book** and **Author**, along with a secure, admin-mediated borrowing workflow.

## Core Concepts

### Membership

- Only registered **members** of the library can borrow books or make use of the library's resources.
- Membership is mandatory: no borrowing action can be performed by a non-member.

### Admin-Approved Borrowing

- Every book rental must be handed off by a **librarian (admin)**.
- A member cannot borrow a book without explicit admin approval — the admin is the one who actually processes and confirms the loan.
- This ensures borrowing happens through a controlled, verified process rather than being a fully self-service action.

### Book

Each book record includes:

- `title` — the title of the book
- `author` — reference to the book's author
- `borrowedBy` — the ID of the member currently holding the book
  - `null` when the book is not currently borrowed
  - Set to the member's user ID once the book is checked out
- Current rental status can be derived directly from `borrowedBy` (borrowed if set, available if `null`)

### Author

Each author record includes:

- `name` — the author's name
- `birthYear` — the author's year of birth
- `books` — a list of the books written by this author (one-to-many relationship with Book)

### Loan (Borrowing Record)

Borrow history and the full lifecycle of a rental are tracked in a separate relational entity connecting **Users** and **Books**, rather than being stored directly on the Book itself:

- `userId` — reference to the member who requested/holds the loan
- `bookId` — reference to the borrowed book
- `status` — one of:
  - `Requested` — the member has requested the book
  - `Approved` — the admin has approved the request
  - `Retrieved` — the member has physically picked up the book
- `createdAt` — timestamp of when the loan request was created
- `requestedStartDate` — the intended start date of the rental period
- `endDate` — the intended end date of the rental period

This separation allows a request to be created ahead of time, independent of when the rental period actually begins — for example, a request made today for a 10-day rental period starting September 1st and ending September 10th.

## Planned Features

- [ ] Member registration and authentication
- [ ] Admin/librarian role with approval permissions
- [ ] Secure borrowing workflow: request → admin approval → retrieval, tracked via the Loan entity's `status` field
- [ ] Return workflow to reset a book's borrowed status
- [ ] Loan/borrow-history tracking via the User–Book relational table
- [ ] Full CRUD for Books and Authors (existing, being carried forward)

## Status

This README currently documents the **scope and design goals** of the expanded system. Implementation of the new membership and borrowing features has not started yet — a large part of the existing codebase will be revised as this work progresses.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
