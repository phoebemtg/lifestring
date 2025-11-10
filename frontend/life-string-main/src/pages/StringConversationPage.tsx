import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import StringConversation from '../components/StringConversation';

const StringConversationPage: React.FC = () => {
  const { stringId } = useParams<{ stringId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get initial message from location state
  const initialMessage = location.state?.initialMessage || '';
  const selectedOrbColor = location.state?.selectedOrbColor || '#3B82F6';

  const handleBack = () => {
    navigate('/');
  };

  if (!stringId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">String not found</h1>
          <button 
            onClick={handleBack}
            className="text-blue-600 hover:text-blue-800"
          >
            Go back to Strings
          </button>
        </div>
      </div>
    );
  }

  return (
    <StringConversation
      stringId={stringId}
      initialMessage={initialMessage}
      onBack={handleBack}
      selectedOrbColor={selectedOrbColor}
    />
  );
};

export default StringConversationPage;
