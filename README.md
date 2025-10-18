# Mekelle University Course Material Distribution Platform

## Project Overview

The Mekelle University Course Material Distribution Platform is a web-based application designed to streamline the distribution of academic materials between administrators and students. This platform enables efficient sharing of course content in various formats (PDF, DOCX, PPTX) with a focus on accessibility and user experience for the Mekelle University community.

## Features

- **User Authentication**: Separate login systems for students and administrators.
- **User Profile Management**: Users can edit their profile information, including full name, department, and student ID.
- **Profile Picture Upload**: Users can upload and change their profile picture.
- **Material Management**: Admins can upload course materials with metadata.
- **Course Organization**: Structured by course codes and academic years.
- **Download Functionality**: Students can access and download relevant materials.
- **Responsive Design**: Works across desktop and mobile devices.
- **File Format Support**: Handles PDF, DOCX, PPTX files.

## Technologies Used

This project is built with:

- Vite
- TypeScript
- React
- Tailwind CSS
- shadcn-ui
- Supabase

## User Roles

- **Students**: Browse, search, and download course materials relevant to their programs.
- **Administrators**: Upload, organize, and manage course materials for different courses.

## Getting Started

To run this project locally:

```sh
# Step 1: Clone the repository
git clone <repository-url>

# Step 2: Navigate to the project directory
cd mekelle-study-hub

# Step 3: Install the necessary dependencies
npm install

# Step 4: Set up your Supabase environment variables in a .env file

# Step 5: Apply database migrations
supabase db reset

# Step 6: Start the development server
npm run dev
```

## Project Structure

- `src/` - Contains the main source code
- `public/` - Static assets and files
- `components/` - Reusable UI components
- `pages/` - Application pages for different user roles
- `utils/` - Utility functions
- `types/` - TypeScript type definitions
- `supabase/` - Supabase configuration and migrations

## Database Schema

The platform uses **Supabase** for its backend, which includes a PostgreSQL database. The key tables are:

### `profiles`
- `id`: UUID (Primary Key, Foreign Key to `auth.users.id`)
- `email`: TEXT
- `full_name`: TEXT
- `department`: TEXT
- `student_id`: TEXT
- `avatar_url`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### `materials`
- `id`: UUID (Primary Key)
- `title`: TEXT
- `description`: TEXT
- `department`: TEXT
- `course`: TEXT
- `file_type`: TEXT
- `file_path`: TEXT
- `file_size`: TEXT
- `uploaded_by`: TEXT
- `uploaded_by_user_id`: UUID (Foreign Key to `auth.users.id`)
- `created_at`: TIMESTAMPTZ

### `user_roles`
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to `auth.users.id`)
- `role`: `app_role` (ENUM: 'admin', 'moderator', 'user')
- `created_at`: TIMESTAMPTZ

## How to Contribute

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request with a detailed description

## License

This project is created for educational purposes at Mekelle University.
