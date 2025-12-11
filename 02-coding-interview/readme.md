# Code Interview Platform

A real-time collaborative code editor for conducting coding interviews. Features include:

- Create and share interview sessions

- Real-time code collaboration

- Syntax highlighting for JavaScript and Python

- In-browser code execution using WebAssembly

- Support for multiple participants


## Technologies Used

- **Frontend**: React, Vite, CodeMirror, Socket.IO Client

- **Backend**: Express.js, Socket.IO

- **Code Execution**: react-py (Python via WebAssembly)


## Getting Started

### Prerequisites

- Node.js (v14 or later)

- npm (v6 or later)

### Installation

1. Clone the repository:

git clone https://github.com/yourusername/code-interview-platform.git cd code-interview-platform

2. Install dependencies for both client and server:

npm run install:all

### Running the Application

To run both client and server concurrently:

npm run dev

This will start:

- Backend server on http://localhost:3000

- Frontend development server on http://localhost:5173

### Running Tests

To run all tests:

npm test

To run only server tests:

cd server && npm test

To run only client tests:

cd client && npm test


## Building for Production

1. Build the client:

npm run build

2. Start the production server:

npm start

## Docker Deployment

1. Build the Docker image:

docker build -t code-interview-platform .

2. Run the container:

docker run -p 3000:3000 code-interview-platform

## Features

### Creating a Session

1. Navigate to the home page
2. (Optional) Enter your name
3. Click "Create New Session"
4. Share the generated URL with participants

### Joining a Session

1. Open the shared session URL
2. (Optional) Enter your name
3. Start collaborating on code

### Code Execution

1. Write code in the editor
2. Select the appropriate language
3. Click "Run Code" to execute in the browser
4. View the output in the results panel

## License

MIT