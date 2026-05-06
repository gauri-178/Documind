# DocuMind 🚀

DocuMind is an AI-powered document analysis platform that allows users to upload documents (PDF, Word, Text, etc.) and chat with them using intelligent RAG (Retrieval-Augmented Generation) processing.

## 🏗️ Technical Architecture

- **Frontend**: React (Vite) + Tailwind CSS + Lucide Icons
- **Backend**: Java 21 + Spring Boot + Spring Security + JPA/Hibernate
- **Database**: MySQL (Unified single-database architecture)

---

## 🛠️ Setup & Installation

### 1. Database Configuration
Ensure you have **MySQL** installed and running.

- **Create Database**:
  ```sql
  CREATE DATABASE documind_db;
  ```
- **Update Credentials**:
  The database credentials are located in `documind-backend/src/main/resources/application.yml`.
  Default configuration:
  - **User**: `adityaverma`
  - **Password**: `Mysql@123`
  - **URL**: `jdbc:mysql://localhost:3306/documind_db`

### 2. Run the Backend
1. Open a terminal.
2. Navigate to the backend directory:
   ```bash
   cd documind-backend
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```
The backend will be available at `http://localhost:8080`.

### 3. Run the Frontend
1. Open a second terminal.
2. Navigate to the root folder:
   ```bash
   cd ..
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
The frontend will be available at `http://localhost:5173`.

---

## 🌟 Key Features

- **Document Upload**: Supports PDF, DOCX, TXT, CSV, and Images.
- **Smart Analytics**: AI-driven responses based on your specific document content.
- **Real-time Chat**: Interactive interface with message history and context retrieval.
- **User Authentication**: Secure Signup/Login with JWT tokens.
- **Unified DB**: Optimized single MySQL architecture for simplicity and performance.

---

## 📝 Usage

1. Sign up for a new account.
2. Create a "New Chat".
3. Upload your documents using the paperclip icon.
4. Ask questions like: *"What are the key points in this PDF?"* or *"Summarize this document."*
