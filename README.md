## 📦 Setup

1. Install [Node LTS](https://nodejs.org/en/download/)
2. Clone this repository
3. Change directory to the root of the repository
4. In your CLI, run `npm install -g nodemon`
5. `cd frontend` then run `npm install`
6. Go back to root, then `cd backend` and then run `npm install`

### Environment Variables

**PLEASE READ:** Create a `.env` file in the root of the project folder like [`.env.example`](/.env.example).

Fill in these values from the .env file from our Discord or just copy/paste into the folder.

### Database

We're gonna use the database from the .env file

PLEASE DO NOT SHARE IT. 

For viewing the data stored in the database, create a MongoDB account and I will invite you to it.

## 🏗️ Development

**Make sure you are in root (large-project) of your current working directory before proceeding**

Frontend: `cd frontend` and then run `npm run dev`

Backend: `cd backend` and then run `npm run dev`

Tip: you can also check if your backend is running with http://localhost:3000/health

## ✅ Testing

In your pull request, it's important you provide a thorough test plan walking through how you tested your changes. This will help reviewers understand your changes and ensure they are working as expected.

- For frontend changes, please provide screenshots or a video demonstrating the changes you've made. A before and after comparison is always helpful.

- For backend changes, please provide a detailed test plan outlining how you tested your changes. This could include Postman or manual testing

## 📝 Commits and Pull Requests

For commit messages, simply keep it concise, descriptive, and **in all lowercase**.

Please make sure:

- Your code is formatted correctly
- Your code passes linting

Most importantly, make sure your code is well-documented and easy to understand!
