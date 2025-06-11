import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard as the main entry point
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return null;
};

export default Home;