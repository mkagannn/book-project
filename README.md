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
- `previouslyRead` — whether the book has been read/borrowed before
- `borrowedBy` — the ID of the member currently holding the book
  - `null` when the book is not currently borrowed
  - Set to the member's user ID once the book is checked out
- Current rental status can be derived directly from `borrowedBy` (borrowed if set, available if `null`)

### Author

Each author record includes:

- `name` — the author's name
- `birthYear` — the author's year of birth
- `books` — a list of the books written by this author (one-to-many relationship with Book)

## Planned Features

- [ ] Member registration and authentication
- [ ] Admin/librarian role with approval permissions
- [ ] Secure borrowing workflow: request → admin approval → loan recorded
- [ ] Return workflow to reset a book's borrowed status
- [ ] Book borrow-history tracking (`previouslyRead`)
- [ ] Full CRUD for Books and Authors (existing, being carried forward)

## Status

This README currently documents the **scope and design goals** of the expanded system. Implementation of the new membership and borrowing features has not started yet — a large part of the existing codebase will be revised as this work progresses.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
