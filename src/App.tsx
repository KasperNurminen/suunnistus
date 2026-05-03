import { useGame } from './context/GameContext';
import { CreateTeam } from './components/CreateTeam';
import { ActiveGame } from './components/ActiveGame';
import { Results } from './components/Results';

function App() {
  const { state } = useGame();

  switch (state.phase) {
    case 'create-team':
      return <CreateTeam />;
    case 'active':
      return <ActiveGame />;
    case 'results':
      return <Results />;
  }
}

export default App;
