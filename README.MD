````markdown
# 📆 Timestamp Microservice API

A simple microservice built with Node.js and Express that returns a timestamp in both UNIX and UTC format.

This project is part of the **Back End Development and APIs** certification from [freeCodeCamp](https://www.freecodecamp.org/).

---

## 🚀 Features

- Return current timestamp if no date is provided
- Parse date strings (`YYYY-MM-DD`)
- Parse UNIX timestamps (milliseconds)
- Return error for invalid dates

---

## 🧪 API Usage

### 🔹 GET `/api`
Returns the current time.

**Response:**
```json
{
  "unix": 1719816792591,
  "utc": "Tue, 30 Jun 2025 17:53:12 GMT"
}
````

---

### 🔹 GET `/api/date`

#### Example with date string:

`/api/2015-12-25`

**Response:**

```json
{
  "unix": 1451001600000,
  "utc": "Fri, 25 Dec 2015 00:00:00 GMT"
}
```

#### Example with UNIX timestamp:

`/api/1451001600000`

**Response:**

```json
{
  "unix": 1451001600000,
  "utc": "Fri, 25 Dec 2015 00:00:00 GMT"
}
```

#### Invalid date:

`/api/invalid-date`

**Response:**

```json
{
  "error": "Invalid Date"
}
```

---

## ⚙️ Installation & Usage

### 1. Clone Repo

```bash
git clone https://github.com/SakumDisiniPa/back-end-development-and-apis.git
cd back-end-development-and-apis
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Server

```bash
node server.js
```

> Server will run at: `http://localhost:3000`

---

## 📁 File Structure

```
.
├── server.js
├── public/
│   └── index.html
├── package.json
└── README.md
```

---

## 🛠️ Built With

* [Node.js](https://nodejs.org/)
* [Express](https://expressjs.com/)
* [freeCodeCamp](https://www.freecodecamp.org/)

---

## 👨‍💻 Author

**Dimas Dwi Agustianto**
GitHub: [SakumDisiniPa](https://github.com/SakumDisiniPa)

---

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).

```