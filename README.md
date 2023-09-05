# THREE.JS with Express, Firebase & ESBuild

A simple website using Node.js that connects to an encrypted Firebase store containing static model files (i.e., .glb) that are accessed using signed URLs. See the [live demo](https://viewebod.cyclic.app/) for more details.

	 Author: Ebod Shojaei
	 Version: 2.0.0


## Features:
### Security

-   **Signed URLs**: Gain secure and time-limited access to 3D models stored in Firebase. Falls back to server-stored model on error.
-   **Session Management**: Unique session identifiers are generated upon site visit. These sessions are used for route tracking, preventing unauthorized access to sensitive routes.
-   **Middleware Checkpoints**: Custom middleware flags sessions during model download attempts, ensuring only authorized access.
-   **Protected Routes**: Advanced middleware redirects unauthorized users and denies forbidden access.

### User Interface

-   **Animated .glb Model**: Interact with a fully rigged and animated .glb model.
-   **Draggable Selection Box**: A fully animated selection box enhances the user interaction.

### Infrastructure

-   **Error Handling**: Dynamic error pages handle invalid routes and set appropriate HTTP status codes (e.g., 403, 404, 429, 500, etc.).
-   **Hosting**: Deployed on Cyclic for better scalability and performance.

## License:
### Code
The code in this project is licensed under the Eclipse Public License 2.0 - see the [LICENSE](LICENSE) file for details.
<br>
### 3D Models and Assets
The 3D models in this repository are licensed under a [Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International License](https://creativecommons.org/licenses/by-nc-nd/4.0/). All 3D models, textures, and associated assets are the exclusive property of the author and are not licensed for any form of distribution or reuse unless explicitly stated otherwise. Unauthorized copying, modification, or distribution is not permitted.

**Any use of these assets without explicit written consent from the author is strictly prohibited.**