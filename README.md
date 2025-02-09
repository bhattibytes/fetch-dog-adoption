# Fetch Dog Adoption Platform

A modern web application built with Next.js that helps users find and adopt dogs from shelters. The platform features an interactive map-based search, traditional filtering, and an intelligent matching system.

## Features

### Authentication
- Secure user authentication system
- Persistent sessions
- User-specific favorites and matches

### Interactive Map Search
- Powered by HERE Maps API
- Visual representation of available dogs by location
- Dynamic radius-based search
- Interactive markers showing dogs in each location
- Real-time updates when favoriting dogs
- Custom info bubbles with dog details
- Adjustable search radius (10-100 miles)

### Traditional Search
- Advanced filtering options:
  - Breed selection (multiple breeds)
  - Age range slider
  - Location-based search
  - ZIP code filtering
- Pagination support
- Sort options (breed, age, name)
- Dynamic results updating

### Favorites System
- Add/remove dogs to favorites
- Animated heart interactions
- Persistent storage
- Real-time updates across components
- Favorites count in navigation
- Most recent favorites appear first

### Matching System
- Smart dog matching based on favorites
- Generate matches with favorited dogs
- Detailed match view with full dog information
- Option to generate new matches
- Success notifications

### User Interface
- Responsive design for all screen sizes
- Modern, clean aesthetic
- Smooth animations and transitions
- Interactive elements and hover states
- Toast notifications for user feedback
- Loading states and error handling
- Consistent navigation bar
- Branded header with logo

## Tech Stack

- **Frontend Framework**: Next.js 13
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: 
  - Zustand for global state
  - React Query for server state
- **Maps Integration**: HERE Maps API
- **UI Components**:
  - Headless UI
  - Hero Icons
  - Framer Motion for animations
- **Form Handling**: React Hook Form
- **API Integration**: Fetch API with credentials

## HERE Maps Integration

The application uses HERE Maps API for its mapping features:

### Key Features
- Interactive map with custom markers
- Geocoding for address searches
- Custom info bubbles for dog information
- Radius-based location search
- Dynamic marker updates
- Viewport management
- Location clustering

### Map Components
- Search radius visualization
- Location markers with dog information
- Custom styled info windows
- Interactive dog cards within markers
- Favorite functionality directly from map

## Getting Started

1. Clone the repository:

2. Install dependencies:

3. Run the development server:

4. Open your browser and navigate to `http://localhost:3000`    

