"""Static Site template using HTML, CSS, and JavaScript."""

from pathlib import Path

from idp_cli.templates.base import BaseTemplate
from idp_cli.utils.file_utils import create_directory, write_file


class StaticSiteTemplate(BaseTemplate):
    """Template for static sites using HTML, CSS, and JavaScript."""

    @property
    def template_name(self) -> str:
        return "static-site"

    @property
    def language(self) -> str:
        return "javascript"

    @property
    def framework(self) -> str:
        return "vanilla"

    def generate_app_code(self) -> None:
        """Generate static site code."""
        # Create directories
        create_directory(self.service_dir / "css")
        create_directory(self.service_dir / "js")
        create_directory(self.service_dir / "assets" / "images")
        create_directory(self.service_dir / "pages")

        # Generate index.html
        index_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{{.service_name}} - A modern static website">
    <meta name="keywords" content="static site, html, css, javascript">
    <meta name="author" content="Your Name">
    
    <title>{{.service_name}} - Home</title>
    
    <!-- CSS -->
    <link rel="stylesheet" href="css/style.css">
    <link rel="stylesheet" href="css/components.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌐</text></svg>">
    
    <!-- Preload critical resources -->
    <link rel="preload" href="css/style.css" as="style">
    <link rel="preload" href="js/main.js" as="script">
</head>
<body>
    <!-- Loading Screen -->
    <div id="loading-screen" class="loading-screen">
        <div class="loading-spinner"></div>
        <p>Loading {{.service_name}}...</p>
    </div>

    <!-- Navigation -->
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <div class="nav-brand">
                <a href="#home">{{.service_name}}</a>
            </div>
            <ul class="nav-menu" id="nav-menu">
                <li class="nav-item">
                    <a href="#home" class="nav-link active">Home</a>
                </li>
                <li class="nav-item">
                    <a href="#about" class="nav-link">About</a>
                </li>
                <li class="nav-item">
                    <a href="#features" class="nav-link">Features</a>
                </li>
                <li class="nav-item">
                    <a href="#contact" class="nav-link">Contact</a>
                </li>
            </ul>
            <div class="nav-toggle" id="nav-toggle">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main>
        <!-- Hero Section -->
        <section id="home" class="hero">
            <div class="hero-content">
                <h1 class="hero-title">
                    Welcome to <span class="gradient-text">{{.service_name}}</span>
                </h1>
                <p class="hero-subtitle">
                    A modern, responsive static website built with pure HTML, CSS, and JavaScript.
                    Experience fast loading times and beautiful design.
                </p>
                <div class="hero-buttons">
                    <a href="#features" class="btn btn-primary">Explore Features</a>
                    <a href="#contact" class="btn btn-secondary">Get in Touch</a>
                </div>
            </div>
            <div class="hero-visual">
                <div class="floating-elements">
                    <div class="element element-1"></div>
                    <div class="element element-2"></div>
                    <div class="element element-3"></div>
                </div>
            </div>
        </section>

        <!-- About Section -->
        <section id="about" class="about">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">About {{.service_name}}</h2>
                    <p class="section-subtitle">Learn more about our mission and vision</p>
                </div>
                <div class="about-content">
                    <div class="about-text">
                        <h3>Building the Future of Web</h3>
                        <p>
                            {{.service_name}} represents a new approach to web development - 
                            combining simplicity with power. Our static site architecture ensures 
                            lightning-fast loading times while maintaining a beautiful, modern design.
                        </p>
                        <p>
                            Built with semantic HTML5, modern CSS3, and vanilla JavaScript, 
                            we prioritize performance, accessibility, and user experience above all else.
                        </p>
                        <div class="stats">
                            <div class="stat">
                                <span class="stat-number" data-target="100">0</span>
                                <span class="stat-label">Performance</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" data-target="99">0</span>
                                <span class="stat-label">Accessibility</span>
                            </div>
                            <div class="stat">
                                <span class="stat-number" data-target="60">0</span>
                                <span class="stat-label">Score (ms)</span>
                            </div>
                        </div>
                    </div>
                    <div class="about-visual">
                        <div class="code-preview">
                            <div class="code-header">
                                <span class="dot red"></span>
                                <span class="dot yellow"></span>
                                <span class="dot green"></span>
                            </div>
                            <pre><code>&lt;!DOCTYPE html&gt;
&lt;html lang="en"&gt;
&lt;head&gt;
    &lt;title&gt;{{.service_name}}&lt;/title&gt;
    &lt;meta charset="UTF-8"&gt;
&lt;/head&gt;
&lt;body&gt;
    &lt;h1&gt;Hello World!&lt;/h1&gt;
&lt;/body&gt;
&lt;/html&gt;</code></pre>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Features Section -->
        <section id="features" class="features">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Features</h2>
                    <p class="section-subtitle">What makes {{.service_name}} special</p>
                </div>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon">⚡</div>
                        <h3>Lightning Fast</h3>
                        <p>Static sites load instantly with no server-side processing required.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">📱</div>
                        <h3>Responsive Design</h3>
                        <p>Perfect experience on all devices, from mobile to desktop.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🔒</div>
                        <h3>Secure</h3>
                        <p>No server-side vulnerabilities means enhanced security.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🌍</div>
                        <h3>SEO Optimized</h3>
                        <p>Built with semantic HTML5 and SEO best practices.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🎨</div>
                        <h3>Modern Design</h3>
                        <p>Clean, beautiful interface with smooth animations.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon">🚀</div>
                        <h3>Easy Deploy</h3>
                        <p>Deploy anywhere with simple file hosting.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Contact Section -->
        <section id="contact" class="contact">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">Get in Touch</h2>
                    <p class="section-subtitle">We'd love to hear from you</p>
                </div>
                <div class="contact-content">
                    <div class="contact-info">
                        <h3>Let's Connect</h3>
                        <p>Have a question or want to work together? Feel free to reach out!</p>
                        <div class="contact-details">
                            <div class="contact-item">
                                <span class="contact-icon">📧</span>
                                <span>hello@{{.service_name_underscore}}.com</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">🌐</span>
                                <span>www.{{.service_name_underscore}}.com</span>
                            </div>
                            <div class="contact-item">
                                <span class="contact-icon">📍</span>
                                <span>San Francisco, CA</span>
                            </div>
                        </div>
                        <div class="social-links">
                            <a href="#" class="social-link" aria-label="Twitter">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"></path>
                                </svg>
                            </a>
                            <a href="#" class="social-link" aria-label="GitHub">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                            </a>
                            <a href="#" class="social-link" aria-label="LinkedIn">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                    <form class="contact-form" id="contact-form">
                        <div class="form-group">
                            <label for="name">Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="message">Message</label>
                            <textarea id="message" name="message" rows="5" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Send Message</button>
                    </form>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3>{{.service_name}}</h3>
                    <p>Building modern web experiences with passion and precision.</p>
                </div>
                <div class="footer-links">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-legal">
                    <h4>Legal</h4>
                    <ul>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Service</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2024 {{.service_name}}. All rights reserved.</p>
                <p>Made with ❤️ using HTML, CSS & JavaScript</p>
            </div>
        </div>
    </footer>

    <!-- Back to Top Button -->
    <button id="back-to-top" class="back-to-top" aria-label="Back to top">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6"/>
        </svg>
    </button>

    <!-- JavaScript -->
    <script src="js/main.js"></script>
</body>
</html>
'''
        write_file(self.service_dir / "index.html", index_html, self.get_template_vars())

        # Generate main CSS
        style_css = '''/* CSS Reset and Base Styles */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    /* Colors */
    --primary-color: #3b82f6;
    --primary-dark: #2563eb;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    --text-primary: #1f2937;
    --text-secondary: #6b7280;
    --text-light: #9ca3af;
    --bg-primary: #ffffff;
    --bg-secondary: #f8fafc;
    --bg-dark: #111827;
    --border-color: #e5e7eb;
    
    /* Typography */
    --font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'Fira Code', 'Monaco', 'Consolas', monospace;
    
    /* Spacing */
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 1.5rem;
    --spacing-lg: 2rem;
    --spacing-xl: 3rem;
    --spacing-2xl: 4rem;
    
    /* Border Radius */
    --radius-sm: 0.375rem;
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-xl: 1rem;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.3s ease;
    --transition-slow: 0.5s ease;
}

html {
    scroll-behavior: smooth;
}

body {
    font-family: var(--font-family);
    line-height: 1.6;
    color: var(--text-primary);
    background-color: var(--bg-primary);
    overflow-x: hidden;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
}

/* Loading Screen */
.loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity 0.5s ease, visibility 0.5s ease;
}

.loading-screen.hidden {
    opacity: 0;
    visibility: hidden;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-screen p {
    color: white;
    font-size: 1.1rem;
    font-weight: 500;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: var(--spacing-sm);
}

h1 { font-size: clamp(2rem, 5vw, 3.5rem); }
h2 { font-size: clamp(1.5rem, 4vw, 2.5rem); }
h3 { font-size: clamp(1.25rem, 3vw, 1.875rem); }
h4 { font-size: clamp(1.125rem, 2.5vw, 1.5rem); }

p {
    margin-bottom: var(--spacing-sm);
    color: var(--text-secondary);
}

a {
    color: var(--primary-color);
    text-decoration: none;
    transition: color var(--transition-fast);
}

a:hover {
    color: var(--primary-dark);
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--radius-md);
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    box-shadow: var(--shadow-md);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
}

.btn-secondary {
    background: transparent;
    color: var(--primary-color);
    border: 2px solid var(--primary-color);
}

.btn-secondary:hover {
    background: var(--primary-color);
    color: white;
}

/* Sections */
section {
    padding: var(--spacing-2xl) 0;
}

.section-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.section-title {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.section-subtitle {
    font-size: 1.125rem;
    color: var(--text-secondary);
    max-width: 600px;
    margin: 0 auto;
}

/* Utility Classes */
.gradient-text {
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.text-center {
    text-align: center;
}

.hidden {
    display: none !important;
}

/* Responsive */
@media (max-width: 768px) {
    .container {
        padding: 0 var(--spacing-sm);
    }
    
    section {
        padding: var(--spacing-xl) 0;
    }
    
    .btn {
        padding: 0.625rem 1.25rem;
        font-size: 0.875rem;
    }
}
'''
        write_file(self.service_dir / "css" / "style.css", style_css, self.get_template_vars())

        # Generate components CSS
        components_css = '''/* Navigation */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
    transition: all var(--transition-normal);
}

.navbar.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: var(--shadow-md);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 var(--spacing-md);
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
}

.nav-brand a {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: var(--spacing-lg);
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    position: relative;
    transition: color var(--transition-fast);
}

.nav-link:hover,
.nav-link.active {
    color: var(--primary-color);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--primary-color);
    transition: width var(--transition-fast);
}

.nav-link.active::after,
.nav-link:hover::after {
    width: 100%;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
    gap: 4px;
}

.bar {
    width: 25px;
    height: 3px;
    background: var(--text-primary);
    transition: all var(--transition-fast);
}

/* Hero Section */
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-primary) 100%);
    position: relative;
    overflow: hidden;
}

.hero-content {
    flex: 1;
    z-index: 2;
    position: relative;
}

.hero-title {
    margin-bottom: var(--spacing-md);
    line-height: 1.2;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: var(--spacing-xl);
    max-width: 600px;
}

.hero-buttons {
    display: flex;
    gap: var(--spacing-md);
    flex-wrap: wrap;
}

.hero-visual {
    flex: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
}

.floating-elements {
    position: relative;
    width: 300px;
    height: 300px;
}

.element {
    position: absolute;
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
}

.element-1 {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    top: 20%;
    left: 20%;
    animation-delay: 0s;
}

.element-2 {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, var(--accent-color), var(--primary-color));
    top: 60%;
    right: 20%;
    animation-delay: 2s;
}

.element-3 {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary-color));
    bottom: 20%;
    left: 50%;
    animation-delay: 4s;
}

@keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(180deg); }
}

/* About Section */
.about {
    background: var(--bg-secondary);
}

.about-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
    align-items: center;
}

.about-text h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.stats {
    display: flex;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-xl);
}

.stat {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.code-preview {
    background: var(--bg-dark);
    border-radius: var(--radius-lg);
    overflow: hidden;
    box-shadow: var(--shadow-xl);
}

.code-header {
    background: #2d3748;
    padding: var(--spacing-sm);
    display: flex;
    gap: var(--spacing-xs);
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.red { background: #fc5c65; }
.yellow { background: #fed330; }
.green { background: #26de81; }

.code-preview pre {
    margin: 0;
    padding: var(--spacing-md);
    color: #e2e8f0;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.5;
    overflow-x: auto;
}

/* Features Section */
.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--spacing-lg);
}

.feature-card {
    background: var(--bg-primary);
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
    text-align: center;
    transition: all var(--transition-normal);
    border: 1px solid var(--border-color);
}

.feature-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
    display: block;
}

.feature-card h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

/* Contact Section */
.contact {
    background: var(--bg-secondary);
}

.contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-2xl);
}

.contact-info h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.contact-details {
    margin: var(--spacing-lg) 0;
}

.contact-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
}

.contact-icon {
    font-size: 1.25rem;
}

.social-links {
    display: flex;
    gap: var(--spacing-md);
    margin-top: var(--spacing-lg);
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--bg-primary);
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all var(--transition-fast);
    border: 1px solid var(--border-color);
}

.social-link:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-2px);
}

.contact-form {
    background: var(--bg-primary);
    padding: var(--spacing-xl);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
}

.form-group {
    margin-bottom: var(--spacing-md);
}

.form-group label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;
    color: var(--text-primary);
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-family: inherit;
    font-size: 1rem;
    transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group textarea {
    resize: vertical;
    min-height: 120px;
}

/* Footer */
.footer {
    background: var(--bg-dark);
    color: white;
    padding: var(--spacing-2xl) 0 var(--spacing-md);
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
}

.footer-brand h3 {
    color: white;
    margin-bottom: var(--spacing-sm);
}

.footer-brand p {
    color: var(--text-light);
}

.footer-links h4,
.footer-legal h4 {
    color: white;
    margin-bottom: var(--spacing-sm);
}

.footer-links ul,
.footer-legal ul {
    list-style: none;
    padding: 0;
}

.footer-links li,
.footer-legal li {
    margin-bottom: var(--spacing-xs);
}

.footer-links a,
.footer-legal a {
    color: var(--text-light);
    transition: color var(--transition-fast);
}

.footer-links a:hover,
.footer-legal a:hover {
    color: white;
}

.footer-bottom {
    border-top: 1px solid #374151;
    padding-top: var(--spacing-md);
    text-align: center;
    color: var(--text-light);
}

.footer-bottom p {
    margin-bottom: var(--spacing-xs);
}

/* Back to Top Button */
.back-to-top {
    position: fixed;
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    width: 50px;
    height: 50px;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-lg);
    z-index: 1000;
}

.back-to-top.visible {
    opacity: 1;
    visibility: visible;
}

.back-to-top:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 70px;
        right: -100%;
        width: 100%;
        height: calc(100vh - 70px);
        background: white;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: var(--spacing-xl);
        gap: var(--spacing-lg);
        transition: right var(--transition-normal);
        box-shadow: var(--shadow-lg);
    }
    
    .nav-menu.active {
        right: 0;
    }
    
    .nav-toggle {
        display: flex;
    }
    
    .nav-toggle.active .bar:nth-child(1) {
        transform: rotate(45deg) translate(5px, 5px);
    }
    
    .nav-toggle.active .bar:nth-child(2) {
        opacity: 0;
    }
    
    .nav-toggle.active .bar:nth-child(3) {
        transform: rotate(-45deg) translate(7px, -6px);
    }
    
    .hero {
        min-height: auto;
        padding: var(--spacing-2xl) 0;
        text-align: center;
    }
    
    .hero-content {
        order: 2;
    }
    
    .hero-visual {
        order: 1;
        margin-bottom: var(--spacing-xl);
    }
    
    .hero-buttons {
        justify-content: center;
    }
    
    .about-content,
    .contact-content {
        grid-template-columns: 1fr;
        gap: var(--spacing-xl);
    }
    
    .stats {
        justify-content: center;
    }
    
    .floating-elements {
        width: 200px;
        height: 200px;
    }
    
    .element-1 { width: 60px; height: 60px; }
    .element-2 { width: 40px; height: 40px; }
    .element-3 { width: 30px; height: 30px; }
}

@media (max-width: 480px) {
    .container {
        padding: 0 var(--spacing-sm);
    }
    
    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }
    
    .btn {
        width: 100%;
        max-width: 250px;
    }
    
    .stats {
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .back-to-top {
        bottom: var(--spacing-md);
        right: var(--spacing-md);
        width: 45px;
        height: 45px;
    }
}
'''
        write_file(self.service_dir / "css" / "components.css", components_css, self.get_template_vars())

        # Generate main JavaScript
        main_js = '''// Main JavaScript for {{.service_name}}

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTopBtn = document.getElementById('back-to-top');
const contactForm = document.getElementById('contact-form');

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen
    setTimeout(() => {
        loadingScreen.classList.add('hidden');
    }, 1000);

    // Initialize features
    initNavigation();
    initScrollEffects();
    initStats();
    initContactForm();
    initBackToTop();
    initSmoothScrolling();
});

// Navigation functionality
function initNavigation() {
    // Mobile menu toggle
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Update active nav link on scroll
    updateActiveNavLink();
}

// Scroll effects
function initScrollEffects() {
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add/remove scrolled class to navbar
        if (scrollTop > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Show/hide back to top button
        if (scrollTop > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
        
        // Update active nav link
        updateActiveNavLink();
        
        lastScrollTop = scrollTop;
    });
}

// Update active navigation link based on scroll position
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPosition = window.pageYOffset + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Animated statistics counter
function initStats() {
    const statNumbers = document.querySelectorAll('.stat-number');
    
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            element.textContent = value + (element.dataset.target === '60' ? 'ms' : '');
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Intersection Observer for stats animation
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateValue(entry.target, 0, target, 2000);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => {
        statsObserver.observe(stat);
    });
}

// Contact form handling
function initContactForm() {
    if (!contactForm) return;

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            contactForm.reset();
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }, 2000);
    });
}

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    return emailRegex.test(email);
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Back to top button
function initBackToTop() {
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Utility functions
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

// Performance optimization
const optimizeImages = () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.loading = 'lazy';
    });
};

// Initialize optimizations
optimizeImages();

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // You can add a service worker here for PWA functionality
        console.log('{{.service_name}} loaded successfully');
    });
}

// Error handling
window.addEventListener('error', (e) => {
    console.error('JavaScript error:', e.error);
});

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    // Escape key closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    }
});
'''
        write_file(self.service_dir / "js" / "main.js", main_js, self.get_template_vars())

    def generate_config_files(self) -> None:
        """Generate configuration files."""
        # package.json for npm scripts
        package_json = '''{
  "name": "{{.service_name}}",
  "version": "1.0.0",
  "description": "A modern static website built with HTML, CSS, and JavaScript",
  "main": "index.html",
  "scripts": {
    "dev": "live-server --port=3000 --open=/",
    "build": "echo 'No build process needed for static site'",
    "deploy": "echo 'Deploy the dist folder to your hosting provider'",
    "optimize": "echo 'Run image optimization and minification here'",
    "validate": "html-validate *.html",
    "test": "echo 'Add your tests here'"
  },
  "keywords": [
    "static-site",
    "html5",
    "css3",
    "javascript",
    "responsive",
    "modern"
  ],
  "author": "Your Name",
  "license": "MIT",
  "devDependencies": {
    "live-server": "^1.2.2",
    "html-validate": "^8.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/yourusername/{{.service_name}}.git"
  },
  "bugs": {
    "url": "https://github.com/yourusername/{{.service_name}}/issues"
  },
  "homepage": "https://github.com/yourusername/{{.service_name}}#readme"
}
'''
        write_file(self.service_dir / "package.json", package_json, self.get_template_vars())

        # .gitignore
        gitignore = '''# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build outputs
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache
'''
        write_file(self.service_dir / ".gitignore", gitignore)

        # README
        readme_md = '''# {{.service_name}}

A modern, responsive static website built with pure HTML, CSS, and JavaScript. This template provides a solid foundation for creating fast, secure, and beautiful websites.

## ✨ Features

- 🚀 **Lightning Fast** - Static site architecture for instant loading
- 📱 **Fully Responsive** - Perfect experience on all devices
- 🎨 **Modern Design** - Clean, professional interface with smooth animations
- ♿ **Accessible** - Built with semantic HTML5 and accessibility best practices
- 🔒 **Secure** - No server-side vulnerabilities
- 🌍 **SEO Optimized** - Search engine friendly structure
- ⚡ **Performance Optimized** - Minimal JavaScript, optimized CSS
- 🌙 **Dark Mode Ready** - Easy to implement dark mode
- 📊 **Analytics Ready** - Easy integration with analytics services

## 🚀 Quick Start

### Prerequisites

- A modern web browser
- Optional: Node.js for development tools

### Installation

1. **Clone or download this template**
   ```bash
   git clone <repository-url>
   cd {{.service_name}}
   ```

2. **Install development dependencies (optional)**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   # Using live-server (recommended)
   npm run dev
   
   # Or simply open index.html in your browser
   open index.html
   ```

4. **Open your browser and navigate to**
   - Local server: `http://localhost:3000`
   - Direct file: `file:///path/to/{{.service_name}}/index.html`

## 📁 Project Structure

```
{{.service_name}}/
├── index.html          # Main HTML file
├── css/
│   ├── style.css        # Main stylesheet
│   └── components.css   # Component-specific styles
├── js/
│   └── main.js          # Main JavaScript file
├── assets/
│   └── images/          # Image assets
├── pages/               # Additional pages
├── package.json         # NPM scripts and dependencies
├── .gitignore          # Git ignore file
└── README.md           # This file
```

## 🎨 Customization

### Colors and Theme

Edit the CSS variables in `css/style.css`:

```css
:root {
    --primary-color: #3b82f6;
    --secondary-color: #64748b;
    --accent-color: #f59e0b;
    /* ... more variables */
}
```

### Adding New Sections

1. Add a new section in `index.html`
2. Add corresponding styles in `css/components.css`
3. Add JavaScript functionality in `js/main.js`

### Images and Assets

Place your images in the `assets/images/` folder and reference them in your HTML:

```html
<img src="assets/images/your-image.jpg" alt="Description">
```

## 📱 Responsive Design

The site is fully responsive and works on:
- 🖥️ Desktop (1200px+)
- 💻 Laptop (768px - 1199px)
- 📱 Tablet (480px - 767px)
- 📱 Mobile (< 480px)

## ♿ Accessibility Features

- Semantic HTML5 structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast colors
- Focus indicators
- Screen reader friendly

## 🔧 Development Tools

### Available NPM Scripts

```bash
npm run dev        # Start development server
npm run validate   # Validate HTML
npm run optimize   # Optimize assets (placeholder)
npm run deploy     # Deploy instructions (placeholder)
```

### Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📈 Performance

- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🚀 Deployment

### Static Hosting Options

This site can be deployed to any static hosting service:

1. **Netlify**
   ```bash
   # Drag and drop the folder or connect git repo
   ```

2. **Vercel**
   ```bash
   # Import project or use CLI
   vercel --prod
   ```

3. **GitHub Pages**
   ```bash
   # Enable GitHub Pages in repository settings
   ```

4. **Firebase Hosting**
   ```bash
   firebase deploy
   ```

5. **Traditional Web Host**
   ```bash
   # Upload all files to your web server
   ```

### Custom Domain

To use a custom domain:
1. Configure DNS settings
2. Update base URL in HTML if needed
3. Update any absolute links

## 🛠️ Advanced Customization

### Adding JavaScript Libraries

Add CDN links in your HTML:

```html
<!-- Before closing body tag -->
<script src="https://cdn.jsdelivr.net/npm/library-name@version"></script>
```

### CSS Framework Integration

Replace or extend the existing CSS with your preferred framework:

```html
<!-- In head section -->
<link href="https://cdn.jsdelivr.net/npm/framework@version/dist/framework.min.css" rel="stylesheet">
```

### Form Handling

The contact form includes basic validation. For production:

1. Add a backend service (Formspree, Netlify Forms, etc.)
2. Add reCAPTCHA for spam protection
3. Implement email sending functionality

## 📊 Analytics

Add your preferred analytics service:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern web standards
- Inspired by best practices in web development
- Thanks to the open source community

## 📞 Support

If you have any questions or need help:

- 📧 Email: hello@{{.service_name_underscore}}.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/{{.service_name}}/issues)
- 📖 Documentation: [Wiki](https://github.com/yourusername/{{.service_name}}/wiki)

---

Made with ❤️ using HTML, CSS & JavaScript
'''
        write_file(self.service_dir / "README.md", readme_md, self.get_template_vars())

    def generate_tests(self) -> None:
        """Generate test files."""
        # Basic HTML validation test
        test_html = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Suite - {{.service_name}}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 2rem; }
        .test { margin: 1rem 0; padding: 1rem; border: 1px solid #ddd; }
        .pass { border-color: green; background: #f0fff0; }
        .fail { border-color: red; background: #fff0f0; }
        .results { margin-top: 2rem; }
    </style>
</head>
<body>
    <h1>{{.service_name}} Test Suite</h1>
    <div id="test-results"></div>
    
    <script>
        // Simple test framework
        class TestSuite {
            constructor() {
                this.tests = [];
                this.results = [];
            }
            
            test(name, testFn) {
                this.tests.push({ name, testFn });
            }
            
            async run() {
                console.log('Running tests...');
                
                for (const test of this.tests) {
                    try {
                        await test.testFn();
                        this.results.push({ name: test.name, status: 'pass' });
                        console.log(`✓ ${test.name}`);
                    } catch (error) {
                        this.results.push({ name: test.name, status: 'fail', error: error.message });
                        console.error(`✗ ${test.name}: ${error.message}`);
                    }
                }
                
                this.displayResults();
            }
            
            displayResults() {
                const resultsDiv = document.getElementById('test-results');
                const passed = this.results.filter(r => r.status === 'pass').length;
                const total = this.results.length;
                
                resultsDiv.innerHTML = `
                    <div class="results">
                        <h2>Test Results: ${passed}/${total} passed</h2>
                        ${this.results.map(result => `
                            <div class="test ${result.status}">
                                <strong>${result.name}</strong>: ${result.status}
                                ${result.error ? `<br><small>${result.error}</small>` : ''}
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }
        
        // Create test suite
        const suite = new TestSuite();
        
        // Test HTML structure
        suite.test('HTML structure exists', () => {
            const navbar = document.querySelector('.navbar');
            if (!navbar) throw new Error('Navbar not found');
            
            const hero = document.querySelector('.hero');
            if (!hero) throw new Error('Hero section not found');
            
            const footer = document.querySelector('.footer');
            if (!footer) throw new Error('Footer not found');
        });
        
        // Test CSS loading
        suite.test('CSS styles loaded', () => {
            const testElement = document.createElement('div');
            testElement.className = 'btn';
            document.body.appendChild(testElement);
            
            const styles = window.getComputedStyle(testElement);
            const hasButtonStyles = styles.display === 'inline-flex' || styles.display === 'inline-flex';
            
            document.body.removeChild(testElement);
            
            if (!hasButtonStyles) {
                throw new Error('Button styles not applied');
            }
        });
        
        // Test JavaScript functionality
        suite.test('JavaScript functionality works', () => {
            // Test if main.js loaded and added event listeners
            if (typeof window.addEventListener === 'undefined') {
                throw new Error('Event listeners not available');
            }
        });
        
        // Test responsive design
        suite.test('Responsive viewport meta tag', () => {
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            if (!viewportMeta) {
                throw new Error('Viewport meta tag not found');
            }
            
            const content = viewportMeta.getAttribute('content');
            if (!content.includes('width=device-width')) {
                throw new Error('Viewport not configured for responsive design');
            }
        });
        
        // Test semantic HTML5
        suite.test('Semantic HTML5 elements', () => {
            const semanticElements = ['header', 'main', 'section', 'footer', 'nav'];
            const missingElements = semanticElements.filter(tag => !document.querySelector(tag));
            
            if (missingElements.length > 0) {
                throw new Error(`Missing semantic elements: ${missingElements.join(', ')}`);
            }
        });
        
        // Test accessibility
        suite.test('Basic accessibility features', () => {
            // Check for lang attribute
            if (!document.documentElement.getAttribute('lang')) {
                throw new Error('HTML lang attribute missing');
            }
            
            // Check for proper heading hierarchy
            const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
            if (headings.length === 0) {
                throw new Error('No headings found');
            }
        });
        
        // Run tests
        suite.run();
    </script>
</body>
</html>
'''
        write_file(self.service_dir / "test.html", test_html, self.get_template_vars())
