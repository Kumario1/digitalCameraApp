# 📸 Digital Camera App

The **Digital Camera App** transforms your device into a vintage-style camera, allowing you to snap high-resolution photos, apply creative filters, and save them to your gallery. The app is built with modern technologies to deliver a seamless photography experience.

---

## ✨ Features

- **High-Resolution Photos**: Take crisp and clear pictures with your device’s camera.
- **Custom Filters**: Apply filters like grayscale, sepia, invert, and more to add a vintage or artistic touch.
- **Save to Gallery**: Save your filtered photos directly to your device’s gallery.
- **User-Friendly Navigation**: Simple interface with intuitive controls.
- **Cross-Platform Compatibility**: Works on both iOS and Android devices.

---

## 🚀 Upcoming Features

Here’s what’s in store for future updates:

- **Batch Photo Processing**: Apply filters to multiple photos simultaneously.
- **Customizable Filters**: Adjust intensity levels for each filter (e.g., brightness, saturation).
- **New Filter Library**: Add more advanced filters like blur, vignette, and HDR effects.
- **In-App Editing Tools**: Crop, rotate, and adjust photos before saving.
- **Cloud Integration**: Save and sync photos across devices using cloud storage.
- **Social Sharing**: Share photos directly to social media platforms like Instagram, Facebook, and Twitter.
- **Dark Mode Support**: Seamless UI experience in dark mode.

---

## 🛠️ How It Was Made

The app is built using the following tools and technologies:

### **Frontend**
- **React Native**: For building the mobile application.
- **Expo**: To streamline development and handle features like the camera and file system.
- **React Native Camera**: To enable high-quality photo capturing.
- **React Native File System**: For saving and managing files.
- **React Native Media Library**: To save photos to the user’s gallery.

### **Backend**
- **Python Flask**: To handle filter application requests.
- **Pillow (PIL)**: For image processing and filter application.

---

## 📦 Installation

Follow these steps to install and run the app:

### **1. Clone the Repository**
```bash
git clone https://github.com/yourusername/digital-camera-app.git
cd digital-camera-app
2. Install Dependencies
Frontend:
npm install
Backend:
pip install -r requirements.txt
3. Start the Backend Server
Run the Flask server:

python server.py
Make sure the server is running on the same network as your mobile device for development purposes.

4. Start the Expo App
expo start
Use the Expo Go app on your mobile device to scan the QR code and load the app.

🚀 How to Use

Launch the App: Open the app on your device.
Take a Picture:
Point your camera and press the Snap button.
Use the Flip Camera button to toggle between front and rear cameras.
Apply Filters:
Select a filter from the filter bar to transform your photo.
Preview the filtered image in real time.
Save to Gallery:
Click Save to store the photo in your device’s gallery.
The app will notify you when the photo is saved successfully.
🖼️ Screenshots



🌐 Backend API

The app communicates with a Flask backend to apply filters. Below is an overview of the API:

Endpoint: /apply-filter
Method: POST
Parameters:
image: The uploaded image file.
filter: The filter type (grayscale, sepia, etc.).
Response: Processed image.
Example curl request:

curl -X POST -F "filter=grayscale" -F "image=@path/to/image.jpg" http://127.0.0.1:5000/apply-filter --output filtered-image.jpg
🤝 Contributing

Contributions are welcome! Here’s how you can help:

Fork the repository.
Create a new branch: git checkout -b feature/your-feature-name.
Commit your changes: git commit -m 'Add your message here'.
Push to the branch: git push origin feature/your-feature-name.
Open a pull request.
📝 License


📧 Contact
