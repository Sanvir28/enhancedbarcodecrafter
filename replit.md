# Overview

This is an Enhanced Barcode Manager web application that allows users to manage product inventories through barcode scanning and generation. The application provides functionality to scan barcodes using camera input, manually enter barcodes, store product information, and generate receipts. It's built as a client-side web application with Firebase backend integration for authentication and data storage.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Single Page Application (SPA)**: Built with vanilla HTML, CSS, and JavaScript without frameworks
- **Tab-based Navigation**: Uses client-side tab switching for different features (Add Product, Products, Receipt)
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox layouts
- **Modal System**: Custom modal implementations for editing and confirmation dialogs

## Authentication System
- **Firebase Authentication**: Integrated Google OAuth for user login/logout
- **Session Management**: Client-side user state management with Firebase Auth state persistence
- **Protected Routes**: Main application content only accessible after authentication

## Data Storage
- **Firebase Firestore**: NoSQL document database for storing product information
- **Real-time Updates**: Firestore real-time listeners for live data synchronization
- **User-scoped Data**: Products are stored per authenticated user

## Barcode Processing
- **Scanner Integration**: QuaggaJS library for camera-based barcode scanning
- **Barcode Generation**: JsBarcode library for creating barcode images
- **Manual Entry**: Alternative input method for barcode data when camera scanning isn't available
- **Multiple Format Support**: Supports various barcode formats through QuaggaJS

## Receipt System
- **Dynamic Receipt Generation**: HTML template-based receipt creation
- **Product Selection**: Multi-select interface for choosing products for receipts
- **Print-ready Output**: CSS-styled receipts optimized for printing

## UI/UX Components
- **Toast Notifications**: Custom notification system for user feedback
- **Loading States**: Visual indicators for async operations
- **Icon Integration**: Font Awesome icons throughout the interface
- **Gradient Design**: Modern gradient backgrounds and styling

# External Dependencies

## Firebase Services
- **Firebase App**: Core Firebase SDK v9.22.0 (compatibility mode)
- **Firebase Auth**: Authentication service for Google OAuth
- **Firebase Firestore**: Document database for product storage

## Third-party Libraries
- **QuaggaJS v0.12.1**: Barcode scanning from camera input
- **JsBarcode v3.11.5**: Barcode image generation
- **Font Awesome v6.4.0**: Icon library for UI elements

## Browser APIs
- **MediaDevices API**: Camera access for barcode scanning
- **Print API**: Browser printing functionality for receipts
- **Local Storage**: Client-side data persistence for user preferences

## Development Dependencies
- **Firebase SDK v12.0.0**: Node.js Firebase package (likely for potential server-side features)

The architecture prioritizes simplicity and direct browser compatibility, avoiding complex build processes while leveraging modern web APIs and established third-party services for core functionality.