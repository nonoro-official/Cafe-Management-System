import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import router from './routes/index.jsx';

const App = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
