import { useState } from 'react';
import { useGame } from '../context/GameContext';

export function CreateTeam() {
  const { dispatch } = useGame();
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['']);

  const addMember = () => setMembers([...members, '']);
  const removeMember = (index: number) => {
    if (members.length > 1) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };
  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validMembers = members.map((m) => m.trim()).filter(Boolean);
    if (!teamName.trim() || validMembers.length === 0) return;
    dispatch({ type: 'CREATE_TEAM', team: { name: teamName.trim(), members: validMembers } });
  };

  const isValid = teamName.trim() && members.some((m) => m.trim());

  return (
    <div className="screen">
      <h1>Marian 30v synttärisuunnistus</h1>
      <div className="story-text">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum
          auctor nisi vel magna tincidunt, in fermentum libero gravida. Sed
          malesuada justo at risus cursus, vel facilisis nulla ultrices.
        </p>
        <p>
          Pellentesque habitant morbi tristique senectus et netus et malesuada
          fames ac turpis egestas. Integer vel velit in odio posuere blandit
          eget nec arcu. Cras pharetra lorem a lectus consequat viverra.
        </p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="teamName">Joukkueen nimi</label>
          <input
            id="teamName"
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Syötä joukkueen nimi"
            autoFocus
          />
        </div>
        <div className="field">
          <label>Jäsenet</label>
          {members.map((member, i) => (
            <div key={i} className="member-row">
              <input
                type="text"
                value={member}
                onChange={(e) => updateMember(i, e.target.value)}
                placeholder={`Jäsen ${i + 1}`}
              />
              {members.length > 1 && (
                <button type="button" className="btn-icon" onClick={() => removeMember(i)}>
                  &times;
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn-secondary" onClick={addMember}>
            + Lisää jäsen
          </button>
        </div>
        <button type="submit" className="btn-primary" disabled={!isValid}>
          Aloita kilpailu
        </button>
      </form>
      <button
        type="button"
        className="btn-clear"
        onClick={() => {
          localStorage.removeItem('suunnistus-game');
          window.location.reload();
        }}
      >
        Tyhjennä tallennetut tiedot
      </button>
    </div>
  );
}
