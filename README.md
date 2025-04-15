# Next.js Canvas

## Version 1.0.0

### Description

This is a simple Next.js application that demonstrates how to use the `canvas` tag to create a canvas element and draw on it using JavaScript. The application includes a simple drawing tool that allows users to draw on the canvas with their mouse.

In this version, I started with a new Next.js application and created a canvas. I added states and functions to handle the drawing and a button to download the canvas as a PNG image. The first version was quickly created, and I didn't spend much time on the design.

![Screenshot](https://github.com/user-attachments/assets/99634a0f-092f-4f9d-985b-cb14b4204bd2)

#### Features

- Simple drawing tool
- Downloadable canvas image

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/prochalu/rita-and-the-rugs-canvas.git
   cd rita-and-the-rugs-canvas
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Start the development server:

   ```bash
   pnpm dev
   ```

4. Open your browser and navigate to `http://localhost:3000`. You should see a blank canvas where you can draw with your mouse.

### Usage

- Drawing: Click and drag your mouse on the canvas to draw
- Change Background Color: Use the background color picker to set a custom background
- Change Drawing Color: Use the drawing color picker to select your preferred drawing color
- Adjust Line Thickness: Use the slider to change the thickness of the drawing tool
- Resize Canvas: Select a predefined size or toggle between portrait and landscape modes
- Clear Canvas: Click the "Clear" button to reset the canvas
- Download: Click the "Download" button to save your design as a PNG image
