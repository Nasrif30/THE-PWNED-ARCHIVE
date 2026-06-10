# THE PWNED ARCHIVE

A premium, static cybersecurity portfolio and writeup archive. Built without frameworks or databases, entirely driven by GitHub Pages and static JSON files.

## Project Structure

*   `assets/` - Contains global assets like profile pictures and the favicon.
*   `assets/icons/` - SVG icons used throughout the interface.
*   `assets/screenshots/` - Directory for storing challenge screenshots, organized by machine slug.
*   `content/` - Markdown files containing the actual writeups for each challenge or machine.
*   `entries/` - JSON metadata files for each challenge (title, platform, tags, etc.).
*   `data/` - Contains `profile.json` which drives the sidebar and profile page.
*   `css/` - All stylesheets, separated by concern (variables, layout, components, etc.).
*   `js/` - Vanilla JavaScript logic (routing, archive loading, analytics, terminal, etc.).
*   `index.html` - The single-page application entry point.

## Installation and Local Testing

1.  Clone the repository to your local machine.
2.  Open a terminal in the project directory.
3.  Start a local HTTP server. For example, using Python:
    `python -m http.server 3000`
4.  Navigate to `http://localhost:3000` in your web browser.

## GitHub Pages Deployment

The site is designed to be hosted directly on GitHub Pages.

1.  Push this repository to your GitHub account.
2.  Go to the repository Settings.
3.  Navigate to the "Pages" section in the left sidebar.
4.  Under "Build and deployment", set the Source to "Deploy from a branch".
5.  Select the `main` branch and `/ (root)` folder.
6.  Save the configuration. GitHub will automatically build and deploy your site.

## How to Add a Room or Machine

Adding a new entry is entirely file-based. You do not need to modify any JavaScript or HTML.

1.  **Create Metadata:** Create a new JSON file in the `entries/` directory (e.g., `entries/my-new-machine.json`). Follow the structure of existing entries.
2.  **Create Writeup:** Create a corresponding Markdown file in the `content/` directory (e.g., `content/my-new-machine.md`). This file should be referenced in your JSON metadata under the `writeup` key.
3.  **Add Screenshots (Optional):** Create a folder in `assets/screenshots/` with the same name as your machine slug. Add your images there, and list their paths in the `screenshots` array of your JSON file.
4.  Commit and push your changes to GitHub. The site will automatically update.

## How to Customize Profile

Edit the `data/profile.json` file. This file controls your name, handle, bio, learning focus, location, certifications, and social media links. The website will dynamically update to reflect these changes.

## Theme Configuration

The website includes a built-in dark and light mode toggle that automatically saves the user's preference. To adjust the specific colors or aesthetic of the themes, modify the CSS variables located in `css/variables.css`. The design uses an Apple-inspired glassmorphism aesthetic.
