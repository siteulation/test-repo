import React from 'react';
import GameCanvas from './components/GameCanvas';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen overflow-hidden bg-black text-white font-sans">
      <GameCanvas />
      
      {/* UI Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none select-none opacity-80">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-blue-500 drop-shadow-lg">
          DeltaBall
        </h1>
        <div className="mt-2 text-sm text-gray-400 bg-black/50 p-2 rounded backdrop-blur-sm border border-white/10 inline-block">
          <p className="flex items-center gap-2">
            <span className="kbd bg-gray-700 px-1 rounded text-xs">WASD</span>
            <span>or</span>
            <span className="kbd bg-gray-700 px-1 rounded text-xs">Arrows</span>
            <span>to move</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 pointer-events-none select-none opacity-50 text-xs text-right">
        <p>Movement Prototype</p>
        <p>React + Canvas</p>
      </div>
    </div>
  );
};

export default App;
