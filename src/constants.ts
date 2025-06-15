import * as THREE from "three";
import { TextureLoader } from "three";

// Asset loading
export const textures = {
  aboutMe: new TextureLoader().load("/textures/jupiter.jpg"),
  experience: new TextureLoader().load("/textures/earth.jpg"),
  projects: new TextureLoader().load("/textures/eris.jpg"),
  skills: new TextureLoader().load("/textures/mars.jpg"),
  contact: new TextureLoader().load("/textures/neptune.jpg"),
  hobbies: new TextureLoader().load("/textures/mecidica.jpg"),
  education: new TextureLoader().load("/textures/Volcanic.png"),
  moon: new TextureLoader().load("/textures/moon.jpg"),
  sun: new TextureLoader().load("/textures/sun.jpg"),
  galaxyBackground: new TextureLoader().load("/textures/galaxy_background.jpg"),
};

// Interface definitions
export interface Moon {
  name: string;
  description: string;
}

export interface OrbitData {
  radius: number;
  name: string;
  texture?: THREE.Texture;
  moons?: Moon[];
  isAsteroidBelt?: boolean;
}

// Main Resume Data Structure
export const orbits: OrbitData[] = [
  {
    radius: 8,
    name: "About Me",
    texture: textures.aboutMe,
    moons: [
      {
        name: "Summary",
        description:
          "Full Stack Developer | B.Tech CS Undergraduate | MERN & Modern Web Tech Enthusiast | Data & Product-Driven Thinker | Tech x Finance x Impact. Hello! I'm a motivated and curious Computer Science undergraduate with a strong foundation in software development, a passion for building real-world products, and a growing interest in the intersection of technology, finance, and data.",
      },
      {
        name: "Interests",
        description:
          "I'm passionate about solving real-world problems through tech—especially at the crossroads of data, product, and finance. I'm fascinated by how software can enhance financial access, optimize operations, and deliver smarter insights. Looking Ahead: Eager to contribute to innovative, impact-driven teams where I can apply my full stack development skills, keep learning, and help build technology that matters.",
      },
    ],
  },
  {
    radius: 14,
    name: "Experience",
    texture: textures.experience,
    moons: [
      {
        name: "Antarctica Global",
        description:
          "Full-stack Developer (Dec 2023 - May 2025)\nWorked as a Full Stack Developer handling both frontend and backend responsibilities, building scalable and feature-rich web applications end to end. Contributed independently and collaboratively on multiple production-grade tools and platforms.\nKey Projects:\n1. Healthcare Field Operations Platform (Lead Developer – Solo Project): Built a location-aware field operations platform for the healthcare industry. Enabled live tracking of personnel, vehicles, and equipment using geolocation and environmental sensors (temperature, humidity, pressure). Created an alert system with configurable thresholds and real-time notifications via email, in-app, SMS, and push. Implemented geofencing to restrict activity in predefined zones. Developed as a responsive web app with mobile and PWA support.\n2. Workflow and Project Coordination Tools with Google Integrations: Built tools for managing team workflows, task tracking, and analytics integrated with Google services. Enabled seamless scheduling with Google Calendar and other APIs. Designed dashboards using Nivo charts to visualize metrics like bug-to-task ratio and time allocation. Supported features like messaging, permissions, and timeline views.\n3. Interactive SEO-Optimized Websites & Education Tools: Developed high-performance, SEO-friendly websites using SSR/SSG with Next.js and NestJS. Optimized for accessibility and core web vitals. Built interactive, animation-rich UIs with Framer Motion and 3JS. Contributed to an e-learning platform and a digital carbon footprint visualization tool.\n4. Inventory & Shipment Tracking Platform: Helped develop a logistics system for tracking inventory and fleet movement. Built dashboards for monitoring truck routes and stock levels. Integrated real-time mapping and live updates for operational visibility.",
      },
      {
        name: "OCR Services Inc.",
        description:
          "Full-stack Developer (Sep 2022 - Jun 2023)\nWorked as a Full Stack Developer specializing in both front-end and back-end technologies using Java. Designed, developed, and maintained software applications, ensuring a seamless and secure user experience across all layers.\nKey Responsibilities:\nFront-End Development: Collaborated with UI/UX designers to create visually appealing and intuitive user interfaces. Utilized HTML, CSS, JavaScript, and frameworks like Angular, React, and Vue.js to build dynamic, interactive web pages.\nBack-End Development: Developed robust server-side logic using Java and frameworks like Spring, Hibernate, and Apache Struts. Built and maintained RESTful APIs for efficient data exchange between the front-end and back-end. Managed databases (MySQL, Oracle, MongoDB) for efficient data storage and retrieval.\nSecurity & Authentication: Implemented authentication and authorization mechanisms to ensure secure access to the application.\nCollaboration & Integration: Worked closely with developers, testers, and system admins to ensure smooth integration and deployment of software. Actively participated in code reviews, unit testing, and debugging to ensure stability and performance.\nSoftware Documentation & Best Practices: Adhered to industry best practices and coding standards, documenting design and implementation details for future maintenance.",
      },
      {
        name: "ACES MITSOE",
        description:
          "Website Developer (Jun 2020 - Jul 2021)\nLed a team of 6 undergrad students to develop a fully responsive website for the institution. Managed all aspects of the project, from initial design to post-launch maintenance, honing both technical and leadership skills.\nKey Responsibilities:\nLeadership & Team Management: Led a team of 6 engineers, coordinating tasks, providing mentorship, and ensuring timely project completion. Delegated tasks based on team members' strengths, fostering collaboration and growth.\nWeb Development: Oversaw the design and development of a fully responsive website, ensuring it was capable of individual user profiling. Managed both front-end and back-end tasks, ensuring a seamless user experience across devices.\nPost-Launch Maintenance & Updates: After launch, dedicated 4 months to maintaining and updating the website for seasonal changes, ensuring the site stayed relevant and functional.",
      },
    ],
  },
  {
    radius: 20,
    name: "Skills",
    texture: textures.skills,
    moons: [
      {
        name: "Top Skills",
        description: "Full-Stack Development | Node.js | NestJS",
      },
      {
        name: "Languages",
        description: "Hindi (Full Professional) | English (Full Professional)",
      },
    ],
  },
  {
    radius: 26,
    name: "Asteroid Belt",
    isAsteroidBelt: true,
  },
  {
    radius: 32,
    name: "Certifications",
    texture: textures.projects,
    moons: [
      {
        name: "Certifications",
        description:
          "Advanced HTML5 and CSS3 | Sass CSS | Ruby Programming | React and advanced JavaScript | Web Development path using Ruby on Rails environment",
      },
    ],
  },
  {
    radius: 38,
    name: "Contact",
    texture: textures.contact,
    moons: [
      {
        name: "Email",
        description: "Siddhantwelinkar@gmail.com",
      },
      {
        name: "LinkedIn",
        description: "www.linkedin.com/in/siddhant-welinkar-180a83226",
      },
    ],
  },
  {
    radius: 50,
    name: "Education",
    texture: textures.education,
    moons: [
      {
        name: "MIT ADT University",
        description:
          "Bachelor of Engineering - BE, Computer Science (Jun 2018 - Jun 2022)",
      },
      {
        name: "The Bishop's School",
        description: "ICSE, High School (Jun 2003 - Jun 2016)",
      },
    ],
  },
];

// Avatar tooltips
export const avatarTooltips = [
  "🚀 Full-Stack Dev with 3+ years experience",
  "🌐 Built scalable apps with MERN & Next.js",
  "🔐 Expert in secure backend API design",
  "🧠 Loves solving complex system architecture",
  "☁️ Skilled in AWS, Docker, Firebase",
  "🎓 BTech from MIT ADT, Pune",
  "📈 Optimized SSR to reduce load times by 40%",
  "🧑‍💻 Contributor to open source on GitHub",
  "📊 Deep learning + trading enthusiast",
  "🛠️ Microservices and monolith killer",
];
