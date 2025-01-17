## Candidate Referral Management System (Backend)

This is the backend part of the Candidate Referral Management System. It handles API requests for managing candidate data, including adding new candidates, updating candidate statuses, deleting candidates, and fetching candidate details.

## Features

1.Add candidates with details such as name, email, phone number, job title, and resume.
2.Update the status of candidates (Pending, Reviewed, Hired).
3.Delete candidates from the system.
4.Fetch all candidate details.

## Tech Stack
1.Backend Framework: Node.js with Express
2.Database: MongoDB
3.File Storage: Local file system for storing resumes
4.API Requests: RESTful API
5.File Upload: Multer for handling resume uploads
6.Environment Variables: dotenv for managing configuration

## Make sure to create a .env file and define the following variables:

PORT=5000
MONGO_URI=Your mongodb string