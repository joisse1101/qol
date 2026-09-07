import { BrowserRouter, Routes, Route } from 'react-router-dom';
import "@joisse1101/ui-library/ui-library.css";
import './styles/main.scss';
import 'sonner/dist/styles.css';
import { MainLayout } from '@/layouts/MainLayout';

import Home from './pages/Home';
import GrannySquare from './pages/projects/GrannySquare';
import GoalTracker from './pages/projects/GoalTracker';
import TheLog from './pages/projects/TheLog';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <BrowserRouter> 
      <Toaster />
      <Routes>
        {/* Parent route using the layout */}
        <Route path="/qol" element={<MainLayout />}>
          {/* <Route path="about" element={<About />} /> */}
          <Route path="" element={<Home />} />
          <Route path="goal-tracker" element={<GoalTracker />} />
          <Route path="the-log" element={<TheLog />} />
          <Route path="granny-square" element={<GrannySquare />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}