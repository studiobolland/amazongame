import { useEffect, useState } from 'react';
import Papa from 'papaparse';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-webgl2';

const SCENARIO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=1742593725&single=true&output=csv';
const RESPONSE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=1670179409&single=true&output=csv';

// --- SOUND EFFECTS (SFX) CONFIGURATION ---
// Easily swap these URLs with any direct link to an mp3 or wav file!
const SFX_URLS = {
  hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',     // Subtle UI tick
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',     // Solid button press
  popup: 'https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3',     // Swoosh for speech bubbles
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',   // Positive chime for points
  fail: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',      // Error buzz for losing points
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'   // Fanfare for end screen
};

const playSound = (type) => {
  if (SFX_URLS[type]) {
    const audio = new Audio(SFX_URLS[type]);
    audio.volume = 0.3; // Kept at 30% volume so it isn't deafening
    audio.play().catch(e => console.log("Audio blocked by browser autoplay policy until interacted with."));
  }
};

// --- HELPER: Safely find keys even with hidden line breaks, typos, or trailing spaces ---
const getFuzzyKey = (obj, targetKey) => {
  if (!obj) return undefined;
  const normalize = (str) => String(str).replace(/\s+/g, ' ').trim().toLowerCase();
  const normalizedTarget = normalize(targetKey);
  const foundKey = Object.keys(obj).find(k => normalize(k) === normalizedTarget);
  return foundKey ? obj[foundKey] : undefined;
};

const cleanCharName = (name) => {
  if (!name || String(name).trim().toUpperCase() === 'N/A') return 'None';
  return String(name).replace(/\s*\([^)]*\)/gi, '').trim() || 'None';
};

// --- 1. MAIN MENU ---
function MainMenu({ onStart }) {
  // Simple state to hold the selected language for now
  const [language, setLanguage] = useState('English');

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px', textAlign: 'center', padding: '0 20px' }}>Trust Communication Ops - The Shift</h1>
      
      {/* 👇 NEW: Language Selector Placeholder */}
      <div style={{ marginBottom: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
        <label htmlFor="language-select" style={{ fontSize: '1.1rem', color: '#666' }}>Choose your language:</label>
        <select 
          id="language-select"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            padding: '10px 15px', 
            fontSize: '1.1rem', 
            borderRadius: '8px', 
            border: '2px solid #ddd', 
            backgroundColor: '#f8f9fa', 
            color: '#333',
            cursor: 'pointer',
            outline: 'none',
            minWidth: '200px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <option value="English">English</option>
          <option value="Spanish">Español (Spanish)</option>
          <option value="French">Français (French)</option>
          <option value="German">Deutsch (German)</option>
          <option value="Mandarin">中文 (Mandarin)</option>
        </select>
      </div>

      <button 
        className="standard-button" 
        onMouseEnter={() => playSound('hover')} // Assumes your playSound function is still active
        onClick={() => { playSound('click'); onStart(); }} 
        style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
      >
        Start Game
      </button>
    </div>
  );
}

// --- 1.5 INSTRUCTIONS SCREEN ---
function InstructionsScreen({ onBegin }) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333', padding: '20px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '600px', width: '100%', backgroundColor: '#f8f9fa', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', textAlign: 'center', color: '#ff9900' }}>How to Play</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '1.2rem', lineHeight: '1.5', marginBottom: '30px' }}>
          <p style={{ margin: 0 }}><strong>🏢 The Setup:</strong> You will be given various workplace scenarios to read and understand.</p>
          <p style={{ margin: 0 }}><strong>👆 Your Task:</strong> Choose the most appropriate response from 3 multiple-choice options.</p>
          <p style={{ margin: 0 }}><strong>💯 Scoring:</strong> Depending on your choice, you will receive <strong>+50</strong>, <strong>0</strong>, or <strong>-20</strong> points.</p>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '40px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '1.3rem', textAlign: 'center' }}>🏆 Final Score Key</h3>
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '1.1rem' }}>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Below 0:</span> <strong style={{ color: '#d9534f' }}>Terrible</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>0 - 50:</span> <strong style={{ color: '#f0ad4e' }}>Poor</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>51 - 150:</span> <strong style={{ color: '#5bc0de' }}>Average</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>151 - 250:</span> <strong style={{ color: '#0275d8' }}>Great</strong></li>
            <li style={{ display: 'flex', justifyContent: 'space-between' }}><span>Above 250:</span> <strong style={{ color: '#5cb85c' }}>Excellent</strong></li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={() => { playSound('click'); onBegin(); }} 
            style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
          >
            Let's Begin
          </button>
        </div>
      </div>
    </div>
  );
}

// --- 2. GAME COMPONENT ---
function Game() {
  const [scenarios, setScenarios] = useState([]);
  const [responses, setResponses] = useState([]);
  
  const [scenarioRowIndex, setScenarioRowIndex] = useState(0); 
  const [gamePhase, setGamePhase] = useState('scenario_step'); 
  const [selectedResponse, setSelectedResponse] = useState(null); 
  const [totalPoints, setTotalPoints] = useState(0);
  const [isRiveReady, setIsRiveReady] = useState(false);
  
  const [history, setHistory] = useState([]);

  const { rive, RiveComponent } = useRive({
    src: '/game.riv', 
    artboard: 'MAIN',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Layout, alignment: Alignment.Center }),
    onLoad: () => setIsRiveReady(true)
  });

  // DATA FETCHING
  useEffect(() => {
    const cacheBuster = `&t=${new Date().getTime()}`; 

    Papa.parse(SCENARIO_CSV_URL + cacheBuster, { 
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => setScenarios(results.data)
    });
    
    Papa.parse(RESPONSE_CSV_URL + cacheBuster, { 
      download: true, header: true, skipEmptyLines: true,
      complete: (results) => setResponses(results.data)
    });
  }, []);

  // RIVE UPDATES
  useEffect(() => {
    if (!isRiveReady || !rive || scenarios.length === 0) return;
    const viewModel = rive.viewModelInstance;
    if (!viewModel) return;

    if (gamePhase === 'end_screen') {
      playSound('complete');
      return;
    }

    const currentScenarioRow = scenarios[scenarioRowIndex];
    if (!currentScenarioRow) return;

    try {
      if (gamePhase === 'scenario_step') {
        viewModel.enum('setting_enum').value = String(getFuzzyKey(currentScenarioRow, 'Setting') || 'Fulfilment Centre').trim();
        
        const charRawString = String(getFuzzyKey(currentScenarioRow, 'Character(s)') || getFuzzyKey(currentScenarioRow, 'Characters') || '');
        const rawChars = charRawString.split(',').map(c => c.trim()).filter(Boolean);
        const inSceneChars = rawChars.map(cleanCharName);
        
        viewModel.enum('char_1_enum').value = inSceneChars[0] || 'None';
        viewModel.enum('char_2_enum').value = inSceneChars[1] || 'None';
        viewModel.enum('char_3_enum').value = inSceneChars[2] || 'None';

        const popupChar = cleanCharName(getFuzzyKey(currentScenarioRow, 'Pop-Up Character') || getFuzzyKey(currentScenarioRow, 'Set-up Character'));
        const activeChar = cleanCharName(getFuzzyKey(currentScenarioRow, 'Active Character'));
        
        viewModel.enum('active_character').value = activeChar !== 'None' ? activeChar : popupChar;
        viewModel.enum('popup_char_enum').value = popupChar;
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(currentScenarioRow, 'Pop-Up Type') || getFuzzyKey(currentScenarioRow, 'Set-up Type') || 'None').trim();
        viewModel.enum('emotion_enum').value = String(getFuzzyKey(currentScenarioRow, 'Emotion') || 'Neutral').trim();
        viewModel.string('dialogue_text').value = String(getFuzzyKey(currentScenarioRow, 'Set-up Text') || getFuzzyKey(currentScenarioRow, 'Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        viewModel.enum('emotion_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        viewModel.enum('emotion_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'insight' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.string('insight_text').value = String(getFuzzyKey(selectedResponse, 'Click to reveal') || '').trim();
        viewModel.trigger('show_insight').trigger();
        playSound('popup');
      }
    } catch (error) {
      console.error("❌ Error setting Rive properties:", error);
    }
  }, [rive, isRiveReady, scenarioRowIndex, gamePhase, scenarios, selectedResponse, totalPoints]);

  // --- LOGIC CHECKS FOR OPTIONS ---
  const currentScenarioRow = scenarios[scenarioRowIndex] || {};
  const rawResponseValue = getFuzzyKey(currentScenarioRow, 'Responses');
  const responsesTextStr = rawResponseValue ? String(rawResponseValue).trim().toUpperCase() : '';
  const hasOptions = responsesTextStr !== '' && responsesTextStr !== 'NA' && responsesTextStr !== 'N/A';

  const responseNumberMatch = String(rawResponseValue).match(/\d+/);
  const optionMatchNumber = responseNumberMatch ? parseInt(responseNumberMatch[0], 10) : null;

  const displayScenarioText = getFuzzyKey(currentScenarioRow, 'Scenario') || '1';

  const currentOptions = hasOptions 
    ? responses.filter(r => {
        const optVal = getFuzzyKey(r, 'Option') || '';
        const match = String(optVal).match(/\d+/);
        const parsedOpt = match ? parseInt(match[0], 10) : null;
        return parsedOpt === optionMatchNumber;
      })
    : [];

  const questionText = currentOptions.length > 0 ? getFuzzyKey(currentOptions[0], 'Question') : null;

  // --- HISTORY & STATE MANAGEMENT ---
  const saveHistoryState = () => {
    setHistory(prev => [...prev, {
      scenarioRowIndex,
      gamePhase,
      selectedResponse,
      totalPoints
    }]);
  };

  const handleBack = () => {
    playSound('click');
    if (history.length === 0) return;
    
    const newHistory = [...history];
    const previousState = newHistory.pop();
    setHistory(newHistory);

    if (gamePhase === 'insight' || gamePhase === 'end_screen') {
      if (rive && rive.viewModelInstance) {
        rive.viewModelInstance.trigger('hide_insight').trigger();
      }
    }

    setScenarioRowIndex(previousState.scenarioRowIndex);
    setGamePhase(previousState.gamePhase);
    setSelectedResponse(previousState.selectedResponse);
    setTotalPoints(previousState.totalPoints);
  };

  const handleReplay = () => {
    playSound('click');
    if (rive && rive.viewModelInstance) {
      rive.viewModelInstance.enum('popup_type_enum').value = 'None';
      rive.viewModelInstance.trigger('hide_insight').trigger();
    }
    
    setTimeout(() => {
      setScenarioRowIndex(0);
      setGamePhase('scenario_step');
      setSelectedResponse(null);
      setTotalPoints(0);
      setHistory([]);
    }, 150); 
  };

  // --- UI HANDLERS ---
  const handleNextScenarioStep = () => {
    playSound('click');
    saveHistoryState();
    if (hasOptions) {
      setGamePhase('options');
    } else {
      if (scenarioRowIndex < scenarios.length - 1) {
        setScenarioRowIndex(prev => prev + 1); 
      } else {
        setGamePhase('end_screen');
      }
    }
  };

  const handleOptionSelect = (responseRow) => {
    playSound('click');
    saveHistoryState();
    setSelectedResponse(responseRow);
    setGamePhase('response1');
  };

  const handleContinueToResp2 = () => {
    playSound('click');
    saveHistoryState();
    
    const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
    const pointsMatch = String(rawPoints).match(/-?\d+/);
    const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
    
    // Play SFX based on points gained!
    if (pointsGained > 0) playSound('success');
    else if (pointsGained < 0) playSound('fail');

    setTotalPoints(prev => prev + pointsGained);
    setGamePhase('response2');
  };

  const handleContinueToInsight = () => {
    playSound('click');
    saveHistoryState();
    setGamePhase('insight');
  };
  
  const handleNextScenario = () => {
    playSound('click');
    saveHistoryState();
    rive.viewModelInstance.trigger('hide_insight').trigger();
    if (scenarioRowIndex < scenarios.length - 1) {
      setScenarioRowIndex(prev => prev + 1); 
      setGamePhase('scenario_step');
      setSelectedResponse(null);
    } else {
      setGamePhase('end_screen');
    }
  };

  const isLoading = !isRiveReady || scenarios.length === 0 || responses.length === 0;

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
      
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          <h2>Loading Simulation...</h2>
        </div>
      )}

      {/* END SCREEN OVERLAY */}
      {gamePhase === 'end_screen' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          
          <h1 style={{ fontSize: '4rem', margin: '0 0 30px 0', lineHeight: '1.2' }}>Shift Complete!</h1>
          
          <p style={{ fontSize: '2rem', margin: '0 0 15px 0', color: '#666' }}>
            Final Score: <strong style={{ color: '#ff9900' }}>{totalPoints}</strong>
          </p>
          
          {/* Score Ranking Display */}
          <p style={{ fontSize: '1.8rem', margin: '0 0 50px 0', fontWeight: 'bold' }}>
            Rating: <span style={{ 
              color: totalPoints < 0 ? '#d9534f' : 
                     totalPoints <= 50 ? '#f0ad4e' : 
                     totalPoints <= 150 ? '#5bc0de' : 
                     totalPoints <= 250 ? '#0275d8' : '#5cb85c' 
            }}>
              {totalPoints < 0 ? 'Terrible' : 
               totalPoints <= 50 ? 'Poor' : 
               totalPoints <= 150 ? 'Average' : 
               totalPoints <= 250 ? 'Great' : 'Excellent'}
            </span>
          </p>

          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={handleReplay} 
            style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
          >
            Replay Game
          </button>

        </div>
      )}

      <RiveComponent style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }} />

      {!isLoading && gamePhase !== 'end_screen' && (
        <>
          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            {gamePhase === 'scenario_step' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenarioStep} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'options' && (
              <>
                {questionText && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: '15px 30px', borderRadius: '12px', maxWidth: '800px', textAlign: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 'normal' }}>
                      {questionText}
                    </h2>
                  </div>
                )}
                
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                  {currentOptions.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i); 
                    return (
                      <button 
                        key={i} 
                        className="option-button"
                        onMouseEnter={() => playSound('hover')}
                        onClick={() => handleOptionSelect(opt)} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', 
                          fontSize: '1.1rem', cursor: 'pointer', borderRadius: '8px', 
                          backgroundColor: '#ffffff', color: '#333', border: 'none',
                          borderBottom: '4px solid #ff9900', maxWidth: '350px', 
                          textAlign: 'left', lineHeight: '1.4' 
                        }}
                      >
                        <span style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '32px', height: '32px', borderRadius: '50%',
                          border: '2px solid #ff9900', color: '#ff9900', fontWeight: 'bold',
                          fontSize: '1.1rem', flexShrink: 0
                        }}>
                          {letter}
                        </span>
                        <span>{getFuzzyKey(opt, 'Text')}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {gamePhase === 'response1' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleContinueToResp2} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'response2' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleContinueToInsight} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                View Insight
              </button>
            )}

            {gamePhase === 'insight' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenario} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#ff9900', color: 'white', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}
              >
                Next Scenario
              </button>
            )}

          </div>
          
          <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            <div style={{ color: 'white', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>Scenario {displayScenarioText}</p>
            </div>

            {history.length > 0 && (
              <button 
                className="standard-button"
                onMouseEnter={() => playSound('hover')}
                onClick={handleBack} 
                style={{ alignSelf: 'flex-start', padding: '10px 15px', fontSize: '1rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid #555', boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                ⬅ Back
              </button>
            )}

          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [appState, setAppState] = useState('menu'); 

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'Amazon Ember';
            src: url('/AmazonEmber_Rg.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }

          * {
            font-family: 'Amazon Ember', Arial, sans-serif !important;
          }

          .option-button {
            transition: transform 0.2s cubic-bezier(0.2, 0, 0, 1), margin 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s ease !important;
            margin: 0 8px; 
            box-shadow: 0 4px 6px rgba(0,0,0,0.1) !important;
          }
          .option-button:hover {
            transform: scale(1.05);
            margin: 0 16px; 
            box-shadow: 0 10px 20px rgba(0,0,0,0.2) !important;
          }

          .standard-button {
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }
          .standard-button:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 12px rgba(0,0,0,0.3) !important;
          }
        `}
      </style>
      
      {appState === 'menu' && <MainMenu onStart={() => setAppState('instructions')} />}
      {appState === 'instructions' && <InstructionsScreen onBegin={() => setAppState('game')} />}
      {appState === 'game' && <Game />}
    </>
  );
}