# AI Rules for Trek Explorer Application

This document outlines the core technologies and specific library usage guidelines for developing and modifying the Trek Explorer application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Description

*   **Next.js**: A React framework for building server-rendered and statically generated web applications, providing routing, API routes, and optimized builds.
*   **React**: The core JavaScript library for building user interfaces, enabling component-based development.
*   **TypeScript**: A superset of JavaScript that adds static type definitions, improving code quality and developer experience.
*   **Tailwind CSS**: A utility-first CSS framework for rapidly building custom designs directly in your markup.
*   **shadcn/ui**: A collection of beautifully designed, accessible, and customizable UI components built with Radix UI and Tailwind CSS.
*   **Firebase**: Google's platform for developing mobile and web applications, used here for Firestore (NoSQL database) and Authentication.
*   **Genkit AI**: An open-source framework for building AI-powered applications, used for creating custom AI flows like trip customization.
*   **Zod**: A TypeScript-first schema declaration and validation library, primarily used for form input validation.
*   **React Hook Form**: A library for flexible and extensible forms with easy-to-use validation.
*   **Lucide React**: A collection of beautiful and customizable open-source icons.
*   **Framer Motion**: A production-ready motion library for React, used for animations.
*   **date-fns**: A modern JavaScript date utility library.

## Library Usage Rules

To maintain consistency and leverage the strengths of our tech stack, please follow these guidelines when developing:

1.  **UI Components**:
    *   **Always** use `shadcn/ui` components for all user interface elements (e.g., buttons, cards, inputs, dialogs, selects, toasts).
    *   If a specific `shadcn/ui` component is not available or requires significant customization, create a new component that wraps or extends `shadcn/ui` primitives, or build a new one using pure Tailwind CSS. **Do not modify existing `shadcn/ui` component files directly.**

2.  **Styling**:
    *   **Exclusively** use **Tailwind CSS** for all styling. Apply utility classes directly in your JSX.
    *   Avoid creating custom CSS files or using inline styles, except for global styles defined in `src/app/globals.css`.

3.  **Forms**:
    *   **Always** use `react-hook-form` for managing form state, validation, and submission.
    *   **Always** use `zod` for defining form schemas and validation rules.

4.  **Icons**:
    *   **Always** use icons from the `lucide-react` library.

5.  **State Management**:
    *   For local component state, use React's `useState` and `useReducer` hooks.
    *   For global application state, leverage existing contexts (e.g., `WishlistContext`) and Firebase hooks (`useUser`, `useDoc`, `useCollection`) for data fetching and real-time updates.

6.  **Data Fetching & Persistence**:
    *   **Firebase Firestore** is the primary database.
    *   For client-side data access and real-time subscriptions, use the custom Firebase hooks (`useFirestore`, `useDoc`, `useCollection`) located in `src/firebase/firestore/`.
    *   For server-side data mutations (create, update, delete), use the server actions defined in `src/lib/db.ts`.

7.  **AI Integration**:
    *   All AI-related functionalities should be built using **Genkit AI** flows, as demonstrated in `src/ai/flows/customize-trip-flow.ts`.

8.  **Routing**:
    *   Utilize **Next.js App Router** for all navigation and page routing.

9.  **Date Handling**:
    *   Use `date-fns` for all date formatting, parsing, and manipulation tasks.

10. **Animations**:
    *   For complex and declarative animations, use `framer-motion`.

11. **Image Optimization**:
    *   Client-side image compression before upload should use `browser-image-compression`.