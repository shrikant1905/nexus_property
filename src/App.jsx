import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './hooks/useAuth';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </MotionConfig>
  );
}
