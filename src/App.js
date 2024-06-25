import GoogleLogin from './components/GoogleLogin';
import EmailList from './components/EmailList';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<GoogleLogin />} />
        <Route path='/emails' element={<EmailList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
