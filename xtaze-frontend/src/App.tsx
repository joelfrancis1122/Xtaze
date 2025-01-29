import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Signup from './pages/SignUp';  // Import the Signup component
import { Toaster } from 'sonner';
import SignupFormDemo from './pages/SignIn';
// import la from './components/ui/label';  // Import the Signup component
// import Login from './pages/Login';    // Import the Login component (you can create this page)

const App = () => {
  return (
    <Router >
      <Toaster/>

      <Routes>
        <Route path="/" element={<Signup />} />
        {/* <Route path="/a" element={<la />} /> */}
        <Route path="/login" element={<SignupFormDemo />} />
      </Routes>
    </Router>
  );
};

export default App;
