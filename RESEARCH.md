# Research Document: AI Traditional Dress Try-On

## 1. Project Overview
The "AI Traditional Dress Try-On" is a web-based application that leverages computer vision and generative AI to allow users to virtually experience traditional Indian attire. By capturing a live photo via a webcam, the system uses advanced AI models to overlay or replace the user's current clothing with specific regional dresses.

## 2. Approach
The project follows a "Generative Inpainting/Editing" approach rather than simple 2D overlays. This ensures that the dress fits the user's body shape, pose, and lighting conditions realistically.

### Workflow:
1.  **Image Acquisition**: Capture a high-quality frame from the user's webcam using the MediaDevices API.
2.  **Preprocessing**: Convert the captured frame to a Base64 encoded string for API transmission.
3.  **AI Processing**: Send the image to the Gemini 2.5 Flash Image model with a specific prompt describing the desired traditional dress.
4.  **Output Rendering**: Display the AI-generated image back to the user with options to download or share.

## 3. Tools and Technologies
-   **Frontend Framework**: React 19 with TypeScript for a robust, type-safe UI.
-   **Styling**: Tailwind CSS for a modern, responsive design.
-   **Animations**: Motion (framer-motion) for smooth transitions and interactive feedback.
-   **AI Engine**: Google Gemini 2.5 Flash Image (`gemini-2.5-flash-image`) for high-speed, high-quality image-to-image editing.
-   **Webcam Access**: Native Browser `navigator.mediaDevices` API.
-   **Icons**: Lucide React for clean UI elements.

## 4. Regional Dress Definitions
-   **Himachal Dress**: Typically includes the *Pattu*, *Dhatu* (headscarf), and colorful woolen jackets or embroidered caps for men.
-   **Rajasthani Dress**: Characterized by vibrant *Ghagra Cholis* with mirror work for women and *Angarkhas* with colorful turbans (*Pagri*) for men.
-   **Punjabi Dress**: Features the classic *Phulkari* embroidery, *Patiala Salwars* for women, and *Kurta-Pyjamas* with turbans for men.

## 5. Challenges & Solutions
-   **Pose Consistency**: Generative models can sometimes change the person's face. **Solution**: Use specific prompting instructions to "keep the face and pose identical."
-   **Latency**: Image generation takes a few seconds. **Solution**: Implement an immersive loading state with progress indicators.
-   **Privacy**: Images are processed in-memory and sent to the API. **Solution**: No images are stored permanently on the server side in this prototype.

## 6. Future Enhancements
-   **AR Real-time Overlay**: Moving from static image generation to real-time AR using MediaPipe or TensorFlow.js.
-   **Customization**: Allowing users to choose colors and specific patterns within the regional styles.
-   **Social Integration**: Direct sharing to Instagram/WhatsApp.
