# Town Team Athanikkal - Project Documentation

This is a Next.js web application built for **Town Team Athanikkal**, handling various club operations including managing members, accounting, events, and a ledger system.

## 🚀 Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, v16)
- **UI Library**: [React](https://react.dev/) (v19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) with [shadcn/ui](https://ui.shadcn.com/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) (v5)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)

## 🛠️ Getting Started

### Installation & Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_database_connection_string"
   AUTH_SECRET="your_nextauth_secret"
   ```

3. **Database Setup & Seeding**:
   ```bash
   npx prisma db push
   npx prisma generate
   npx prisma db seed
   ```

4. **Running the Application**:
   ```bash
   npm run dev
   ```

---

## 🔑 Default Login Credentials

After seeding the database (`npx prisma db seed`), a default super admin user is automatically created. Use these credentials to access the admin dashboard:

- **Email ID**: `admin@townteamathanikkal.com`
- **Password**: `admin@123`
- **Role**: `SUPER_ADMIN`

*(Note: It is highly advised to change the default password after the first login in a production environment.)*
