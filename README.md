# PlayTonight - Wellness For Men

A React-based landing page for PlayTonight Wellness For Men with integrated checkout and payment functionality.

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## Installation & Setup

### Step 1: Install Dependencies

Open your terminal/command prompt in the project directory and run:

```bash
npm install
```

This will install all required packages listed in `package.json`:
- React & React DOM
- React Router DOM
- Framer Motion
- Tailwind CSS
- Vite (build tool)

### Step 2: Verify Installation

After installation completes, verify that `node_modules` folder exists in your project root.

## Running the Project

### Step 3: Start Development Server

Run the following command:

```bash
npm run dev
```

This will:
- Start the Vite development server
- Usually run on `http://localhost:5173`
- Open the URL shown in the terminal (typically `http://localhost:5173`)

### Step 4: Access the Application

Open your web browser and navigate to:
```
http://localhost:5173
```

The application should load with:
- Navbar with "PlayTonight - Wellness For Men" logo
- Video banner
- Product information
- Checkout form with cart

## Project Structure

```
play-tonight/
├── public/              # Static assets (images, videos)
│   ├── 1-7.png         # Certification badges
│   ├── Logo.png        # Brand logo
│   ├── Capsules.png    # Product image
│   └── banner.mp4      # Video banner
├── src/
│   ├── components/     # React components
│   │   ├── Navbar.jsx
│   │   ├── VideoBanner.jsx
│   │   ├── Certifications.jsx
│   │   ├── ProductSection.jsx
│   │   ├── CartSection.jsx
│   │   ├── Footer.jsx
│   │   └── PayURedirect.jsx
│   ├── Pages/          # Page components
│   │   ├── Home.jsx
│   │   ├── Terms.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Disclaimer.jsx
│   │   ├── Refund.jsx
│   │   └── PayURedirectPage.jsx
│   ├── App.jsx         # Main app component with routing
│   ├── main.jsx        # React entry point
│   └── index.css       # Global styles with Tailwind
├── index.html          # HTML template
├── package.json        # Dependencies and scripts
├── vite.config.js      # Vite configuration
├── tailwind.config.js  # Tailwind CSS configuration
└── postcss.config.js   # PostCSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Features

- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Video banner with autoplay
- ✅ Product information section
- ✅ Integrated checkout form
- ✅ Shopping cart with quantity controls
- ✅ Payment integration (PayU)
- ✅ SEO optimized with meta tags
- ✅ Google Tag Manager integration

## Routes

- `/` - Home page with checkout
- `/cart` - Same as home (redirects to home)
- `/terms` - Terms & Conditions
- `/privacypolicy` - Privacy Policy
- `/disclaimer` - Disclaimer
- `/refund` - Refund & Cancellation Policy
- `/payu-redirect` - Payment redirect page

## Configuration

### Payment API
The checkout form submits to:
```
https://api.playtonight.fun/api/payment/checkout/1001
```

### Google Tag Manager
GTM ID: `GTM-59NCFPG9` (configured in `index.html`)

## Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically use the next available port. Check the terminal output for the actual URL.

### Dependencies Not Installing
Try:
```bash
npm cache clean --force
npm install
```

### Module Not Found Errors
Make sure all dependencies are installed:
```bash
rm -rf node_modules
npm install
```

## Production Build

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` folder, ready to deploy to any static hosting service.

## Technologies Used

- **React 18** - UI framework
- **React Router 6** - Routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations (if used)
- **PostCSS** - CSS processing

## Support

For issues or questions, contact:
- **Customer Care**: +91 124 4477054
- **Email**: enquiry@zeenmediconnect.com

---

© 2025, Zeen Mediconnect OPC Pvt Ltd. All Rights Reserved.

