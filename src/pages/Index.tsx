
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Zap, ArrowRight } from 'lucide-react';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-pink-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="text-center relative z-10 px-4">
        {/* Logo */}
        <div className="mx-auto mb-8 w-20 h-20 bg-gradient-cyber rounded-full flex items-center justify-center glow-cyan">
          <Zap className="w-10 h-10 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gradient mb-4">
          TaskNova
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          The future of task management is here. Experience productivity like never before with our 
          cutting-edge, cyberpunk-inspired interface.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          {[
            { title: 'Smart Organization', description: 'AI-powered task categorization' },
            { title: 'Futuristic UI', description: 'Cyberpunk-inspired design' },
            { title: 'Team Collaboration', description: 'Real-time project management' }
          ].map((feature, index) => (
            <div key={index} className="glass p-6 rounded-lg border border-slate-700/50 hover:glow-cyan transition-all">
              <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => navigate('/auth')}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white px-8 py-6 text-lg font-semibold glow-cyan transition-all transform hover:scale-110"
        >
          Enter the Future
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Index;
