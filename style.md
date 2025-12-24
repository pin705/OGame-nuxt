1. Core Visual Identity
* Theme Name: Neo-OGame Modern (Dark Sci-Fi / Cyberpunk Minimalism)
* Concept: Một trạm chỉ huy vũ trụ hiện đại với giao diện kính mờ (Glassmorphism), tập trung vào dữ liệu thời gian thực và trải nghiệm mượt mà.
2. Color Palette (Hex Codes)
* Backgrounds:
    * Primary-Dark: #0B0E14 (Deep space background)
    * Surface-Dark: #161B22 (Card and panel backgrounds)
    * Overlay: rgba(22, 27, 34, 0.8) (Glassmorphism effect with 10px blur)
* Accents:
    * Primary-Cyan: #00D1FF (Main action, energy, links)
    * Success-Green: #00F59B (Upgrades, production, positive growth)
    * Alert-Red: #FF4D4D (Incoming attack, critical warnings)
    * Warning-Amber: #FFB800 (Low resources, fleet in transit)
    * Neutral-Gray: #8E9297 (Secondary text, inactive states)
* Text:
    * Text-Primary: #E0E0E0 (High readability)
    * Text-Secondary: #9DA3AE (Metadata, labels)
3. Typography
* Headings (Titles, Planet Names): Orbitron, sans-serif (Sci-fi, geometric)
* Body & Controls: Rajdhani, sans-serif (Condensed, futuristic)
* Data & Numbers: JetBrains Mono or Roboto Mono (Monospaced to prevent layout shift during resource counting)
4. UI Components Specification
* Buttons:
    * Border-radius: 2px (Sharp corners for military feel) or 0px with a 45-degree corner cut (clipped-path).
    * Background: Transparent with a 1px neon border.
    * Hover: Background fills with the accent color + subtle outer glow (box-shadow: 0 0 15px).
* Cards/Panels:
    * Border: 1px solid rgba(255, 255, 255, 0.1)
    * Backdrop-filter: blur(12px)
* Progress Bars:
    * Height: 4px (Thin and sleek)
    * Glow: Active bar should have a subtle neon glow.
5. Mobile-Specific Rules
* Navigation: Bottom-docked Tab Bar (Height: 64px).
* Touch Targets: Minimum 44x44px.
* Interactions: Use horizontal swipe for switching between planets.
* Layout: Resource bar is pinned to the top; main action (Build/Fleet) is pinned to the bottom thumb zone.
6. CSS/Tailwind Guidelines for Copilot
When generating code, please follow these conventions:
* Use Tailwind CSS for all styling.
* Background Blur: Use backdrop-blur-md.
* Transitions: Use transition-all duration-300 ease-in-out.
* Gradients: Use linear gradients from Surface-Dark to a slightly lighter shade for depth.
* Icons: Use Lucide-React or Phosphor Icons (Line style only).
