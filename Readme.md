to start venv source venv/bin/activate
uvicorn main:app

frontend/src/
├── app/
│ ├── layout.jsx
│ ├── page.jsx (home)
│ ├── (auth)/
│ │ ├── login/
│ │ │ └── page.jsx
│ │ └── signup/
│ │ └── page.jsx
│ └── (dashboard)/
│ ├── layout.jsx (with navbar, sidebar)
│ ├── page.jsx (dashboard home)
│ ├── courses/
│ │ ├── page.jsx
│ │ ├── [id]/
│ │ │ └── page.jsx
│ │ └── create/
│ │ └── page.jsx
│ ├── assignments/
│ │ └── page.jsx
│ └── settings/
│ └── page.jsx
│
├── components/
│ ├── Navbar.jsx
│ ├── Sidebar.jsx
│ ├── Button.jsx
│ ├── Card.jsx
│ ├── Modal.jsx
│ └── ...
│
├── lib/ ← Put API files here
│ ├── api.js (axios instance)
│ ├── api-client.js (API functions)
│ └── utils.js (helpers)
│
├── hooks/ ← State & Auth
│ ├── useAuth.js
│ ├── useFetch.js
│ └── ...
│
└── styles/
└── globals.css
