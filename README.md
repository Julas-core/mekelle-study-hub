# Mekelle University Course Material Distribution Platform

## Project Overview

The Mekelle University Course Material Distribution Platform is a web-based application designed to streamline the distribution of academic materials between administrators and students. This platform enables efficient sharing of course content in various formats (PDF, DOCX, PPTX) with a focus on accessibility and user experience for the Mekelle University community.

## Features

- **User Authentication**: Separate login systems for students and administrators
- **Material Management**: Admins can upload course materials with metadata
- **Course Organization**: Structured by course codes and academic years
- **Download Functionality**: Students can access and download relevant materials
- **Responsive Design**: Works across desktop and mobile devices
- **File Format Support**: Handles PDF, DOCX, PPTX files

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui

## User Roles

- **Students**: Browse, search, and download course materials relevant to their programs
- **Administrators**: Upload, organize, and manage course materials for different courses

## Getting Started

To run this project locally:

```sh
# Step 1: Clone the repository
git clone <repository-url>

# Step 2: Navigate to the project directory
cd mekelle-study-hub

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## Project Structure

- `src/` - Contains the main source code
- `public/` - Static assets and files
- `components/` - Reusable UI components
- `pages/` - Application pages for different user roles
- `utils/` - Utility functions
- `types/` - TypeScript type definitions

## Database Schema

The platform uses a JSON-based storage system with the following conceptual schema:

### Users Collection
- `id`: Unique User ID
- `username`: Used for Login
- `passwordHash`: Hashed Password
- `role`: 'Student' or 'Admin'
- `fullName`: User's full name
- `department`: Student/Admin's department
- `yearOfStudy`: Student's current academic year

### Materials Collection
- `materialId`: Unique Material ID
- `courseCode`: e.g., 'CSEN301'
- `title`: e.g., 'Chapter 1 Notes'
- `fileType`: PDF, DOCX, PPTX
- `filePath`: URL or local path to the file
- `uploadDate`: Tracking date of upload

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a detailed description

## License

This project is created for educational purposes at Mekelle University.
