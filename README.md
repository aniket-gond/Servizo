# Servizo - Local Service Discovery Web Platform
SITE LIVE AT ---> [servizosite.netlify.app](https://www.servizosite.netlify.app)

## Project Overview
**Servizo** is a modern web platform designed to help users easily discover, evaluate, and choose local service providers such as electricians, plumbers, tutors, and mechanics. The platform features an intuitive, responsive UI, with a **list and map view toggle** that allows users to switch between viewing services in a card-based list format or on an interactive map. The project utilizes **advanced search filters** to help users find providers based on category, location, and availability.

## Features Implemented
- **Service Listing Interface**: Displays service providers in a card-based layout, showing service name, category, location, availability status, and rating.
- **List & Map View Toggle**: Switch between list and map views without reloading the page.
- **Advanced Search & Filter**: Real-time filtering by category, location, and availability.
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile screens.
- **Interactive UI Behavior**: Simulated loading and empty states, hover effects, and smooth transitions.

## Core Languages & Frameworks
- **TypeScript**: Used for robust type safety, especially for complex interfaces like `ServiceProvider` and `FilterState`.
- **React (v19)**: The backbone of the application, utilizing functional components and advanced hooks:
  - `useMemo` for efficient filtering performance
  - `useRef` for DOM-heavy tasks (like map interactions)
  - `useState` for state management.
- **HTML5 & CSS3**: Provides semantic structure and custom keyframe animations (e.g., floating tools and constellation background).

## Styling & UI/UX
- **Tailwind CSS**: Utilized for utility-first layout styling. Custom extensions include:
  - Glassmorphism effects
  - 4xl border radii
  - Premium shadow effects for modern visual appeal.
- **Lucide React**: A comprehensive icon library used to represent the industrial and service-oriented visual language.
- **Google Fonts**: Specifically **Plus Jakarta Sans**, chosen for its clean, modern, and highly legible design.

## Services & Specialized Libraries
- **Leaflet.js**: An open-source mapping library used to handle interactive map displays for service providers, with custom `divIcon` markers and pathfinding using Polylines.
- **ESM.sh**: Used as a modern CDN for delivering React and Lucide directly to the browser with minimal bundling.
- **CartoDB / OpenStreetMap**: Provides the map tile layers with the "Dark Matter" theme for a sleek, premium interface.
- **Unsplash API**: Used to source high-resolution profile images for mock data.
- **Browser Geolocation API**: Powers the "Near Me" filtering feature by detecting the user's location and enabling a strict 1.5km radius search.

## Tech Stack Used
- **Frontend**:
  - React.js (Primary framework)
  - Tailwind CSS (Styling)
  - Leaflet.js (Mapping)
  - Lucide React (Icons)
  - Google Fonts (Typography)
- **Backend** (Optional/Minimal):
  - None (Static JSON data for demonstration)
- **Data Storage**:
  - Local JSON data (for mock data simulation)

## Instructions to Run the Project
SITE is live at servizosite.netlify.app

OR
run on your local computer environment 

### Prerequisites:
- Node.js installed on your machine.

### Installation Steps:
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/servizo.git
   cd servizo
2. npm install & npm run dev
   open terminal and type commands - npm install & npm run dev

//some screenshots of the project

## Screenshots

Here are some screenshots of the **Servizo** platform:

![Home Page Screenshot](assests/screenshot1.png)

![Service List Screenshot](assets/screenshot2.png)

![Map View Screenshot](assets/screenshot3.png)

![Profile View Screenshot](assests/screenshot4.png)

