import { RouterProvider } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext.jsx';
import router from './routes/index.jsx';

const App = () => {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
};

export default App;
