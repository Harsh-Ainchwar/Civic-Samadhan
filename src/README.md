# CivicSamadhan - Civic Reporting Platform

A comprehensive civic reporting platform that allows citizens to report municipal issues and enables administrators to manage and resolve them efficiently.

## Features

### For Citizens

- **Issue Reporting**: Report potholes, broken streetlights, graffiti, and other municipal issues
- **Personal Dashboard**: Track your submitted reports and their status
- **Community Impact**: View city-wide statistics and community engagement metrics
- **Real-time Updates**: Get notifications when your reports are updated

### For Administrators

- **Comprehensive Management**: Full complaint management with status workflows
- **Staff Assignment**: Assign reports to specific team members
- **Priority Management**: Set and manage priority levels for efficient resource allocation
- **Internal Notes**: Add private notes for team coordination
- **Advanced Filtering**: Filter reports by status, priority, category, and assignment

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/yourusername/civicsamadhan-civic-platform.git
   cd civicsamadhan-civic-platform
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the \`dist\` directory.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

### Netlify

1. Push your code to GitHub
2. Connect your repository to [Netlify](https://netlify.com)
3. Set build command to \`npm run build\`
4. Set publish directory to \`dist\`

### GitHub Pages

1. Enable GitHub Pages in repository settings
2. Use GitHub Actions for automated deployment

## Project Structure

\`\`\`
├── components/ # React components
│ ├── ui/ # shadcn/ui components
│ ├── admin-dashboard.tsx
│ ├── citizen-dashboard.tsx
│ └── ...
├── styles/ # Global CSS styles
├── App.tsx # Main application component
└── package.json
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature-name\`
3. Make your changes and commit them: \`git commit -m 'Add feature'\`
4. Push to the branch: \`git push origin feature-name\`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- User authentication and authorization
- Real-time notifications
- Data persistence with backend integration
- Mobile app development
- Advanced analytics and reporting
- Integration with municipal systems