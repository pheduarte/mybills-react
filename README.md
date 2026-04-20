# MyBills React

A mobile-first React app for tracking monthly income, expenses, and bill categories.

## What this project includes

- A month-by-month dashboard summary
- Income and expense totals with a running balance
- A form to add new transactions
- Category cards for bills like `House`, `Subscription`, and `Installments`
- Local persistence with `localStorage`
- A Vite setup that is easy to deploy to Vercel

## Run locally

```bash
npm install
npm run dev
```

## Build for production

```bash
npm run build
```

## Deploy to Vercel

1. Push this project to your GitHub repository.
2. Import the repository into Vercel.
3. Keep the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

## Learning notes

The main React logic lives in [src/App.jsx](./src/App.jsx). That file includes inline comments explaining:

- how `useState` stores app data
- how `useEffect` saves data to `localStorage`
- how derived values are calculated from the transactions list
- how the form updates state and adds new items
