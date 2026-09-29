import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ProfilePage } from './pages/ProfilePage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { TeamGeneratorPage } from './pages/TeamGeneratorPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ResearchPage } from './pages/ResearchPage';
import { Project } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedProjectForGen, setSelectedProjectForGen] = useState<Project | null>(null);

  const handleSelectProjectForGeneration = (project: Project) => {
    setSelectedProjectForGen(project);
    setCurrentTab('generator');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage onNavigate={setCurrentTab} />;
      case 'login':
        return <LoginPage onNavigate={setCurrentTab} />;
      case 'register':
        return <RegisterPage onNavigate={setCurrentTab} />;
      case 'profile':
        return <ProfilePage />;
      case 'assessments':
        return <AssessmentPage />;
      case 'projects':
        return <ProjectsPage onSelectProjectForGeneration={handleSelectProjectForGeneration} />;
      case 'discovery':
        return <DiscoveryPage />;
      case 'generator':
        return <TeamGeneratorPage initialProject={selectedProjectForGen} />;
      case 'explainability':
        return <ExplainabilityPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'research':
        return <ResearchPage />;
      default:
        return <LandingPage onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-page text-fg font-sans antialiased">
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      <main className="flex-1">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
