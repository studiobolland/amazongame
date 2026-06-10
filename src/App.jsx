import { useEffect, useState, useRef } from 'react';
import Papa from 'papaparse';
import { useRive, Layout, Fit, Alignment } from '@rive-app/react-webgl2';

const SCENARIO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=1742593725&single=true&output=csv';
const RESPONSE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=1670179409&single=true&output=csv';
const MAIN_MENU_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=19702636&single=true&output=csv';
const TUTORIAL_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=402147878&single=true&output=csv';
const SCORE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=279755321&single=true&output=csv';
const INTRO_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRN7Bn-OFwwB_FiFhDCdqGi5GOG7CpFI9NtRbW8nl3OUV73MwNR2tFTqUg03mj_Pw/pub?gid=1053722439&single=true&output=csv';

// --- SOUND EFFECTS (SFX) CONFIGURATION ---
const SFX_URLS = {
  hover: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',     
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',     
  popup: 'https://assets.mixkit.co/active_storage/sfx/2997/2997-preview.mp3',     
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',   
  fail: 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3',      
  complete: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'   
};

// 👇 NEW: Global mute flag for SFX
let globalIsMuted = false; 

const playSound = (type) => {
  if (globalIsMuted) return; // 👇 NEW: Skip playing if muted
  
  if (SFX_URLS[type]) {
    const audio = new Audio(SFX_URLS[type]);
    audio.volume = 0.3; 
    audio.play().catch(e => console.log("Audio blocked by browser autoplay policy until interacted with."));
  }
};

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

// --- Map character names to their exact Rive Nested ViewModel names ---
const NESTED_VM_MAP = {
  'sophia': 'VM_sophia',
  'marek': 'VM_Marek',
  'lukas': 'VM_LUKAS',
  'dominika': 'VM_dominika',
  'emma': 'VM_EMMA',
  'alessandro': 'VM_Alessandro'
};

// --- 1. MAIN MENU ---
function MainMenu({ onStart, ui }) {
  // Dynamically pull the languages from the CSV
  const languagesArray = (ui['Languages'] || 'English').split(',').map(l => l.trim());
  const [language, setLanguage] = useState(languagesArray[0] || 'English');

  const { RiveComponent: LogoRive } = useRive({
    src: `${import.meta.env.BASE_URL}logo.riv`, 
    stateMachines: 'State Machine 1', 
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) 
  });

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
      
      {/* 👇 CHANGED: Reduced height from 300px to 190px to match the 812x506 artboard aspect ratio */}
      <div style={{ width: '300px', height: '190px', marginBottom: '-20px' }}>
        <LogoRive />
      </div>

      <h1 style={{ fontSize: '3rem', marginBottom: '30px', textAlign: 'center', padding: '0 20px', lineHeight: '1.2' }}>
        {ui['Title'] || 'Under Pressure: Lead the Shift'}
      </h1>
      
      <div style={{ marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        <label htmlFor="language-select" style={{ fontSize: '1.1rem', color: '#666' }}>{ui['Text'] || 'Choose your language:'}</label>
        <select 
          id="language-select"
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ 
            padding: '10px 15px', fontSize: '1.1rem', borderRadius: '8px', 
            border: '2px solid #ddd', backgroundColor: '#f8f9fa', color: '#333',
            cursor: 'pointer', outline: 'none', minWidth: '200px'
          }}
        >
          {languagesArray.map(lang => (
            <option key={lang} value={lang}>{lang}</option>
          ))}
        </select>
      </div>

      <button 
        className="standard-button" 
        onMouseEnter={() => playSound('hover')}
        onClick={() => { playSound('click'); onStart(); }} 
        style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
      >
        {ui['Button Text'] || 'Start Game'}
      </button>
    </div>
  );
}

// --- 1.2 INTRO / WELCOME SCREEN ---
function IntroScreen({ onNext, ui }) {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ff9900', backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${import.meta.env.BASE_URL}BackgroundWarehouse.svg')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', color: '#333', padding: '10px', boxSizing: 'border-box' }}>
      
      <div style={{ maxWidth: '700px', width: '100%', backgroundColor: '#ffffff', padding: 'clamp(30px, 5vh, 50px)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}>
        
        <h2 style={{ fontSize: 'clamp(2rem, 4vh, 2.8rem)', margin: '0 0 20px 0', color: '#ff9900', lineHeight: '1.2' }}>
          {ui['Title'] || 'Welcome to the Shift'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: 'clamp(1.1rem, 2vh, 1.25rem)', marginBottom: '40px', color: '#555' }}>
          <p style={{ margin: 0 }}>
            {ui['Text 1'] || "In this simulation, you will step into the shoes of a shift lead managing a busy fulfillment center."}
          </p>
          <p style={{ margin: 0 }}>
            {ui['Text 2'] || "You will face 10 realistic scenarios. For each one, you must choose the best response from the multiple-choice options provided."}
          </p>
          <p style={{ margin: 0 }}>
            {ui['Text 3'] || "Keep an eye on the timer! Some choices require quick thinking. Your decisions will directly impact your team's trust, clarity, and overall performance."}
          </p>
        </div>

        <button 
          className="standard-button" 
          onMouseEnter={() => playSound('hover')}
          onClick={() => { playSound('click'); onNext(); }} 
          style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
        >
          {ui['Button Text'] || "View Scoring Guide"}
        </button>
        
      </div>
    </div>
  );
}

// --- 1.5 INSTRUCTIONS SCREEN ---
function InstructionsScreen({ onBegin, ui }) {
  return (
    <div style={{ 
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      color: '#333', padding: '10px', boxSizing: 'border-box',
      backgroundColor: '#ff9900',
      /* 👇 CHANGED: Added a 20% black linear-gradient directly over the background image */
      backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url('${import.meta.env.BASE_URL}BackgroundWarehouse.svg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      
      <div style={{ maxWidth: '800px', width: '100%', maxHeight: '95vh', overflowY: 'auto', backgroundColor: '#ffffff', padding: 'clamp(20px, 4vh, 40px)', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
        
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vh, 2.5rem)', margin: '0 0 clamp(10px, 2vh, 20px) 0', textAlign: 'center', color: '#ff9900', flexShrink: 0 }}>
          {ui['Title'] || 'Scoring Guide'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', fontSize: 'clamp(0.85rem, 1.8vh, 1rem)', marginBottom: 'clamp(15px, 2vh, 25px)', flexShrink: 0, textAlign: 'center' }}>
          
          {/* Block 1 */}
          {(ui['Points 1'] || ui['Text 1']) && (
            <div style={{ flex: 1, padding: '0 15px', borderRight: '1px solid #ddd' }}>
              {ui['Points 1'] && <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{ui['Points 1']}</h3>}
              {ui['Text 1'] && <p style={{ margin: 0 }}>{ui['Text 1']}</p>}
            </div>
          )}

          {/* Block 2 */}
          {(ui['Points 2'] || ui['Text 2']) && (
            <div style={{ flex: 1, padding: '0 15px', borderRight: '1px solid #ddd' }}>
              {ui['Points 2'] && <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{ui['Points 2']}</h3>}
              {ui['Text 2'] && <p style={{ margin: 0 }}>{ui['Text 2']}</p>}
            </div>
          )}

          {/* Block 3 */}
          {(ui['Points 3'] || ui['Points 4'] || ui['Text 3']) && (
            <div style={{ flex: 1, padding: '0 15px' }}>
              {(ui['Points 3'] || ui['Points 4']) && <h3 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#333' }}>{ui['Points 3'] || ui['Points 4']}</h3>}
              {ui['Text 3'] && <p style={{ margin: 0 }}>{ui['Text 3']}</p>}
            </div>
          )}
        </div>

        {/* Extra 'Remember' text blocks centered below the columns */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(15px, 2vh, 25px)' }}>
          {ui['Text 4'] && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>{ui['Text 4']}</p>
            </div>
          )}
          {ui['Key Text'] && (
            <div style={{ marginTop: '10px' }}>
              <p style={{ margin: 0, fontSize: '1.0rem' }}>{ui['Key Text']}</p>
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#fff', marginBottom: 'clamp(15px, 3vh, 30px)', flexShrink: 0 }}>
          <h3 style={{ margin: '0 0 clamp(8px, 1.5vh, 15px) 0', fontSize: 'clamp(0.9rem, 2vh, 1rem)', textAlign: 'center' }}>
            {ui['Key Heading'] || '🏆 Final Score Key'}
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            
            {/* Grade 5 */}
            <div style={{ backgroundColor: '#206ca4', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {/* 👇 CHANGED: Added whiteSpace: 'pre-wrap' */}
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>{ui['Key 1'] || 'EXCELLENT'}</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>{ui['Key 1 Text'] || 'Above 250'}</div>
            </div>

            {/* Grade 4 */}
            <div style={{ backgroundColor: '#2ea39b', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              {/* 👇 CHANGED: Added whiteSpace: 'pre-wrap' */}
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>{ui['Key 2'] || 'GOOD'}</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>{ui['Key 2 Text'] || '151 - 250'}</div>
            </div>

            {/* Grade 3 */}
            <div style={{ backgroundColor: '#7ab758', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line></svg>
              {/* 👇 CHANGED: Added whiteSpace: 'pre-wrap' */}
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>{ui['Key 3'] || 'FAIR'}</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>{ui['Key 3 Text'] || '51 - 150'}</div>
            </div>

            {/* Grade 2 */}
            <div style={{ backgroundColor: '#f29b38', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
              {/* 👇 CHANGED: Added whiteSpace: 'pre-wrap' */}
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>{ui['Key 4'] || 'POOR'}</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>{ui['Key 4 Text'] || '0 - 50'}</div>
            </div>

            {/* Grade 1 */}
            <div style={{ backgroundColor: '#df3f38', color: 'white', borderRadius: '6px', padding: '10px 5px', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1 1 0', minWidth: '85px', textAlign: 'center' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
              {/* 👇 CHANGED: Added whiteSpace: 'pre-wrap' */}
              <div style={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 1.5vh, 0.9rem)', lineHeight: '1.2', whiteSpace: 'pre-wrap' }}>{ui['Key 5'] || 'VERY POOR'}</div>
              <div style={{ fontSize: 'clamp(0.65rem, 1.2vh, 0.8rem)', marginTop: '4px' }}>{ui['Key 5 Text'] || 'Below 0'}</div>
            </div>
            
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={() => { playSound('click'); onBegin(); }} 
            style={{ padding: 'clamp(10px, 2vh, 15px) clamp(20px, 4vw, 30px)', fontSize: 'clamp(1rem, 2.5vh, 1.2rem)', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
          >
            {ui['Button Text'] || "Let's Begin"}
          </button>
        </div>
        
      </div>
    </div>
  );
}
// --- 2. GAME COMPONENT ---
function Game({ isMuted, isTimerEnabled, ui }) {
  const tutUi = ui.tutorial || {};
  const scoreUi = ui.score || {};
  const [scenarios, setScenarios] = useState([]);
  const [responses, setResponses] = useState([]);
  
  const [scenarioRowIndex, setScenarioRowIndex] = useState(0); 
  const [gamePhase, setGamePhase] = useState('scenario_step'); 
  const [selectedResponse, setSelectedResponse] = useState(null); 
  const [totalPoints, setTotalPoints] = useState(0);
  const [isRiveReady, setIsRiveReady] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10); 
  const [isTimeoutFlow, setIsTimeoutFlow] = useState(false); // 👇 NEW: Tracks if we are in a timeout 
  const lastPlayedPhase = useRef(''); 
  const displayedProgress = useRef(0); 
  const progressAnimRef = useRef(null); 

  const bgmPlayer = useRef(null);
  const currentBgmSrc = useRef('');
  const ambiencePlayer = useRef(null);
  const currentAmbienceSrc = useRef('');
  
  const [history, setHistory] = useState([]);

  const { rive, RiveComponent } = useRive({
    src: `${import.meta.env.BASE_URL}game.riv`, 
    artboard: 'MAIN',
    stateMachines: 'State Machine 1',
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Layout, alignment: Alignment.Center }),
    onLoad: () => setIsRiveReady(true)
  });

  // 👇 NEW: Load the Logo specifically for the End Screen
  const { RiveComponent: LogoRive } = useRive({
    src: `${import.meta.env.BASE_URL}logo.riv`, 
    stateMachines: 'State Machine 1', 
    autoplay: true,
    autoBind: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }) 
  });

  // 👇 UPDATED: Cleanup both audio tracks when the game component unmounts
  useEffect(() => {
    return () => {
      if (bgmPlayer.current) {
        bgmPlayer.current.pause();
        bgmPlayer.current = null;
      }
      if (ambiencePlayer.current) {
        ambiencePlayer.current.pause();
        ambiencePlayer.current = null;
      }
    };
  }, []);

  // 👇 UPDATED: Watch for mute toggles and dynamically update BOTH active tracks
  useEffect(() => {
    if (bgmPlayer.current) bgmPlayer.current.muted = isMuted;
    if (ambiencePlayer.current) ambiencePlayer.current.muted = isMuted;
  }, [isMuted]);

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

// 👇 UPDATED: Restored standard AUTO ADVANCE TIMER
  useEffect(() => {
    if (gamePhase === 'points_award') {
      const timer = setTimeout(() => {
        setGamePhase('response2'); 
      }, 1500); 
      return () => clearTimeout(timer); 
    }
  }, [gamePhase]);

  // 👇 UPDATED: Countdown Timer Logic
  useEffect(() => {
    if (!isTimerEnabled) return; 

    // 👇 THIS is the crucial line that prevents the ReferenceError!
    let timerId; 

    if (gamePhase === 'options' && timeLeft > 0) {
      timerId = setTimeout(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (gamePhase === 'options' && timeLeft === 0 && !isTimeoutFlow) {
      // Time is up! Flag it, play the fail sound, and STAY on the options screen.
      playSound('fail');
      setIsTimeoutFlow(true);
    }
    
    return () => clearTimeout(timerId);
  }, [gamePhase, timeLeft, isTimerEnabled, isTimeoutFlow]);

  // 👇 NEW: Developer Cheat Code (Shift + 0-9 to skip scenarios)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check if Shift is held and a number key is pressed
      if (e.shiftKey && e.code.startsWith('Digit')) {
        const targetIndex = parseInt(e.code.replace('Digit', ''), 10);
        
        // Ensure the scenario actually exists before jumping
        if (scenarios.length > 0 && targetIndex >= 0 && targetIndex < scenarios.length) {
          console.log(`🛠️ DEV CHEAT: Jumping to scenario index ${targetIndex}`);
          setScenarioRowIndex(targetIndex);
          setGamePhase('scenario_step');
          setSelectedResponse(null);
          
          // Clear any running Rive popups
          if (rive && rive.viewModelInstance) {
            rive.viewModelInstance.enum('popup_type_enum').value = 'None';
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scenarios, rive]);


// RIVE UPDATES
  useEffect(() => {
    if (!isRiveReady || !rive || scenarios.length === 0) return;
    const viewModel = rive.viewModelInstance;
    if (!viewModel) return;

    // 👇 UPDATED: Handle both end screens
    if (gamePhase === 'pre_end_screen' || gamePhase === 'end_screen') {
      if (gamePhase === 'pre_end_screen') playSound('complete'); 
      try {
        viewModel.number('currentProgress').value = 100;
        viewModel.string('completePercentage').value = '100%';
        viewModel.enum('popup_type_enum').value = 'None'; // Hide any lingering popups
      } catch (e) {
        console.error("Progress update error:", e);
      }
      return;
    }

    const currentStepId = `${gamePhase}_${scenarioRowIndex}`;
    if (lastPlayedPhase.current === currentStepId) return; 
    lastPlayedPhase.current = currentStepId; 

    const currentScenarioRow = scenarios[scenarioRowIndex];
    if (!currentScenarioRow) return;

    // 👇 UPDATED: Background Audio & Ambience checking logic
    
    // 1. Process Music
    const musicRaw = getFuzzyKey(currentScenarioRow, 'Music');
    const musicStr = musicRaw ? String(musicRaw).trim() : '';
    const isValidMusic = musicStr !== '' && musicStr.toUpperCase() !== 'NA' && musicStr.toUpperCase() !== 'N/A';

    if (isValidMusic && musicStr !== currentBgmSrc.current) {
      if (bgmPlayer.current) bgmPlayer.current.pause();
      currentBgmSrc.current = musicStr;
      
      bgmPlayer.current = new Audio(`${import.meta.env.BASE_URL}${musicStr}`);
      bgmPlayer.current.loop = true; 
      bgmPlayer.current.volume = 0.3; 
      bgmPlayer.current.muted = isMuted;
      
      bgmPlayer.current.play().catch(e => console.log("Music autoplay blocked by browser."));
    }

    // 2. Process Ambience
    const ambienceRaw = getFuzzyKey(currentScenarioRow, 'Ambience');
    const ambienceStr = ambienceRaw ? String(ambienceRaw).trim() : '';
    const isValidAmbience = ambienceStr !== '' && ambienceStr.toUpperCase() !== 'NA' && ambienceStr.toUpperCase() !== 'N/A';

    if (isValidAmbience && ambienceStr !== currentAmbienceSrc.current) {
      if (ambiencePlayer.current) ambiencePlayer.current.pause();
      currentAmbienceSrc.current = ambienceStr;
      
      ambiencePlayer.current = new Audio(`${import.meta.env.BASE_URL}${ambienceStr}`);
      ambiencePlayer.current.loop = true; 
      ambiencePlayer.current.volume = 0.3; 
      ambiencePlayer.current.muted = isMuted;
      
      ambiencePlayer.current.play().catch(e => console.log("Ambience autoplay blocked by browser."));
    }
    // 👆 END OF NEW AUDIO LOGIC

    try {
      // 1. Find total number of multiple-choice questions in the entire game
      const totalQuestions = scenarios.filter(row => {
        const raw = getFuzzyKey(row, 'Responses');
        const str = raw ? String(raw).trim().toUpperCase() : '';
        return str !== '' && str !== 'NA' && str !== 'N/A';
      }).length || 10; 

      // 2. Count how many questions we have fully passed prior to the current row
      let questionsAnswered = scenarios.slice(0, scenarioRowIndex).filter(row => {
        const raw = getFuzzyKey(row, 'Responses');
        const str = raw ? String(raw).trim().toUpperCase() : '';
        return str !== '' && str !== 'NA' && str !== 'N/A';
      }).length;

      // 3. If we are currently ON a question row, and have made a choice, add 1
      const currentRaw = getFuzzyKey(currentScenarioRow, 'Responses');
      const currentStr = currentRaw ? String(currentRaw).trim().toUpperCase() : '';
      const currentIsQuestion = currentStr !== '' && currentStr !== 'NA' && currentStr !== 'N/A';

      if (currentIsQuestion && (gamePhase === 'response1' || gamePhase === 'points_award' || gamePhase === 'response2' || gamePhase === 'insight')) {
        questionsAnswered += 1;
      }

      // 4. Calculate the target percentage
      const targetProgressVal = Math.round((questionsAnswered / totalQuestions) * 100);

      // 5. Animate to the new target over 1000ms if it has changed!
      if (targetProgressVal !== displayedProgress.current) {
        const startProgress = displayedProgress.current;
        const duration = 1000; 
        const startTime = performance.now();

        if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);

        const animateProgress = (currentTime) => {
          const elapsedTime = currentTime - startTime;
          const progressRatio = Math.min(elapsedTime / duration, 1);
          const currentVal = Math.round(startProgress + (targetProgressVal - startProgress) * progressRatio);

          try {
            viewModel.number('currentProgress').value = currentVal;
            viewModel.string('completePercentage').value = `${currentVal}%`;
          } catch (e) {}

          if (progressRatio < 1) {
            progressAnimRef.current = requestAnimationFrame(animateProgress);
          } else {
            displayedProgress.current = targetProgressVal;
          }
        };
        progressAnimRef.current = requestAnimationFrame(animateProgress);
      } else {
        viewModel.number('currentProgress').value = targetProgressVal;
        viewModel.string('completePercentage').value = `${targetProgressVal}%`;
      }

      // Automatically reset all characters' isTalking property to false on any step/phase change
      Object.values(NESTED_VM_MAP).forEach(vmName => {
        try {
          const charVm = viewModel.viewModel(vmName);
          if (charVm && charVm.boolean('isTalking')) {
            charVm.boolean('isTalking').value = false;
          }
        } catch (e) {}
      });

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
        const finalActiveChar = activeChar !== 'None' ? activeChar : popupChar;
        
        viewModel.enum('active_character').value = finalActiveChar;
        viewModel.enum('popup_char_enum').value = popupChar;
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable so we can verify it below
        const popupTypeStr = String(getFuzzyKey(currentScenarioRow, 'Pop-Up Type') || getFuzzyKey(currentScenarioRow, 'Set-up Type') || 'None').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(currentScenarioRow, 'Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;
        
        const vmName = NESTED_VM_MAP[finalActiveChar.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(currentScenarioRow, 'Set-up Text') || getFuzzyKey(currentScenarioRow, 'Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable
        const popupTypeStr = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        // 👇 CHANGED: Extracted popupTypeStr to a variable
        const popupTypeStr = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        viewModel.enum('popup_type_enum').value = popupTypeStr;
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 UPDATED: Added a check so isTalking remains false if it's a Thought Bubble
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking') && popupTypeStr !== 'Thought Bubble') {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      }
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 NEW: Turn talking on for response 1 character
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking')) {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
          // 👇 NEW: Turn talking on for response 2 character
          try {
            if (viewModel.viewModel(vmName).boolean('isTalking')) {
              viewModel.viewModel(vmName).boolean('isTalking').value = true;
            }
          } catch(e) {}
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      }
      else if (gamePhase === 'options') {
        viewModel.enum('popup_type_enum').value = 'None';
        viewModel.enum('popup_char_enum').value = 'None';
      }
      else if (gamePhase === 'response1' && selectedResponse) {
        const resp1Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 1 Character'));
        viewModel.enum('active_character').value = resp1Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 1 Type') || getFuzzyKey(selectedResponse, 'Reponse 1 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 1 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp1Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 1 Text') || getFuzzyKey(selectedResponse, 'Reponse 1 Text') || '').trim();
        
        viewModel.trigger('show_popup').trigger();
        playSound('popup');
      } 
      else if (gamePhase === 'points_award' && selectedResponse) {
        viewModel.enum('popup_type_enum').value = 'None';

        const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
        const pointsMatch = String(rawPoints).match(/-?\d+/);
        const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
        const formattedPointsGained = pointsGained > 0 ? `+${pointsGained}` : pointsGained.toString();
        
        viewModel.string('points_text').value = totalPoints.toString();
        viewModel.string('points_gained_text').value = formattedPointsGained; 
        
        if (pointsGained === 0) {
          viewModel.trigger('zero_trigger').trigger();
        }
      }
      else if (gamePhase === 'response2' && selectedResponse) {
        const resp2Char = cleanCharName(getFuzzyKey(selectedResponse, 'Response 2 Character'));
        viewModel.enum('popup_char_enum').value = resp2Char;
        viewModel.enum('active_character').value = resp2Char; 
        
        viewModel.enum('popup_type_enum').value = String(getFuzzyKey(selectedResponse, 'Response 2 Type') || getFuzzyKey(selectedResponse, 'Reponse 2 Type') || 'Speech Bubble').trim();
        
        const emotionStr = String(getFuzzyKey(selectedResponse, 'Response 2 Emotion') || 'Neutral').trim();
        viewModel.enum('emotion_enum').value = emotionStr;

        const vmName = NESTED_VM_MAP[resp2Char.toLowerCase()];
        if (vmName && viewModel.viewModel(vmName)) {
          viewModel.viewModel(vmName).enum('States').value = emotionStr;
        }

        viewModel.string('dialogue_text').value = String(getFuzzyKey(selectedResponse, 'Response 2 Text') || getFuzzyKey(selectedResponse, 'Reponse 2 Text') || '').trim();
        
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

  const currentScenarioRow = scenarios[scenarioRowIndex] || {};
  const rawResponseValue = getFuzzyKey(currentScenarioRow, 'Responses');
  const responsesTextStr = rawResponseValue ? String(rawResponseValue).trim().toUpperCase() : '';
  const hasOptions = responsesTextStr !== '' && responsesTextStr !== 'NA' && responsesTextStr !== 'N/A';

  const responseNumberMatch = String(rawResponseValue).match(/\d+/);
  const optionMatchNumber = responseNumberMatch ? parseInt(responseNumberMatch[0], 10) : null;

  const currentOptions = hasOptions 
    ? responses.filter(r => {
        const optVal = getFuzzyKey(r, 'Option') || '';
        const match = String(optVal).match(/\d+/);
        const parsedOpt = match ? parseInt(match[0], 10) : null;
        return parsedOpt === optionMatchNumber;
      })
    : [];

  const questionText = currentOptions.length > 0 ? getFuzzyKey(currentOptions[0], 'Question') : null;

  const saveHistoryState = () => {
    setHistory(prev => [...prev, {
      scenarioRowIndex,
      gamePhase,
      selectedResponse,
      totalPoints
    }]);
  };

  const handleReplay = () => {
    playSound('click');
    if (rive && rive.viewModelInstance) {
      rive.viewModelInstance.enum('popup_type_enum').value = 'None';
      rive.viewModelInstance.trigger('hide_insight').trigger();
    }
    
    lastPlayedPhase.current = ''; 
    displayedProgress.current = 0;
    if (progressAnimRef.current) cancelAnimationFrame(progressAnimRef.current);

    // 👇 UPDATED: Stop both music and ambience on replay
    if (bgmPlayer.current) {
      bgmPlayer.current.pause();
      currentBgmSrc.current = '';
    }
    if (ambiencePlayer.current) {
      ambiencePlayer.current.pause();
      currentAmbienceSrc.current = '';
    }

    setTimeout(() => {
      setScenarioRowIndex(0);
      setGamePhase('scenario_step');
      setSelectedResponse(null);
      setTotalPoints(0);
      setHistory([]);
      setIsTimeoutFlow(false); // 👇 NEW
    }, 150);
  };

  const handleNextScenarioStep = () => {
    playSound('click');
    saveHistoryState();
    
    if (hasOptions) {
      // 👇 NEW: Dynamically fetch the timer from the Google Sheet
      const currentScenarioRow = scenarios[scenarioRowIndex] || {};
      const rawTimerValue = getFuzzyKey(currentScenarioRow, 'Timer');
      const parsedTimer = parseInt(rawTimerValue, 10);
      
      // Fallback to 10 seconds if the cell is completely blank or invalid
      const finalTimerValue = !isNaN(parsedTimer) && parsedTimer > 0 ? parsedTimer : 10; 

      setTimeLeft(finalTimerValue); 
      setGamePhase('options');
    } else {
      if (scenarioRowIndex < scenarios.length - 1) {
        setScenarioRowIndex(prev => prev + 1); 
      } else {
        setGamePhase('pre_end_screen'); 
      }
    }
  };

  const handleOptionSelect = (responseRow) => {
    playSound('click');
    saveHistoryState();
    
    let finalResponse = responseRow;
    
    // If they are clicking after a timeout, force points to 0
    if (isTimeoutFlow) {
      finalResponse = {
        ...responseRow,
        'Points': '0',
        'Click to reveal': `[TIME OUT] ${getFuzzyKey(responseRow, 'Click to reveal') || ''}`
      };
    }

    setSelectedResponse(finalResponse);
    setGamePhase('response1');
  };

  const handleContinueToResp2 = () => {
    playSound('click');
    saveHistoryState();
    
    const rawPoints = getFuzzyKey(selectedResponse, 'Points') || '0';
    const pointsMatch = String(rawPoints).match(/-?\d+/);
    const pointsGained = pointsMatch ? parseInt(pointsMatch[0], 10) : 0;
    
    if (pointsGained > 0) playSound('success');
    else if (pointsGained < 0) playSound('fail');

    setTotalPoints(prev => prev + pointsGained);
    setGamePhase('points_award'); 
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
    setIsTimeoutFlow(false); 
    if (scenarioRowIndex < scenarios.length - 1) {
      setScenarioRowIndex(prev => prev + 1); 
      setGamePhase('scenario_step');
      setSelectedResponse(null);
    } else {
      setGamePhase('pre_end_screen'); 
    }
  };

  const isLoading = !isRiveReady || scenarios.length === 0 || responses.length === 0;
  
  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden', position: 'relative', backgroundColor: '#111' }}>
      
      {isLoading && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          <h2>{tutUi['Loading Text'] || 'Loading Simulation...'}</h2>
        </div>
      )}

      {/* 👇 NEW: Pre-End Transition Screen */}
      {gamePhase === 'pre_end_screen' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', margin: '0 0 40px 0', lineHeight: '1.2', textAlign: 'center', padding: '0 20px' }}>
            {scoreUi['Ending Title'] || 'Shift Complete!'}
          </h1>
          
          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={() => { playSound('click'); setGamePhase('end_screen'); }} 
            style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
          >
            {scoreUi['End Button Text'] || 'See Results'}
          </button>
        </div>
      )}

      {gamePhase === 'end_screen' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff', color: '#333' }}>
          
          
      <div style={{ width: '300px', height: '190px', marginBottom: '-20px' }}>
        <LogoRive />
      </div>

          <h1 style={{ fontSize: '4rem', margin: '0 0 30px 0', lineHeight: '1.2' }}>{scoreUi['Title'] || 'Shift Complete!'}</h1>
          
          <p style={{ fontSize: '2rem', margin: '0 0 15px 0', color: '#666' }}>
            {scoreUi['Score Text'] || 'Final Score:'} <strong style={{ color: '#ff9900' }}>{totalPoints}</strong>
          </p>
          
          <p style={{ fontSize: '1.8rem', margin: '0 0 50px 0', fontWeight: 'bold' }}>
            {scoreUi['Rating Text'] || 'Rating'}: <span style={{ 
              color: totalPoints < 0 ? '#df3f38' : 
                     totalPoints <= 50 ? '#f29b38' : 
                     totalPoints <= 150 ? '#7ab758' : 
                     totalPoints <= 250 ? '#2ea39b' : '#206ca4' 
            }}>
              {totalPoints < 0 ? tutUi['Key 5'] : 
               totalPoints <= 50 ? tutUi['Key 4'] : 
               totalPoints <= 150 ? tutUi['Key 3'] : 
               totalPoints <= 250 ? tutUi['Key 2'] : tutUi['Key 1']}
            </span>
          </p>

          <button 
            className="standard-button" 
            onMouseEnter={() => playSound('hover')}
            onClick={handleReplay} 
            style={{ padding: '15px 40px', fontSize: '1.2rem', cursor: 'pointer', backgroundColor: '#ff9900', color: 'white', borderRadius: '8px', border: 'none', fontWeight: 'bold' }}
          >
            {scoreUi['Button Text'] || 'Replay Game'}
          </button>
        </div>
      )}

      <RiveComponent style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 1 }} />

      {!isLoading && gamePhase !== 'end_screen' && gamePhase !== 'pre_end_screen' && (
        <>
          {/* 👇 NEW: Visual Timer */}
          {isTimerEnabled && gamePhase === 'options' && (
            <div style={{
              position: 'absolute',
              top: '40px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: timeLeft <= 3 ? '#df3f38' : '#333', // Turns red at 3 seconds
              color: 'white',
              padding: '10px 25px',
              borderRadius: '30px',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              zIndex: 100,
              border: '0px solid #000',
              transition: 'background-color 0.3s ease'
            }}>
              ⏱️ {timeLeft}s
            </div>
          )}

          <div style={{ position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            
            {gamePhase === 'scenario_step' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenarioStep} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'options' && (
              <>
                {questionText && (
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', padding: '15px 30px', borderRadius: '12px', maxWidth: '800px', textAlign: 'center' }}>
                    <h2 style={{ margin: 0, color: 'white', fontSize: '1.4rem', fontWeight: 'normal' }}>
                      {questionText}
                    </h2>
                  </div>
                )}
                
                {/* 👇 CHANGED: alignItems switched from 'center' to 'stretch' for equal heights */}
            
                <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', alignItems: 'stretch', width: '100%', maxWidth: '1200px' }}>
                  {currentOptions.map((opt, i) => {
                    const letter = String.fromCharCode(65 + i); 
                    
                    const rawPoints = getFuzzyKey(opt, 'Points') || '0';
                    const ptsMatch = String(rawPoints).match(/-?\d+/);
                    const isCorrectOption = ptsMatch && parseInt(ptsMatch[0], 10) === 50;
                    
                    const isFaded = isTimeoutFlow && !isCorrectOption;
                    const isHighlighted = isTimeoutFlow && isCorrectOption;

                    const bgColor = isHighlighted ? '#7ab758' : '#ffffff';
                    const textColor = isHighlighted ? 'white' : '#333';
                    const borderColor = isHighlighted ? '#7ab758' : '#ff9900';
                    const circleColor = isHighlighted ? 'white' : '#ff9900';

                    return (
                      <button 
                        key={i} 
                        className="option-button"
                        onMouseEnter={() => { if (!isFaded) playSound('hover'); }}
                        onClick={() => { if (!isFaded) handleOptionSelect(opt); }} 
                        style={{ 
                          display: 'flex', alignItems: 'center', gap: '12px', padding: '15px 20px', 
                          fontSize: '1.1rem', borderRadius: '8px', 
                          backgroundColor: bgColor, color: textColor, border: 'none',
                          borderBottom: `4px solid ${borderColor}`, 
                          /* 👇 CHANGED: Swapped rigid width for responsive flex properties */
                          flex: '1 1 250px', maxWidth: '350px', 
                          textAlign: 'left',
                          opacity: isFaded ? 0.3 : 1, 
                          cursor: isFaded ? 'default' : 'pointer',
                          pointerEvents: isFaded ? 'none' : 'auto', 
                          transition: 'all 250ms ease'
                        }}
                      >
                        <span style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '32px', height: '32px', borderRadius: '50%',
                          border: `2px solid ${circleColor}`, color: circleColor, fontWeight: 'bold',
                          fontSize: '1.1rem', flexShrink: 0, 
                          transition: 'all 250ms ease'
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
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                Continue
              </button>
            )}

            {gamePhase === 'response2' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleContinueToInsight} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#fff', color: 'black', border: 'none' }}
              >
                View Insight
              </button>
            )}

            {gamePhase === 'insight' && (
              <button 
                className="standard-button" 
                onMouseEnter={() => playSound('hover')}
                onClick={handleNextScenario} 
                style={{ padding: '15px 30px', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '8px', backgroundColor: '#ff9900', color: 'white', border: 'none' }}
              >
                {/* 👇 CHANGED: Dynamically fetches "Button Text" from the current Scenario row, falls back to "Next Scenario" if blank */}
                {getFuzzyKey(scenarios[scenarioRowIndex] || {}, 'Button Text') || 'Next Scenario'}
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
  const [isMuted, setIsMuted] = useState(false); 
  const [isTimerEnabled, setIsTimerEnabled] = useState(true); 
  
  // State to hold our spreadsheet copy objects
  const [uiConfig, setUiConfig] = useState(null); 
  
  const menuAudioRef = useRef(null);

  // DATA FETCHING FOR ALL UI SHEETS
  useEffect(() => {
    const fetchCsv = (url) => new Promise(resolve => {
      // 👇 CHANGED: Removed the hardcoded URL block so it actually fetches your sheet!
      if (!url) return resolve({}); 
      
      Papa.parse(url + `&t=${Date.now()}`, {
        download: true, 
        header: true, 
        skipEmptyLines: true,
        complete: (results) => resolve(results.data[0] || {})
      });
    });

    Promise.all([
      fetchCsv(MAIN_MENU_CSV_URL), 
      fetchCsv(INTRO_CSV_URL), 
      fetchCsv(TUTORIAL_CSV_URL), 
      fetchCsv(SCORE_CSV_URL)
    ])
      .then(([mainMenuData, introData, tutorialData, scoreData]) => {
        setUiConfig({ main: mainMenuData, intro: introData, tutorial: tutorialData, score: scoreData });
        
        const shouldEnableTimer = String(mainMenuData['Timer']).toUpperCase() === 'TRUE';
        setIsTimerEnabled(shouldEnableTimer);
      });
  }, []);

  // 2. Stop the menu music when the game actually starts
  useEffect(() => {
    if (appState === 'game' && menuAudioRef.current) {
      menuAudioRef.current.pause();
    }
  }, [appState]);

  // 3. Sync the React state with the global SFX flag and Menu Audio
  useEffect(() => {
    globalIsMuted = isMuted;
    if (menuAudioRef.current) {
      menuAudioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  // Block the app from rendering until our copy has loaded
  if (!uiConfig) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111', color: 'white', fontFamily: 'Arial, sans-serif' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'Amazon Ember';
            src: url('${import.meta.env.BASE_URL}AmazonEmber_Rg.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          * {
            font-family: 'Amazon Ember', Arial, sans-serif !important;
            line-height: 1.6;
          }
          /* 👇 CHANGED: Merged "all 250ms ease" into the !important rule so colors/opacity can fade */
          .option-button { transition: all 250ms ease, transform 0.2s cubic-bezier(0.2, 0, 0, 1), margin 0.2s cubic-bezier(0.2, 0, 0, 1) !important; margin: 0 8px; }
          .option-button:hover { transform: scale(1.05); margin: 0 16px; }
          .standard-button { transition: transform 0.2s ease; }
          .standard-button:hover { transform: scale(1.05); }
        `}
      </style>
      {appState === 'menu' && <MainMenu onStart={() => setAppState('intro')} ui={uiConfig.main} />}
      {appState === 'intro' && <IntroScreen onNext={() => setAppState('instructions')} ui={uiConfig.intro} />}
      {appState === 'instructions' && <InstructionsScreen onBegin={() => setAppState('game')} ui={uiConfig.tutorial} />}
      {appState === 'game' && <Game isMuted={isMuted} isTimerEnabled={isTimerEnabled} ui={uiConfig} />}

      {/* Floating Mute Button */}
      <button
        onClick={() => {
          if (!isMuted) playSound('click');
          setIsMuted(prev => !prev);
        }}
        style={{
          position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, width: '50px', height: '50px', borderRadius: '50%',
          backgroundColor: '#333', color: 'white', border: '2px solid #fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title={isMuted ? "Unmute Audio" : "Mute Audio"}
      >
        {isMuted ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>
    </>
  );
}