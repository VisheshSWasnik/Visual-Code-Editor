

# Scratch-Style Visual Programming Playground

A visual programming environment inspired by MIT Scratch, built with React. Create interactive programs by dragging and dropping blocks to control sprites on a canvas.

## Features

### Core Functionality
- **Visual Block Programming**: Drag and drop blocks to build programs
- **Multiple Sprites**: Create and manage multiple sprites
- **Block Categories**:
  - **Events**: Start programs with "when flag clicked"
  - **Motion**: Move, turn, and position sprites
  - **Looks**: Display speech and thought bubbles
  - **Control**: Repeat blocks for loops

### Advanced Features
- **Hero Feature - Collision-Based Animation Swap**: When two sprites collide, their animation blocks automatically swap
- **Block Reordering**: Drag and drop blocks within the workspace to reorder them
- **Repeat Blocks**: C-shaped control blocks that can contain inner blocks
- **Dynamic Input Fields**: Input fields automatically resize based on content
- **Delete Functionality**: Remove blocks with a hover-activated delete button
- **Execution Control**: Green flag button to start execution, red stop button to halt

## Technologies Used

- **React 17**: UI framework
- **Tailwind CSS**: Styling
- **Webpack**: Build tool
- **Context API**: State management

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
git clone <repository-url>
cd scratch-starter-project
2. Install dependencies: npm install
3. Start the development server:
npm start4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

npm run buildThis creates optimized production files in the `public` directory.

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
npm i -g vercel
2. Deploy:
vercelOr connect your GitHub repository to Vercel for automatic deployments.

## Project Structure
