# Smart Roster

Project documentation lives in [`docs/README.md`](docs/README.md).

Read [How Smart Roster works](docs/SYSTEM.md) for the detailed implementation reference, lifecycle, edge-case catalog, and source index.

It includes setup instructions, architecture, scheduling logic, implementation summary, verification results, deployment notes, assumptions, limitations, and assessment answers.

Quick start:

```bash
npm install
cp .env.example .env
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.
