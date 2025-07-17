# @leaseup/ui

A comprehensive React component library for LeaseUp applications. This package provides a collection of reusable UI components built with Radix UI primitives and styled with TailwindCSS.

## Features

- Modern, accessible UI components
- Built on Radix UI primitives for accessibility and composability
- Styled with TailwindCSS for consistent design
- Typescript support for better developer experience
- Responsive design patterns
- Consistent theming across components

## Installation

```bash
npm install @leaseup/ui
# or
yarn add @leaseup/ui
# or
pnpm add @leaseup/ui
```

## Setup

1. Ensure you have the required peer dependencies installed:

```bash
npm install react react-dom @radix-ui/react-* tailwindcss
```

2. Import the styles in your application:

```jsx
import '@leaseup/ui/dist/styles.css';
```

3. If you're using TailwindCSS, add the package to your tailwind content config:

```js
// tailwind.config.js
module.exports = {
content: [
    // ...
    './node_modules/@leaseup/ui/**/*.{js,ts,jsx,tsx}',
],
// ...
}
```

## Available Components

The library includes the following components:

- Button
- Card
- Dialog
- Dropdown
- Form elements
- Input
- Modal
- Pagination
- Select
- Table
- Tabs
- Toast
- Typography
- ... and more

## Usage

Import components from the package and use them in your React application:

```jsx
import { Button, Card, Input } from '@leaseup/ui';

function MyComponent() {
return (
    <Card>
    <h2>Sign In</h2>
    <Input 
        label="Email" 
        placeholder="Enter your email" 
        type="email" 
    />
    <Button variant="primary">Submit</Button>
    </Card>
);
}
```

## Styling

Components are styled with TailwindCSS and follow LeaseUp's design system. You can customize the appearance of components by:

1. Using variant props where available
2. Using className prop to apply additional Tailwind classes
3. Using styled-components or other CSS-in-JS libraries for more complex customizations

## Dependencies

This package depends on:

- React
- React DOM
- Radix UI primitives
- TailwindCSS
- TypeScript (for development)
- Other utilities for specific component functionality

## Development

To contribute to this package:

1. Clone the repository
2. Install dependencies with `npm install`
3. Run development server with `npm run dev`
4. Build the package with `npm run build`

## Documentation

For more detailed documentation on each component, please refer to the internal documentation site or component stories.

## License

MIT

